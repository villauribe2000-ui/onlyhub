import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export async function checkUserSuspension() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user?.id) {
		throw new Error("Unauthorized");
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { 
			isSuspended: true, 
			suspensionReason: true,
			suspendedAt: true 
		},
	});

	if (dbUser?.isSuspended) {
		// Instead of throwing an error, redirect to suspended page
		redirect("/suspended");
	}

	return user;
}

export async function checkUserSuspensionStatus(userId: string) {
	const dbUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { 
			isSuspended: true, 
			suspensionReason: true,
			suspendedAt: true 
		},
	});

	return dbUser;
}