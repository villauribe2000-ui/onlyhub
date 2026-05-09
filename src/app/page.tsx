import AuthScreen from "@/components/home/auth-screen/AuthScreen";
import HomeScreen from "@/components/home/home-screen/HomeScreen";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export default async function Home() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	
	// Create user in database if doesn't exist
	if (user) {
		try {
			const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
			
			if (!existingUser) {
				// Build name safely
				const userName = [user.given_name, user.family_name]
					.filter(Boolean)
					.join(' ') || user.email?.split('@')[0] || 'Usuario';
				
				await prisma.user.create({
					data: {
						id: user.id,
						email: user.email || '',
						name: userName,
						image: user.picture || null,
					},
				});
			}
		} catch (error) {
			console.error('Error creating user:', error);
			// Don't throw, just log - user might already exist from race condition
		}
	}
	
	console.log(user);
	return <main>{user ? <HomeScreen /> : <AuthScreen />}</main>;
}
