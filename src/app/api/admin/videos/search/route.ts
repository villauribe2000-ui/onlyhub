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

	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("q") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 20;
	const skip = (page - 1) * limit;

	const posts = await prisma.post.findMany({
		where: {
			mediaType: "video",
			OR: [
				{ text: { contains: query, mode: "insensitive" } },
				{ user: { name: { contains: query, mode: "insensitive" } } },
				{ user: { email: { contains: query, mode: "insensitive" } } },
			],
		},
		include: { user: true },
		orderBy: { createdAt: "desc" },
		skip,
		take: limit,
	});

	const total = await prisma.post.count({
		where: {
			mediaType: "video",
			OR: [
				{ text: { contains: query, mode: "insensitive" } },
				{ user: { name: { contains: query, mode: "insensitive" } } },
				{ user: { email: { contains: query, mode: "insensitive" } } },
			],
		},
	});

	return NextResponse.json({ 
		success: true, 
		posts, 
		total,
		page,
		hasMore: page * limit < total
	});
}
