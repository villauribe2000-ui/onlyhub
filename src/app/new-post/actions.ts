"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { checkUserSuspension } from "@/lib/checkSuspension";

type PostArgs = {
	text: string;
	mediaUrl?: string;
	mediaType?: "image" | "video";
	isPublic: boolean;
};

export async function createUserPostAction({ isPublic, mediaUrl, mediaType, text }: PostArgs) {
	// Check if user is suspended
	const user = await checkUserSuspension();

	const userProfile = await prisma.user.findUnique({ where: { id: user.id } });
	
	// Debug log
	console.log("User profile for post:", {
		id: userProfile?.id,
		name: userProfile?.name,
		email: userProfile?.email,
		isVerified: userProfile?.isVerified,
		isCreator: userProfile?.isCreator,
	});

	// Allow posting if user is verified OR is a creator
	const canPost = Boolean(userProfile?.isVerified || userProfile?.isCreator);
	if (!canPost) {
		throw new Error("Solo creadores verificados pueden publicar. Por favor, solicita verificación en el panel de admin.");
	}

	const newPost = await prisma.post.create({
		data: {
			text,
			mediaUrl,
			mediaType,
			isPublic,
			userId: user.id,
		},
	});

	return { success: true, post: newPost };
}

