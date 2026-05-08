import BaseLayout from "@/components/BaseLayout";
import prisma from "@/db/prisma";
import { getUserProfileAction } from "@/app/update-profile/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubscriptionSettingsWrapper from "./subscription/SubscriptionSettingsWrapper";
import SubscriptionRequests from "./subscriptions/SubscriptionRequests";

const PLAQUE_MILESTONES = [100_000, 1_000_000, 10_000_000] as const;

const compactNumber = (value: number) =>
	new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const fmtUsd = (cents: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(cents / 100);

export default async function CreatorDashboardPage() {
	const me = await getUserProfileAction();
	if (!me) return redirect("/");

	const canSee = Boolean((me as any).isVerified || (me as any).isCreator);
	if (!canSee) return redirect("/");

	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);
	const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
	const prismaAny = prisma as any;
	let viewsAll = { _sum: { views: 0 } } as { _sum: { views: number | null } };
	try {
		viewsAll = await prisma.post.aggregate({
			where: { userId: me.id },
			_sum: { views: true as any },
		});
	} catch {
		viewsAll = { _sum: { views: 0 } };
	}

	const [realFollowers, followersTodayReal, followersMonthReal, followersTodayAdj, followersMonthAdj, earningsToday, earningsMonth] =
		await Promise.all([
			prisma.follow.count({ where: { followingId: me.id } }),
			prisma.follow.count({ where: { followingId: me.id, createdAt: { gte: startOfDay } } }),
			prisma.follow.count({ where: { followingId: me.id, createdAt: { gte: startOfMonth } } }),
			prismaAny.followerAdjustment
				? prismaAny.followerAdjustment.aggregate({
						where: { userId: me.id, createdAt: { gte: startOfDay } },
						_sum: { delta: true },
				  })
				: Promise.resolve({ _sum: { delta: 0 } }),
			prismaAny.followerAdjustment
				? prismaAny.followerAdjustment.aggregate({
						where: { userId: me.id, createdAt: { gte: startOfMonth } },
						_sum: { delta: true },
				  })
				: Promise.resolve({ _sum: { delta: 0 } }),
			prismaAny.earningsAdjustment
				? prismaAny.earningsAdjustment.aggregate({
						where: { userId: me.id, createdAt: { gte: startOfDay } },
						_sum: { amount: true },
				  })
				: Promise.resolve({ _sum: { amount: 0 } }),
			prismaAny.earningsAdjustment
				? prismaAny.earningsAdjustment.aggregate({
						where: { userId: me.id, createdAt: { gte: startOfMonth } },
						_sum: { amount: true },
				  })
				: Promise.resolve({ _sum: { amount: 0 } }),
		]);

	const totalFollowers = realFollowers + ((me as any).followersOverride || 0);
	const followersToday = followersTodayReal + (followersTodayAdj._sum.delta || 0);
	const followersMonth = followersMonthReal + (followersMonthAdj._sum.delta || 0);
	const earningsTodayCents = earningsToday._sum.amount || 0;
	const earningsMonthCents = earningsMonth._sum.amount || 0;
	const viewsAllCount = viewsAll._sum.views || 0;

	const claims = prismaAny.plaqueClaim
		? await prismaAny.plaqueClaim.findMany({
				where: { userId: me.id },
		  })
		: [];

	const claimByMilestone = new Map(claims.map((c: any) => [c.milestone, c.status] as const));

	return (
		<BaseLayout renderRightPanel={false}>
			<div className='px-4 py-6 space-y-6'>
				<div>
					<p className='text-2xl font-black'>Panel de creadores</p>
					<p className='text-sm text-muted-foreground'>Metas, ingresos y estadísticas de tu cuenta.</p>
				</div>

				<div className='of-card p-4'>
					<p className='text-xs font-black uppercase tracking-wide text-muted-foreground mb-3'>Estadísticas</p>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Seguidores (hoy)</p>
							<p className='text-xl font-black'>{compactNumber(followersToday)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Seguidores (mes)</p>
							<p className='text-xl font-black'>{compactNumber(followersMonth)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Seguidores (total)</p>
							<p className='text-xl font-black'>{compactNumber(totalFollowers)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Reproducciones (total)</p>
							<p className='text-xl font-black'>{compactNumber(viewsAllCount)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Ingresos (hoy)</p>
							<p className='text-xl font-black'>{fmtUsd(earningsTodayCents)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3'>
							<p className='text-xs text-muted-foreground'>Ingresos (mes)</p>
							<p className='text-xl font-black'>{fmtUsd(earningsMonthCents)}</p>
						</div>
						<div className='rounded-2xl bg-muted/40 p-3 md:col-span-2'>
							<p className='text-xs text-muted-foreground'>Ingresos (total)</p>
							<p className='text-xl font-black'>{fmtUsd((me as any).balance || 0)}</p>
						</div>
					</div>
				</div>

				<div className='of-card p-4'>
					<p className='text-xs font-black uppercase tracking-wide text-muted-foreground mb-3'>Suscripción</p>
					<SubscriptionSettingsWrapper />
				</div>

				<div className='of-card p-4'>
					<p className='text-xs font-black uppercase tracking-wide text-muted-foreground mb-3'>Solicitudes de Suscripción</p>
					<SubscriptionRequests />
				</div>

				<div className='of-card p-4'>
					<div className='flex items-center justify-between gap-3 mb-3'>
						<div>
							<p className='text-xs font-black uppercase tracking-wide text-muted-foreground'>Metas de placa</p>
							<p className='text-sm text-muted-foreground'>100K, 1M, 10M seguidores.</p>
						</div>
						<Link href='/plaque' className='of-pill text-primary border-primary/30'>
							Ver / reclamar placa
						</Link>
					</div>

					<div className='space-y-3'>
						{PLAQUE_MILESTONES.map((m) => {
							const left = Math.max(m - totalFollowers, 0);
							const pct = Math.min(100, Math.round((totalFollowers / m) * 100));
							const status = claimByMilestone.get(m) as string | undefined;
							return (
								<div key={m} className='rounded-2xl border p-3'>
									<div className='flex items-center justify-between'>
										<p className='font-black'>{compactNumber(m)} seguidores</p>
										{status ? (
											<span className='text-xs font-bold text-muted-foreground'>Placa: {status}</span>
										) : left === 0 ? (
											<span className='text-xs font-bold text-primary'>Disponible</span>
										) : (
											<span className='text-xs font-bold text-muted-foreground'>Faltan {compactNumber(left)}</span>
										)}
									</div>
									<div className='mt-2 h-2 rounded-full bg-muted overflow-hidden'>
										<div className='h-full bg-primary' style={{ width: `${pct}%` }} />
									</div>
									<p className='mt-2 text-xs text-muted-foreground'>{pct}% completado</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</BaseLayout>
	);
}

