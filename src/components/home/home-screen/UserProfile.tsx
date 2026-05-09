import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CoverImage from "./CoverImage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/db/prisma";
import { getUserProfileAction } from "@/app/update-profile/actions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import EditAvatarButton from "./EditAvatarButton";
import EditProfileInfo from "./EditProfileInfo";
import VerifiedBadge from "@/components/VerifiedBadge";
import SubscriptionBox from "./SubscriptionBox";
import { compactNumber } from "@/lib/utils";

const UserProfile = async () => {
	const admin = await prisma.user.findUnique({
		where: { email: process.env.ADMIN_EMAIL! },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			isVerified: true,
			coverImage: true,
			username: true,
			bio: true,
			subscriptionPrice: true,
			subscriptionPrice3mo: true,
			subscriptionPrice12mo: true,
			freeTrialDays: true,
		},
	});

	const currentUser = await getUserProfileAction();
	const { getUser } = getKindeServerSession();
	const kindeUser = await getUser();
	const isAdmin = kindeUser?.email === process.env.ADMIN_EMAIL;

	const postCount = await prisma.post.count();
	const totalLikes = await prisma.post.aggregate({ _sum: { likes: true } });
	const videoCount = await prisma.post.count({
		where: {
			mediaType: {
				contains: "video",
				mode: "insensitive",
			},
		},
	});
	
	// Get followers count for admin
	const followersCount = await prisma.follow.count({
		where: { followingId: admin?.id },
	});
	const displayFollowersCount = followersCount + (admin?.followersOverride || 0);

	// Check if current user is subscribed to the admin (creator)
	// Look for a subscription where userId matches current user's id
	const subscription = await prisma.subscription.findUnique({
		where: { userId: currentUser?.id },
	});

	// isSubscribed is true if there's an active subscription for this user
	const isSubscribed = !!subscription;
	
	// Debug log
	console.log("UserProfile - currentUser.id:", currentUser?.id);
	console.log("UserProfile - admin.id:", admin?.id);
	console.log("UserProfile - admin.isVerified:", admin?.isVerified);
	console.log("UserProfile - subscription:", subscription);
	console.log("UserProfile - isSubscribed (for display):", isSubscribed);

	const compactNumber = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
		}
		return value.toString();
	};

	return (
		<div className='flex flex-col'>
			<CoverImage
				adminName={admin?.name!}
				coverImage={(admin as any)?.coverImage}
				isAdmin={isAdmin}
				videoCount={videoCount}
				likesCount={totalLikes._sum.likes || 0}
				followersCount={displayFollowersCount}
			/>

			<div className='px-4 pb-4'>
				<div className='flex items-end justify-between -mt-10 mb-3'>
					<div className='relative w-fit'>
						<Avatar className='w-20 h-20 border-4 border-background ring-2 ring-primary/20'>
							<AvatarImage src={admin?.image || "/user-placeholder.png"} className='object-cover' />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						{isAdmin && <EditAvatarButton currentImage={admin?.image} />}
					</div>

					<div className='flex gap-2 mb-1'>
						{!isSubscribed ? (
							<Button asChild className='rounded-full px-6 font-bold'>
								<Link href={`/subscribe/${admin?.id}`}>Subscribe</Link>
							</Button>
						) : (
							<Button variant='outline' className='rounded-full px-6 font-bold bg-green-500 text-white hover:bg-green-600'>
								Subscribed ✓
							</Button>
						)}
					</div>
				</div>

				{/* Name, username, bio */}
				<div className='flex flex-col gap-1 mt-1'>
					{isAdmin ? (
						<div className='flex items-start gap-1'>
							<EditProfileInfo
								name={admin?.name!}
								username={(admin as any)?.username}
								bio={(admin as any)?.bio}
							/>
							{(admin as any)?.isVerified && (
								<VerifiedBadge size='md' className='mt-1' />
							)}
						</div>
					) : (
						<div className='flex flex-col gap-1'>
							<div className='flex items-center gap-1'>
								<p className='text-xl font-bold'>{admin?.name}</p>
								{(admin as any)?.isVerified && (
									<VerifiedBadge size='md' />
								)}
							</div>
							<p className='text-sm text-muted-foreground'>@{(admin as any)?.username || "onlyhub"}</p>
							{/* Área de descripción más prominente */}
							<div className='mt-3 min-h-[60px]'>
								{(admin as any)?.bio ? (
									<p className='text-sm leading-relaxed bg-muted/30 p-3 rounded-lg border-l-4 border-primary/50'>
										{(admin as any).bio}
									</p>
								) : (
									<div className='text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border-l-4 border-muted-foreground/30 italic'>
										Sin descripción aún...
									</div>
								)}
							</div>
						</div>
					)}
				</div>

		{!isSubscribed && (
			<SubscriptionBox
				creatorId={admin?.id}
				creatorImage={admin?.image}
				creatorName={admin?.name}
				price1mo={(admin as any)?.subscriptionPrice}
				price3mo={(admin as any)?.subscriptionPrice3mo}
				price12mo={(admin as any)?.subscriptionPrice12mo}
				freeTrialDays={(admin as any)?.freeTrialDays}
				isSubscribed={isSubscribed}
			/>
		)}

		<div aria-hidden='true' className='h-2 w-full bg-muted' />
		</div>
	);
};
export default UserProfile;
