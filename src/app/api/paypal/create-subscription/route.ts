import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { creatorId, amount } = body;

	if (!creatorId || !amount) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	// Create a subscription request
	const subscriptionRequest = await prisma.subscriptionRequest.create({
		data: {
			userId: user.id,
			creatorId,
			amount,
			status: "pending",
		},
	});

	// Create a PayPal payment URL using your link
	const paypalUrl = `https://www.paypal.com/ncp/payment/RFGJW4SCEF8PJ?amount=${amount / 100}&creatorId=${creatorId}&subscriptionRequestId=${subscriptionRequest.id}`;

	return NextResponse.json({ url: paypalUrl });
}
