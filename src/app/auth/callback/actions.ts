"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { updateUserActivity } from "@/lib/updateActivity";

export async function checkAuthStatus() {
	try {
		const { getUser } = getKindeServerSession();
		const user = await getUser();

		if (!user?.id || !user?.email) {
			console.log('No user found in session');
			return { success: false };
		}

		console.log('User from Kinde:', { id: user.id, email: user.email });

		const existingUser = await prisma.user.findUnique({ 
			where: { id: user.id } 
		});

		if (!existingUser) {
			// Build name safely
			const userName = [user.given_name, user.family_name]
				.filter(Boolean)
				.join(' ')
				.trim() || user.email.split('@')[0] || 'Usuario';
			
			console.log('Creating new user:', { id: user.id, name: userName });
			
			await prisma.user.create({
				data: {
					id: user.id,
					email: user.email,
					name: userName,
					image: user.picture || null,
				},
			});
		} else {
			console.log('User already exists:', user.id);
			// Update activity for existing user
			await updateUserActivity(user.id);
		}

		return { success: true };
	} catch (error: any) {
		console.error('Error in checkAuthStatus:', error?.message || error);
		// Don't fail - just return success to let user through
		return { success: true };
	}
}
