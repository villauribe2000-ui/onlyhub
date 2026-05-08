import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
	try {
		const { getUser } = getKindeServerSession();
		const user = await getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const count = await prisma.notification.count({
			where: {
				userId: user.id,
				isRead: false,
			},
		});

		return NextResponse.json({ count });
	} catch (error) {
		console.error("Error getting unread notifications count:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
