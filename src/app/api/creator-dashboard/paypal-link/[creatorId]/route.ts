import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(request: NextRequest, { params }: { params: { creatorId: string } }) {
	const { creatorId } = params;

	if (!creatorId) {
		return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
	}

	// Get the creator's PayPal link
	const creator = await prisma.user.findUnique({
		where: { id: creatorId },
		select: { paypalLink: true },
	});

	if (!creator) {
		return NextResponse.json({ error: "Creator not found" }, { status: 404 });
	}

	return NextResponse.json({ paypalLink: creator.paypalLink });
}
