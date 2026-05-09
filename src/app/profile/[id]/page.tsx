import { getUserProfileAction } from "@/app/update-profile/actions";
import { notFound } from "next/navigation";
import prisma from "@/db/prisma";
import BaseLayout from "@/components/BaseLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Pencil, Search, Share2, SlidersHorizontal, Users, Video } from "lucide-react";
import Link from "next/link";
import FollowButton from "./FollowButton";
import BackButton from "@/components/BackButton";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import ProfileTabs from "./ProfileTabs";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ProfilePageProps {
	params: {
		id: string;
	};
	searchParams?: {
		tab?: string;
	};
}

const ProfilePage = async ({ params, searchParams }: ProfilePageProps) => {
	const user = await prisma.user.findUnique({
		where: { id: params.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			coverImage: true,
			username: true,
			bio: true,
			isVerified: true,
			isCreator: true,
			subscriptionPrice: true,
			subscriptionPrice3mo: true,
			subscriptionPrice12mo: true,
			freeTrialDays: true,
			followersOverride: true,
			lastActive: true,
			isSuspended: true,
			suspensionReason: true,
			suspendedAt: true,
		},
	});

	if (!user) return notFound();

	const userProfile = await getUserProfileAction();
	const isMyProfile = userProfile?.id === user.id;
	const postCount = await prisma.post.count({ where: { userId: user.id } });
	const mediaCount = await prisma.post.count({
		where: {
			userId: user.id,
			mediaUrl: {
				not: null,
			},
		},
	});
	const videoCount = await prisma.post.count({
		where: {
			userId: user.id,
			mediaType: {
				contains: "video",
				mode: "insensitive",
			},
		},
	});
	const likesAggregate = await prisma.post.aggregate({
		where: { userId: user.id },
		_sum: { likes: true },
	});
	const followersCount = await prisma.follow.count({
		where: { followingId: user.id },
	});
	const followingCount = await prisma.follow.count({
		where: { followerId: user.id },
	});
	const isFollowing = userProfile
		? Boolean(
				await prisma.follow.findUnique({
					where: {
						followerId_followingId: {
							followerId: userProfile.id,
							followingId: user.id,
						},
					},
				})
		  )
		: false;
	const likesCount = likesAggregate._sum.likes || 0;
	const displayFollowersCount = followersCount + (user.followersOverride || 0);
	const canViewPrivate = Boolean(isMyProfile || userProfile?.isSubscribed);
	const fromSearch = searchParams?.from === "search";
	const isCreator = Boolean(user.isVerified || user.isCreator);
	const subscriptionPrice = (user as any).subscriptionPrice || 0;

	// Check if current user is subscribed to this creator
	const subscription = await prisma.subscription.findUnique({
		where: { userId: userProfile?.id },
	});
	const isSubscribedToCreator = !!subscription;
	
	// Debug log
	console.log("ProfilePage - userProfile.id:", userProfile?.id);
	console.log("ProfilePage - user.id:", user.id);
	console.log("ProfilePage - subscription:", subscription);
	console.log("ProfilePage - isSubscribedToCreator:", isSubscribedToCreator);

	const formatNumber = (value: number, type: 'videos' | 'likes' | 'followers') => {
		if (value >= 1000000) {
			const formatted = (value / 1000000).toFixed(2).replace(/\.?0+$/, '');
			return `${formatted} Millones`;
		} else if (value >= 1000) {
			const formatted = (value / 1000).toFixed(1).replace(/\.?0+$/, '');
			if (type === 'likes') {
				return `${formatted}K Me gusta`;
			} else if (type === 'followers') {
				return `${formatted}K Seguidores`;
			} else {
				return `${formatted}K Reproducciones`;
			}
		}
		return value.toString();
	};

	const compactNumber = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
		}
		return value.toString();
	};

	const formatVideos = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K reproducciones';
		}
		return value.toString();
	};

	const formatLikes = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K me gusta';
		}
		return value.toString();
	};

	const formatFollowers = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K seguidores';
		}
		return value.toString();
	};

	const tab = searchParams?.tab === "media" ? "media" : "posts";

	return (
		<BaseLayout>
			<div className='flex flex-col'>
				<div className='h-56 md:h-64 overflow-hidden relative bg-gradient-to-br from-sky-500/70 via-cyan-500/60 to-blue-600/70'>
					{user.coverImage ? (
						<img
							src={user.coverImage}
							alt='Portada'
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full bg-gradient-to-br from-sky-500/70 via-cyan-500/60 to-blue-600/70' />
					)}
					<div className='absolute inset-0 bg-black/20' />
					<div className='absolute top-3 left-3 right-3 text-white z-10'>
						<div className='space-y-1'>
							<div className='flex items-center gap-2'>
								<BackButton ariaLabel='Volver a la página anterior'>
									<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
									</svg>
								</BackButton>
								<div className='inline-flex items-center gap-1.5'>
									<span className='text-[24px] md:text-[28px] font-extrabold leading-none drop-shadow-sm'>{user.name}</span>
									{user.isVerified && <VerifiedBadge size='lg' className='text-white' />}
								</div>
							</div>
							<div className='flex items-center gap-2 text-sm text-white ml-8'>
								<div className='flex items-center gap-1'>
									<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M8 5v14l11-7z'/>
									</svg>
									<span className='font-semibold'>{formatVideos(videoCount)}</span>
								</div>
								<span className='text-white/60'>•</span>
								<div className='flex items-center gap-1'>
									<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/>
									</svg>
									<span className='font-semibold'>{formatLikes(likesCount)}</span>
								</div>
								<span className='text-white/60'>•</span>
								<div className='flex items-center gap-1'>
									<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h9z'/>
									</svg>
									<span className='font-semibold'>{formatFollowers(displayFollowersCount)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='px-4 pb-4 border-b'>
					<div className='flex items-end justify-between -mt-12 mb-4 relative z-10'>
						<Avatar className='w-24 h-24 border-4 border-background ring-2 ring-primary/20 shadow-xl'>
							<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
							<AvatarFallback>{user.name[0]}</AvatarFallback>
						</Avatar>
						<button
							type='button'
							aria-label='Compartir perfil'
							className='of-icon-btn w-12 h-12'
						>
							<Share2 className='w-5 h-5' />
						</button>
					</div>

					<div className='flex items-center gap-2 mb-1'>
						<h1 className='text-2xl font-bold'>{user.name}</h1>
						{user.isVerified && <VerifiedBadge size='md' />}
					</div>
					{user.username && <p className='text-muted-foreground text-sm mb-2'>@{user.username}</p>}
					
					{/* Área de descripción más prominente */}
					<div className='mt-4 mb-4 min-h-[80px]'>
						{user.bio ? (
							<p className='text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border-l-4 border-primary/50'>
								{user.bio}
							</p>
						) : (
							<div className='text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border-l-4 border-muted-foreground/30 italic'>
								Sin descripción aún...
							</div>
						)}
					</div>

					{!isMyProfile && (
						<div className='mb-3'>
							<FollowButton profileId={user.id} initialIsFollowing={isFollowing} />
						</div>
					)}
					{isMyProfile && (
						<div className='mb-3'>
							<Link href='/update-profile'>
								<button className='of-pill text-primary border-primary/30 inline-flex items-center gap-2 hover:bg-primary/10'>
									<Pencil className='w-4 h-4' />
									EDITAR PERFIL
								</button>
							</Link>
						</div>
					)}

					{!isMyProfile && isCreator && (
						<div className='mt-5'>
							<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2'>Suscripción</p>
							{isSubscribedToCreator ? (
								<div className='space-y-3'>
									<button className='of-primary-btn-wide bg-green-500 text-white border-green-500/30' disabled>
										<span>SUSCRITO</span>
										<span>${subscriptionPrice / 100}/mes</span>
									</button>
									<CancelSubscriptionButton creatorId={user.id} />
								</div>
							) : (
								<Link href={`/subscribe/${user.id}`}>
									<button className='of-primary-btn-wide'>
										<span>SUSCRIBETE</span>
										<span>${subscriptionPrice / 100}/mes</span>
									</button>
								</Link>
							)}
						</div>
					)}
				</div>

				<ProfileTabs userId={user.id} postCount={postCount} mediaCount={mediaCount} canViewPrivate={canViewPrivate} isMyProfile={isMyProfile} />
			</div>
		</BaseLayout>
	);
};

export default ProfilePage;
