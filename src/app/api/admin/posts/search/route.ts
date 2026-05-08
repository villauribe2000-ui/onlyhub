import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const email = user.email;
	if (email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 12;
	const skip = (page - 1) * limit;

	const posts = await prisma.post.findMany({
		where: {
			OR: [
				{ text: { contains: q, mode: "insensitive" } },
				{ user: { name: { contains: q, mode: "insensitive" } } },
				{ user: { email: { contains: q, mode: "insensitive" } } },
			],
		},
		include: {
			user: {
				select: {
					name: true,
					email: true,
				},
			},
		},
		skip,
		take: limit,
		orderBy: {
			createdAt: "desc",
		},
	});

	const total = await prisma.post.count({
		where: {
			OR: [
				{ text: { contains: q, mode: "insensitive" } },
				{ user: { name: { contains: q, mode: "insensitive" } } },
				{ user: { email: { contains: q, mode: "insensitive" } } },
			],
		},
	});

	return NextResponse.json({
		posts,
		hasMore: skip + posts.length < total,
	});
}
