"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import { maybeCreateFollowerMilestoneNotifications } from "@/lib/milestones";

export async function toggleFollowAction(profileId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	if (user.id === profileId) {
		throw new Error("You cannot follow yourself");
	}

	const existingFollow = await prisma.follow.findUnique({
		where: {
			followerId_followingId: {
				followerId: user.id,
				followingId: profileId,
			},
		},
	});

	if (existingFollow) {
		await prisma.follow.delete({
			where: {
				followerId_followingId: {
					followerId: user.id,
					followingId: profileId,
				},
			},
		});
	} else {
		await prisma.follow.create({
			data: {
				followerId: user.id,
				followingId: profileId,
			},
		});
	}

	// If follow was created, check follower milestones for that profile.
	if (!existingFollow) {
		await maybeCreateFollowerMilestoneNotifications(profileId);
	}

	revalidatePath(`/profile/${profileId}`);
	return { isFollowing: !existingFollow };
}
