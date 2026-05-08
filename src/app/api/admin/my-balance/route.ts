import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const currentUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { id: true, email: true, name: true, balance: true, isCreator: true },
	});

	if (!currentUser) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({
		id: currentUser.id,
		email: currentUser.email,
		name: currentUser.name,
		balance: currentUser.balance / 100,
		isCreator: currentUser.isCreator,
	});
}
