import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET() {
	try {
		const { getUser } = getKindeServerSession();
		const kindeUser = await getUser();

		if (!kindeUser) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: kindeUser.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				coverImage: true,
				username: true,
				bio: true,
			},
		});

		return NextResponse.json({
			kindeUser: {
				id: kindeUser.id,
				email: kindeUser.email,
				given_name: kindeUser.given_name,
				family_name: kindeUser.family_name,
			},
			dbUser,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
