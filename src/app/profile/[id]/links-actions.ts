"use server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

export async function getSocialLinksAction(userId: string) {
	const links = await prisma.socialLink.findMany({
		where: { userId, isActive: true },
		orderBy: { order: "asc" },
	});
	return links;
}

export async function addSocialLinkAction(data: { title: string; url: string; icon?: string }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	// Get the highest order number
	const lastLink = await prisma.socialLink.findFirst({
		where: { userId: user.id },
		orderBy: { order: "desc" },
	});

	const newOrder = lastLink ? lastLink.order + 1 : 0;

	const link = await prisma.socialLink.create({
		data: {
			userId: user.id,
			title: data.title,
			url: data.url,
			icon: data.icon || "link",
			order: newOrder,
		},
	});

	revalidatePath(`/profile/${user.id}`);
	return link;
}

export async function deleteSocialLinkAction(linkId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	// Verify ownership
	const link = await prisma.socialLink.findUnique({
		where: { id: linkId },
	});

	if (!link || link.userId !== user.id) {
		throw new Error("Unauthorized");
	}

	await prisma.socialLink.delete({
		where: { id: linkId },
	});

	revalidatePath(`/profile/${user.id}`);
	return { success: true };
}

export async function trackLinkClickAction(linkId: string) {
	await prisma.socialLink.update({
		where: { id: linkId },
		data: {
			clicks: {
				increment: 1,
			},
		},
	});
}
