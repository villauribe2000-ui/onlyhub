import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const isAdmin = user.email === process.env.ADMIN_EMAIL;
	if (!isAdmin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const tickets = await prisma.supportTicket.findMany({
		include: { user: true },
		orderBy: { createdAt: "desc" },
	});

	return NextResponse.json({ success: true, tickets });
}
