import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest) {
	try {
		const { getUser } = getKindeServerSession();
		const user = await getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get("q") || "";
		const type = searchParams.get("type") || "all"; // all, users, posts
		const filter = searchParams.get("filter") || "all"; // all, verified, media

		if (query.length < 2) {
			return NextResponse.json({ users: [], posts: [] });
		}

		let users: any[] = [];
		let posts: any[] = [];

		// Search users
		if (type === "all" || type === "users") {
			const userWhere: any = {
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ username: { contains: query, mode: "insensitive" } },
					{ email: { contains: query, mode: "insensitive" } },
				],
			};

			if (filter === "verified") {
				userWhere.isVerified = true;
			}

			users = await prisma.user.findMany({
				where: userWhere,
				select: {
					id: true,
					name: true,
					username: true,
					image: true,
					isVerified: true,
					isCreator: true,
					bio: true,
				},
				take: 20,
			});
		}

		// Search posts
		if (type === "all" || type === "posts") {
			const postWhere: any = {
				text: { contains: query, mode: "insensitive" },
				isPublic: true, // Only search public posts
			};

			if (filter === "media") {
				postWhere.mediaUrl = { not: null };
			}

			posts = await prisma.post.findMany({
				where: postWhere,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							username: true,
							image: true,
							isVerified: true,
						},
					},
					likesList: true,
				},
				orderBy: { createdAt: "desc" },
				take: 20,
			});
		}

		// Extract hashtags from query
		const hashtags = query.match(/#\w+/g) || [];
		if (hashtags.length > 0 && (type === "all" || type === "posts")) {
			const hashtagPosts = await prisma.post.findMany({
				where: {
					OR: hashtags.map((tag) => ({
						text: { contains: tag, mode: "insensitive" },
					})),
					isPublic: true,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							username: true,
							image: true,
							isVerified: true,
						},
					},
					likesList: true,
				},
				orderBy: { createdAt: "desc" },
				take: 20,
			});

			// Merge with existing posts, avoiding duplicates
			const existingIds = new Set(posts.map((p) => p.id));
			hashtagPosts.forEach((post) => {
				if (!existingIds.has(post.id)) {
					posts.push(post);
				}
			});
		}

		return NextResponse.json({ users, posts, hashtags });
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
