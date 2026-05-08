"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

export async function getMyPlaqueClaimsAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	return prisma.plaqueClaim.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
}

export async function submitPlaqueClaimAction(args: {
	milestone: number;
	nameOnPlaque: string;
	address: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
}) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	const claim = await prisma.plaqueClaim.findUnique({
		where: { userId_milestone: { userId: user.id, milestone: args.milestone } },
	});
	if (!claim) throw new Error("No tienes una placa disponible para reclamar.");

	await prisma.plaqueClaim.update({
		where: { userId_milestone: { userId: user.id, milestone: args.milestone } },
		data: {
			nameOnPlaque: args.nameOnPlaque,
			address: args.address,
			city: args.city,
			state: args.state || null,
			postalCode: args.postalCode,
			country: args.country,
			status: "submitted",
		},
	});

	await prisma.notification.create({
		data: {
			userId: user.id,
			title: "📦 Placa OnlyHub",
			message: `¡Listo! Recibimos tu información para la placa de ${args.milestone.toLocaleString()} seguidores. El equipo OnlyHub la procesará y te avisaremos cuando sea enviada.`,
		},
	});

	revalidatePath("/plaque");
	return { success: true };
}

