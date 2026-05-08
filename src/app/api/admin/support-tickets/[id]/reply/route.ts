import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const isAdmin = user.email === process.env.ADMIN_EMAIL;
	if (!isAdmin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { reply } = body;

	if (!reply || reply.trim() === "") {
		return NextResponse.json({ error: "Reply is required" }, { status: 400 });
	}

	const ticket = await prisma.supportTicket.update({
		where: { id: params.id },
		data: {
			adminReply: reply.trim(),
			status: "in_progress",
		},
	});

	return NextResponse.json({ success: true, ticket });
}
