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
	const { views } = body;

	if (!views || isNaN(views) || views < 0) {
		return NextResponse.json({ error: "Invalid views count" }, { status: 400 });
	}

	const post = await prisma.post.update({
		where: { id: params.id },
		data: { views },
	});

	return NextResponse.json({ success: true, post });
}
