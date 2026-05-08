import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;
	const paymentId = searchParams.get("paymentId");
	const token = searchParams.get("token");
	const payerId = searchParams.get("PayerID");

	if (!paymentId || !token) {
		return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
	}

	// Find the wallet reload by PayPal payment ID
	const walletReload = await prisma.walletReload.findFirst({
		where: { paypalPaymentId: paymentId },
	});

	if (!walletReload) {
		return NextResponse.json({ error: "Wallet reload not found" }, { status: 404 });
	}

	// Update the wallet reload with PayPal payment details
	await prisma.walletReload.update({
		where: { id: walletReload.id },
		data: {
			paypalPaymentId: paymentId,
			status: "pending", // Waiting for admin approval
		},
	});

	// Find admin user by email
	const admin = await prisma.user.findFirst({
		where: {
			email: process.env.ADMIN_EMAIL,
		},
	});

	// Create a notification for the admin
	if (admin) {
		await prisma.notification.create({
			data: {
				userId: admin.id,
				title: "💰 Nueva recarga de saldo pendiente",
				message: `${user.email} ha realizado un pago de ${(walletReload.amount / 100).toFixed(2)} por PayPal. Revisa y aprueba en tu panel de admin.`,
			},
		});
	}

	return NextResponse.json({ success: true, walletReload });
}
