import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { status } = body;

	if (!status || !["pending", "in_progress", "resolved"].includes(status)) {
		return NextResponse.json({ error: "Invalid status" }, { status: 400 });
	}

	const ticket = await prisma.supportTicket.update({
		where: { id: params.id },
		data: { status },
	});

	return NextResponse.json({ success: true, ticket });
}
