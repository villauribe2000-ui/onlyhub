import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	// Only admin can search users
	if (!user || user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;
	const search = searchParams.get("search");

	if (!search) {
		return NextResponse.json({ error: "Search query required" }, { status: 400 });
	}

	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			],
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			isCreator: true,
			isVerified: true,
			balance: true,
		},
		take: 20,
	});

	return NextResponse.json(users);
}
