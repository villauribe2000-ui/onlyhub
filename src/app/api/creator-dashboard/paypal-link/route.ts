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
	const { paypalLink } = body;

	if (!paypalLink) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	// Update the user's PayPal link
	await prisma.user.update({
		where: { id: user.id },
		data: {
			paypalLink,
		},
	});

	return NextResponse.json({ success: true });
}
