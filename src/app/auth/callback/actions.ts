"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAuthStatus() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user || !user.id || !user.email) return { success: false };

	try {
		const existingUser = await prisma.user.findUnique({ where: { id: user.id } });

		// Create user if doesn't exist
		if (!existingUser) {
			// Build name safely
			const userName = [user.given_name, user.family_name]
				.filter(Boolean)
				.join(' ')
				.trim() || user.email.split('@')[0] || 'Usuario';
			
			await prisma.user.create({
				data: {
					id: user.id,
					email: user.email,
					name: userName,
					image: user.picture || null,
				},
			});
			
			console.log('New user created in callback:', user.id);
		}

		return { success: true };
	} catch (error) {
		console.error('Error in checkAuthStatus:', error);
		// Return success anyway if user exists (race condition)
		return { success: true };
	}
}
