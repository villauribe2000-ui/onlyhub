import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { creatorId } = body;

	if (!creatorId) {
		return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
	}

	// Get creator info
	const creator = await prisma.user.findUnique({
		where: { id: creatorId },
		select: { name: true, subscriptionPrice: true, balance: true },
	});

	if (!creator) {
		return NextResponse.json({ error: "Creator not found" }, { status: 404 });
	}

	const subscriptionPrice = creator.subscriptionPrice || 0;

	// Check if user has enough balance
	const userBalance = user.id ? (await prisma.user.findUnique({ where: { id: user.id } }))?.balance || 0 : 0;

	if (userBalance < subscriptionPrice) {
		return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
	}

	// Create subscription
	const planId = "monthly";
	const now = new Date();
	const endDate = new Date(now);
	endDate.setMonth(endDate.getMonth() + 1);

	const subscription = await prisma.subscription.upsert({
		where: { userId: user.id },
		update: {
			planId,
			price: subscriptionPrice,
			startDate: now,
			endDate,
		},
		create: {
			userId: user.id,
			planId,
			price: subscriptionPrice,
			startDate: now,
			endDate,
		},
	});

	// Update subscriber isSubscribed status
	await prisma.user.update({
		where: { id: user.id },
		data: { isSubscribed: true },
	});

	// Deduct from user's balance
	await prisma.user.update({
		where: { id: user.id },
		data: {
			balance: { decrement: subscriptionPrice },
		},
	});

	// Add to creator's balance
	await prisma.user.update({
		where: { id: creatorId },
		data: {
			balance: { increment: subscriptionPrice },
		},
	});

	// Create a notification for the creator
	await prisma.notification.create({
		data: {
			userId: creatorId,
			title: "🎉 ¡Felicidades!",
			message: `Tienes un nuevo suscriptor: ${user.email}\n\n¡Tu comunidad sigue creciendo!`,
		},
	});

	// Create a notification for the subscriber
	const dollars = (subscriptionPrice / 100).toFixed(2);
	await prisma.notification.create({
		data: {
			userId: user.id,
			title: "✅ Suscripción activa",
			message: `¡Felicidades! Ahora estás suscrito a ${creator.name} por ${dollars} USD/mes.`,
		},
	});

	// Revalidate paths to update subscription status
	revalidatePath("/");
	revalidatePath("/profile");

	console.log("Subscription created for user:", user.id, "Subscription:", subscription);

	return NextResponse.json({ success: true, subscription });
}
