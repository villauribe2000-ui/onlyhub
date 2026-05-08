import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check if admin
	if (user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const body = await request.json();
	const { userId, amount } = body;

	if (!userId || !amount || amount <= 0) {
		return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
	}

	// Add the amount to the user's balance
	await prisma.user.update({
		where: { id: userId },
		data: {
			balance: { increment: Math.round(amount * 100) },
		},
	});

	// Create a notification for the user
	await prisma.notification.create({
		data: {
			userId,
			title: "💰 Saldo agregado manualmente",
			message: `Se han agregado ${amount} USD a tu saldo por el administrador.`,
		},
	});

	return NextResponse.json({ success: true });
}
