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

	const compactNumber = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' Millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + ' Mil';
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
							<div className='flex items-center gap-4 text-white ml-8 mt-2'>
								<div className='flex flex-col items-center'>
									<span className='text-lg font-bold'>{compactNumber(videoCount)}</span>
									<span className='text-xs opacity-90'>Videos</span>
								</div>
								<div className='flex flex-col items-center'>
									<span className='text-lg font-bold'>{compactNumber(likesCount)}</span>
									<span className='text-xs opacity-90'>Likes</span>
								</div>
								<div className='flex flex-col items-center'>
									<span className='text-lg font-bold'>{compactNumber(displayFollowersCount)}</span>
									<span className='text-xs opacity-90'>Seguidores</span>
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
