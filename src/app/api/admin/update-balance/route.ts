import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	// Only admin can update balance
	if (!user || user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { userId, amount, type = "add" } = body;

	if (!userId || !amount || amount <= 0) {
		return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
	}

	// Find user
	const targetUser = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!targetUser) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	// Update balance
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			balance: type === "add" 
				? { increment: Math.round(amount * 100) }
				: { decrement: Math.round(amount * 100) },
		},
	});

	// Create notification for the user
	await prisma.notification.create({
		data: {
			userId: userId,
			title: type === "add" ? "💰 Saldo actualizado" : "💸 Saldo descontado",
			message: type === "add" 
				? `Se han agregado $${amount.toFixed(2)} a tu billetera.`
				: `Se han descontado $${amount.toFixed(2)} de tu billetera.`,
		},
	});

	return NextResponse.json({ 
		success: true, 
		balance: updatedUser.balance / 100 
	});
}
