import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get user's balance
	const currentUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { balance: true },
	});

	console.log("User balance for", user.id, ":", currentUser?.balance);

	return NextResponse.json({ 
		success: true, 
		balance: currentUser?.balance || 0 
	});
}

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

	// Create a wallet reload request
	const walletReload = await prisma.walletReload.create({
		data: {
			userId: user.id,
			amount: Math.round(amount * 100),
			status: "pending",
			paypalPaymentId: `paypal_${Date.now()}`, // Temporary ID, will be updated by webhook
		},
	});

	// Find admin user by email
	const adminEmail = process.env.ADMIN_EMAIL;

	const admin = await prisma.user.findFirst({
		where: {
			email: adminEmail,
		},
	});

	// Create a notification for the admin
	if (admin) {
		await prisma.notification.create({
			data: {
				userId: admin.id,
				title: "💰 Nueva recarga de saldo pendiente",
				message: `${user.email} ha solicitado una recarga de ${amount}. Revisa y aprueba en tu panel de admin.`,
			},
		});
	}

	// Create a PayPal payment URL
	const paypalUrl = `https://www.paypal.com/ncp/payment/RFGJW4SCEF8PJ?amount=${amount}&type=reload&walletReloadId=${walletReload.id}`;
	const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet/reload/confirm?paymentId=${walletReload.id}&token=${walletReload.id}`;

	return NextResponse.json({ url: paypalUrl, walletReloadId: walletReload.id, confirmUrl });
}
