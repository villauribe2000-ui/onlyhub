"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { updateUserActivity } from "@/lib/updateActivity";

export async function getPostsAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	const posts = await prisma.post.findMany({
		where: {
			isPublic: true,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					username: true,
					isVerified: true,
					lastActive: true,
				}
			},
			likesList: { where: { userId: user.id } },
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return posts;
}

export async function getPostsByUserIdAction(userId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	const posts = await prisma.post.findMany({
		where: {
			userId: userId,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					username: true,
					isVerified: true,
					lastActive: true,
				}
			},
			likesList: { where: { userId: user.id } },
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return posts;
}

export async function deletePostAction(postId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const post = await prisma.post.findUnique({ where: { id: postId } });

	if (post?.userId !== user?.id) throw new Error("Only admin can delete posts");

	await prisma.post.delete({ where: { id: postId } });

	return { success: true };
}

export async function likePostAction(postId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { likes: true, likesList: { where: { userId: user.id } } },
	});

	if (!post) throw new Error("Post not found");

	let newLikes: number;
	if (post.likesList.length > 0) {
		newLikes = Math.max(post.likes - 1, 0);
		await prisma.like.deleteMany({
			where: { postId: postId, userId: user.id },
		});
	} else {
		newLikes = post.likes + 1;
		await prisma.like.create({
			data: { postId: postId, userId: user.id },
		});
	}

	await prisma.post.update({
		where: { id: postId },
		data: { likes: newLikes },
	});

	// Update user activity
	await updateUserActivity(user.id);

	return { success: true };
}

export async function createDonationAction(creatorId: string, amountInCents: number) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	// Get user's balance
	const donor = await prisma.user.findUnique({
		where: { id: user.id },
		select: { balance: true },
	});

	if (!donor) throw new Error("Donor not found");

	// Check if user has enough balance
	if (donor.balance < amountInCents) {
		throw new Error("Insufficient balance. Please reload your wallet.");
	}

	// Deduct from donor's balance
	await prisma.user.update({
		where: { id: user.id },
		data: {
			balance: { decrement: amountInCents },
		},
	});

	// Create a donation record
	const donation = await prisma.donation.create({
		data: {
			amount: amountInCents,
			userId: user.id,
			creatorId: creatorId,
		},
	});

	// Update creator's balance
	await prisma.user.update({
		where: { id: creatorId },
		data: {
			balance: { increment: amountInCents },
		},
	});

	// Send notification to creator
	await prisma.notification.create({
		data: {
			userId: creatorId,
			title: "💰 Nueva donación",
			message: `Has recibido una donación de ${(amountInCents / 100).toFixed(2)} de ${user.name}.`,
		},
	});

	// Update user activity
	await updateUserActivity(user.id);

	return { success: true, donation };
}
