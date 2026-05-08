"use server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function submitCreatorRequestAction(message: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	const existing = await prisma.creatorRequest.findUnique({ where: { userId: user.id } });
	if (existing) throw new Error("Ya enviaste una solicitud");

	await prisma.creatorRequest.create({
		data: { userId: user.id, message },
	});

	return { success: true };
}
