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
	const { event_type, resource } = body;

	// Only process completed payments
	if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
		const { id, amount, payer } = resource;

		// Find the wallet reload by PayPal payment ID
		const walletReload = await prisma.walletReload.findFirst({
			where: { paypalPaymentId: id },
		});

		if (walletReload) {
			// Approve the wallet reload
			await prisma.walletReload.update({
				where: { id: walletReload.id },
				data: {
					status: "approved",
					reviewedAt: new Date(),
				},
			});

			// Add the amount to the user's balance
			await prisma.user.update({
				where: { id: walletReload.userId },
				data: {
					balance: { increment: walletReload.amount },
				},
			});

			// Create a notification for the user
			await prisma.notification.create({
				data: {
					userId: walletReload.userId,
					title: "✅ Recarga aprobada",
					message: `Tu recarga de ${(walletReload.amount / 100).toFixed(2)} ha sido aprobada y se ha agregado a tu saldo.`,
				},
			});
		}
	}

	return NextResponse.json({ success: true });
}
