import prisma from "@/db/prisma";

const FOLLOWER_MILESTONES = [1000, 10_000, 100_000, 1_000_000, 10_000_000] as const;
const PLAQUE_MILESTONES = new Set([100_000, 1_000_000, 10_000_000]);

function formatMilestone(n: number) {
	if (n >= 1_000_000) return `${n / 1_000_000}M`;
	if (n >= 1000) return `${n / 1000}K`;
	return String(n);
}

export async function maybeCreateFollowerMilestoneNotifications(userId: string) {
	// Total followers = reales + override (manual). Ajustes ya están reflejados en override por tu panel.
	const [realFollowers, user] = await Promise.all([
		prisma.follow.count({ where: { followingId: userId } }),
		prisma.user.findUnique({ where: { id: userId }, select: { followersOverride: true, name: true } }),
	]);

	if (!user) return;

	const total = realFollowers + (user.followersOverride || 0);

	for (const milestone of FOLLOWER_MILESTONES) {
		if (total < milestone) continue;

		const exists = await prisma.followerMilestone.findUnique({
			where: { userId_milestone: { userId, milestone } },
		});
		if (exists) continue;

		const motivational =
			milestone === 1000
				? "Este es el comienzo. Mantén la constancia y tu comunidad va a crecer."
				: milestone === 10_000
					? "Ya estás construyendo algo grande. Sigue creando y conectando con tu audiencia."
					: milestone === 100_000
						? "Esto ya es nivel pro. Tu comunidad te está eligiendo todos los días."
						: milestone === 1_000_000
							? "Llegaste a la élite. Gracias por inspirar y crear contenido increíble."
							: "Esto es historia. Tu impacto es enorme y tu comunidad es gigante.";

		const baseMessage = `¡${user.name} llegó a ${formatMilestone(milestone)} seguidores! 🎉\n\n${motivational}\n\nFelicitaciones de parte del equipo OnlyHub.`;

		const shouldOfferPlaque = PLAQUE_MILESTONES.has(milestone);

		await prisma.$transaction(async (tx) => {
			await tx.followerMilestone.create({
				data: { userId, milestone },
			});

			if (shouldOfferPlaque) {
				await tx.plaqueClaim.upsert({
					where: { userId_milestone: { userId, milestone } },
					update: {},
					create: { userId, milestone },
				});
			}

			await tx.notification.create({
				data: {
					userId,
					title: "🎉 ¡Felicitaciones!",
					message: shouldOfferPlaque
						? `${baseMessage}\n\n🏆 Recompensa: Por llegar a ${formatMilestone(
								milestone
						  )}, el equipo OnlyHub te enviará una placa (tipo YouTube).\n\nEntra a “Placa OnlyHub” y completa: nombre para la placa + dirección + país.`
						: baseMessage,
				},
			});
		});
	}
}

