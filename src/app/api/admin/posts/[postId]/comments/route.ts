import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const email = user.email;
	if (email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { commentText } = body;

	if (!commentText || !commentText.trim()) {
		return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
	}

	const post = await prisma.post.findUnique({
		where: { id: params.postId },
	});

	if (!post) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	const comment = await prisma.comment.create({
		data: {
			text: commentText,
			userId: user.id,
			postId: params.postId,
		},
		include: {
			user: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	});

	return NextResponse.json({ comment }, { status: 201 });
}
