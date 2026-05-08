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
	const { message } = body;

	if (!message || message.trim() === "") {
		return NextResponse.json({ error: "Message is required" }, { status: 400 });
	}

	const supportTicket = await prisma.supportTicket.create({
		data: {
			userId: user.id,
			message: message.trim(),
			status: "pending",
		},
	});

	return NextResponse.json({ success: true, supportTicket });
}
