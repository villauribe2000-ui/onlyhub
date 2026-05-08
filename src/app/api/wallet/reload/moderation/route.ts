import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { amount } = body;

	if (!amount || amount <= 0) {
		return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
	}

	// Find admin user by email
	const adminEmail = process.env.ADMIN_EMAIL;

	const admin = await prisma.user.findFirst({
		where: {
			email: adminEmail,
		},
	});

	if (!admin) {
		return NextResponse.json({ error: `Admin not found with email: ${adminEmail}` }, { status: 500 });
	}

	// Create a wallet reload request
	const walletReload = await prisma.walletReload.create({
		data: {
			userId: user.id,
			amount: Math.round(amount * 100),
			status: "pending",
			paypalPaymentId: null, // No PayPal payment for moderation
		},
	});

	// Create a notification for the admin
	await prisma.notification.create({
		data: {
			userId: admin.id,
			title: "💰 Nueva recarga de saldo pendiente",
			message: `${user.email} ha solicitado una recarga de ${amount}. Revisa y aprueba en tu panel de admin.`,
		},
	});

	return NextResponse.json({ success: true, walletReloadId: walletReload.id });
}
