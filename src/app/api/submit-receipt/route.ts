import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = (global as any).prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(global as any).prisma = prisma;
}

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { creatorId, amount, receiptUrl } = body;

	if (!creatorId || !amount || !receiptUrl) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	// Create or update the subscription request
	const subscriptionRequest = await prisma.subscriptionRequest.upsert({
		where: {
			userId_creatorId: {
				userId: user.id,
				creatorId,
			},
		},
		update: {
			amount,
			receiptUrl,
			status: "pending",
		},
		create: {
			userId: user.id,
			creatorId,
			amount,
			receiptUrl,
			status: "pending",
		},
	});

	// Create a notification for the creator
	await prisma.notification.create({
		data: {
			userId: creatorId,
			title: "💰 Nueva suscripción pendiente",
			message: `${user.email} ha enviado un comprobante de pago por ${amount / 100}. Revisa y aprueba en tu panel de creador.`,
		},
	});

	return NextResponse.json({ success: true, subscriptionRequestId: subscriptionRequest.id });
}
