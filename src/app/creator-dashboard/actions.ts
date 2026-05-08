"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function setCreatorSubscriptionPriceAction(userId: string, price1mo: number, price3mo?: number, price12mo?: number) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	// Allow admin or the creator themselves
	if (user.email !== process.env.ADMIN_EMAIL && user.id !== userId) {
		throw new Error("Unauthorized");
	}

	const targetUserId = userId === "me" ? user.id : userId;

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			subscriptionPrice: price1mo,
			subscriptionPrice3mo: price3mo,
			subscriptionPrice12mo: price12mo,
		},
	});

	return { success: true };
}

export async function setCreatorSubscriptionFreeAction(userId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	// Allow admin or the creator themselves
	if (user.email !== process.env.ADMIN_EMAIL && user.id !== userId) {
		throw new Error("Unauthorized");
	}

	const targetUserId = userId === "me" ? user.id : userId;

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			subscriptionPrice: null,
			subscriptionPrice3mo: null,
			subscriptionPrice12mo: null,
		},
	});

	return { success: true };
}

export async function getSubscriptionRequestsAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	const requests = await prisma.subscriptionRequest.findMany({
		where: {
			creatorId: user.id,
			status: "pending",
		},
		include: {
			user: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return requests;
}

export async function approveSubscriptionRequestAction(requestId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	const request = await prisma.subscriptionRequest.findUnique({
		where: { id: requestId },
	});

	if (!request || request.creatorId !== user.id) {
		throw new Error("Unauthorized");
	}

	// Update the subscription request status
	await prisma.subscriptionRequest.update({
		where: { id: requestId },
		data: {
			status: "approved",
			reviewedAt: new Date(),
		},
	});

	// Update the user's subscription status
	await prisma.user.update({
		where: { id: request.userId },
		data: {
			isSubscribed: true,
		},
	});

	// Create a notification for the user
	await prisma.notification.create({
		data: {
			userId: request.userId,
			title: "✅ Suscripción aprobada",
			message: `Tu suscripción a ${user.name} ha sido aprobada.`,
		},
	});

	return { success: true };
}

export async function rejectSubscriptionRequestAction(requestId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	const request = await prisma.subscriptionRequest.findUnique({
		where: { id: requestId },
	});

	if (!request || request.creatorId !== user.id) {
		throw new Error("Unauthorized");
	}

	// Update the subscription request status
	await prisma.subscriptionRequest.update({
		where: { id: requestId },
		data: {
			status: "rejected",
			reviewedAt: new Date(),
		},
	});

	// Create a notification for the user
	await prisma.notification.create({
		data: {
			userId: request.userId,
			title: "❌ Suscripción rechazada",
			message: `Tu suscripción a ${user.name} ha sido rechazada.`,
		},
	});

	return { success: true };
}
