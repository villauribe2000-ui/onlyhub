"use server";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function requestWithdrawalAction(
	method: string,
	account: string,
	country: string,
	accountName: string
) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();
	if (!user) throw new Error("Unauthorized");

	const userProfile = await prisma.user.findUnique({ where: { id: user.id } });
	if (!userProfile?.isCreator) throw new Error("Solo los creadores pueden retirar");
	if ((userProfile.balance || 0) <= 0) throw new Error("No tienes saldo disponible");

	const methodLabel = method === "bank" ? "transferencia bancaria" : "PayPal";
	const amount = (userProfile.balance / 100).toFixed(2);

	await prisma.notification.create({
		data: {
			userId: user.id,
			title: "💸 Solicitud de retiro recibida",
			message: `Tu solicitud de retiro de $${amount} USD vía ${methodLabel} fue recibida.\n\nTitular: ${accountName}\nCuenta: ${account}\nPaís: ${country}\n\nSe procesará en 3-5 días hábiles.`,
		},
	});

	return { success: true };
}
