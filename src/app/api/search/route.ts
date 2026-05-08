import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ users: [] });
	}

	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("q") || "";

	if (!query || query.trim().length < 2) {
		return NextResponse.json({ users: [] });
	}

	const searchQuery = `%${query.trim()}%`;

	const users = await prisma.user.findMany({
		where: {
			NOT: {
				id: user.id,
			},
			OR: [
				{
					name: {
						contains: searchQuery,
						mode: "insensitive",
					},
				},
				{
					username: {
						contains: searchQuery,
						mode: "insensitive",
					},
				},
			],
		},
		select: {
			id: true,
			name: true,
			username: true,
			image: true,
			isVerified: true,
		},
		take: 10,
	});

	return NextResponse.json({
		users: users.map((u) => ({
			id: u.id,
			name: u.name,
			username: u.username,
			image: u.image,
			isVerified: u.isVerified,
		})),
	});
}
