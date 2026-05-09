import AuthScreen from "@/components/home/auth-screen/AuthScreen";
import HomeScreen from "@/components/home/home-screen/HomeScreen";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	
	// Create user in database if doesn't exist
	if (user?.id && user?.email) {
		try {
			const existingUser = await prisma.user.findUnique({ 
				where: { id: user.id },
				select: {
					id: true,
					isSuspended: true,
				}
			});
			
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
				
				console.log('New user created:', user.id);
			} else if (existingUser.isSuspended) {
				// Redirect suspended users to suspension page
				redirect("/suspended");
			}
		} catch (error) {
			console.error('Error creating user:', error);
			// Continue anyway - user might exist from race condition
		}
	}
	
	return <main>{user ? <HomeScreen /> : <AuthScreen />}</main>;
}
