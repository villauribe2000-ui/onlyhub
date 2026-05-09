import prisma from "@/db/prisma";

export async function updateUserActivity(userId: string) {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: { lastActive: new Date() },
		});
	} catch (error) {
		// Silently fail - activity tracking is not critical
		console.error("Failed to update user activity:", error);
	}
}