import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { creatorId } = body;

	if (!creatorId) {
		return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
	}

	// Check if subscription exists
	const subscription = await prisma.subscription.findUnique({
		where: { userId: user.id },
	});

	if (!subscription) {
		return NextResponse.json({ error: "No subscription found" }, { status: 404 });
	}

	// Delete subscription
	await prisma.subscription.delete({
		where: { userId: user.id },
	});

	// Update subscriber isSubscribed status
	await prisma.user.update({
		where: { id: user.id },
		data: { isSubscribed: false },
	});

	// Revalidate paths to update subscription status
	revalidatePath("/");
	revalidatePath(`/profile/${creatorId}`);

	return NextResponse.json({ success: true });
}
