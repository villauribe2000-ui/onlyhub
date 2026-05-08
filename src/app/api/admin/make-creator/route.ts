import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	// Only admin can make creator
	if (!user || user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { userId } = body;

	if (!userId) {
		return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
	}

	// Make user a creator
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { isCreator: true },
	});

	return NextResponse.json({ 
		success: true, 
		isCreator: updatedUser.isCreator 
	});
}
