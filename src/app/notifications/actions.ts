"use server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getNotificationsAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	return prisma.notification.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
		take: 20,
	});
}

export async function markNotificationsReadAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	await prisma.notification.updateMany({
		where: { userId: user.id, isRead: false },
		data: { isRead: true },
	});
}
