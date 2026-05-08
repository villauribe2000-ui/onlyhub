import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Only admin can view wallet reloads
	if (user.email !== process.env.ADMIN_EMAIL) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get pending wallet reloads
	const walletReloads = await prisma.walletReload.findMany({
		where: {
			status: "pending",
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return NextResponse.json({ walletReloads });
}
