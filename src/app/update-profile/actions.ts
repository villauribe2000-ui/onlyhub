"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUserProfileAction() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) return null;

	const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
	return currentUser;
}

export async function updateUserProfileAction({ name, image, coverImage }: { name: string; image?: string; coverImage?: string }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	console.log('=== SERVER ACTION DEBUG ===');
	console.log('Received name:', name);
	console.log('Received image:', image);
	console.log('Received coverImage:', coverImage);
	console.log('User ID:', user.id);

	const updatedFields: Partial<User> = {};

	// Name is required
	updatedFields.name = name;
	
	// Optional fields - only update if provided
	if (image !== undefined && image !== null && image !== '') {
		updatedFields.image = image;
	}
	if (coverImage !== undefined && coverImage !== null && coverImage !== '') {
		updatedFields.coverImage = coverImage;
	}

	console.log('Fields to update:', updatedFields);

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: updatedFields,
	});

	console.log('Updated user:', { id: updatedUser.id, image: updatedUser.image, coverImage: updatedUser.coverImage });
	console.log('===========================');

	revalidatePath("/update-profile");
	revalidatePath("/");

	return { success: true, user: updatedUser };
}

export async function updateCoverImageAction(coverImage: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	await prisma.user.update({
		where: { id: user.id },
		data: { coverImage },
	});

	revalidatePath("/");
	return { success: true };
}

export async function updateProfileInfoAction({ username, bio }: { username?: string; bio?: string }) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	// Validate username is unique if provided
	if (username) {
		const existingUser = await prisma.user.findFirst({
			where: {
				username: username,
				NOT: { id: user.id }, // Exclude current user
			},
		});

		if (existingUser) {
			throw new Error("Este nombre de usuario ya está en uso. Por favor elige otro.");
		}
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			...(username && { username }),
			...(bio !== undefined && { bio }),
		},
	});

	revalidatePath("/");
	return { success: true };
}

export async function updateSubscriptionPriceAction(
	priceInCents: number,
	price3moInCents?: number,
	price12moInCents?: number,
	freeTrialDays?: number
) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	await prisma.user.update({
		where: { id: user.id },
		data: {
			subscriptionPrice: priceInCents,
			...(price3moInCents && { subscriptionPrice3mo: price3moInCents }),
			...(price12moInCents && { subscriptionPrice12mo: price12moInCents }),
			...(freeTrialDays !== undefined && { freeTrialDays }),
		},
	});

	revalidatePath("/");
	return { success: true };
}
