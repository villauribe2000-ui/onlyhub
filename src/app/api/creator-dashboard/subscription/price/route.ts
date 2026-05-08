import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { price1mo, price3mo, price12mo } = body;

	if (!price1mo || price1mo <= 0) {
		return NextResponse.json({ error: "El precio mensual es obligatorio" }, { status: 400 });
	}

	try {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				subscriptionPrice: price1mo,
				subscriptionPrice3mo: price3mo,
				subscriptionPrice12mo: price12mo,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Failed to update subscription price" }, { status: 500 });
	}
}
