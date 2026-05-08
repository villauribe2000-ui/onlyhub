import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Only admin can approve wallet reloads
	if (user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { action } = body; // 'approve' or 'reject'

	if (!action || !['approve', 'reject'].includes(action)) {
		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	}

	const walletReload = await prisma.walletReload.findUnique({
		where: { id: params.id },
	});

	if (!walletReload) {
		return NextResponse.json({ error: "Wallet reload not found" }, { status: 404 });
	}

	if (walletReload.status !== "pending") {
		return NextResponse.json({ error: "Wallet reload already processed" }, { status: 400 });
	}

	// Update the wallet reload status
	const updatedWalletReload = await prisma.walletReload.update({
		where: { id: params.id },
		data: {
			status: action === "approve" ? "approved" : "rejected",
			reviewedAt: new Date(),
		},
	});

	if (action === "approve") {
		// Add the amount to the user's balance
		await prisma.user.update({
			where: { id: walletReload.userId },
			data: {
				balance: {
					increment: walletReload.amount,
				},
			},
		});

		// Create a notification for the user
		await prisma.notification.create({
			data: {
				userId: walletReload.userId,
				title: "✅ Recarga aprobada",
				message: `Tu recarga de $${walletReload.amount / 100} ha sido aprobada y se ha agregado a tu saldo.`,
			},
		});
	} else {
		// Create a notification for the user
		await prisma.notification.create({
			data: {
				userId: walletReload.userId,
				title: "❌ Recarga rechazada",
				message: `Tu recarga de $${walletReload.amount / 100} ha sido rechazada.`,
			},
		});
	}

	return NextResponse.json({ success: true, walletReload: updatedWalletReload });
}
