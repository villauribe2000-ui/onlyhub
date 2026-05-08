import BaseLayout from "@/components/BaseLayout";
import Posts from "./Posts";
import prisma from "@/db/prisma";
import { getUserProfileAction } from "@/app/update-profile/actions";
import { notFound } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Search, MoreVertical, ImageIcon, FileText, HelpCircle, Type } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import SearchButton from "./SearchButton";

const HomeScreen = async () => {
	const admin = await prisma.user.findUnique({ where: { email: process.env.ADMIN_EMAIL } });
	const user = await getUserProfileAction();
	const { getUser } = getKindeServerSession();
	const kindeUser = await getUser();
	const isAdmin = kindeUser?.email === process.env.ADMIN_EMAIL;

	if (!user) return notFound();

	// Check if user is subscribed by looking for an active subscription
	const subscription = await prisma.subscription.findUnique({
		where: { userId: user.id },
	});
	const isSubscribed = !!subscription;

	return (
		<BaseLayout>
			<div className='flex flex-col'>
				{/* Header */}
				<div className='flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<h1 className='font-black text-lg uppercase tracking-wide'>Inicio</h1>
					<div className='flex items-center gap-3'>
						<SearchButton />
						<MoreVertical className='w-5 h-5 text-muted-foreground cursor-pointer' />
					</div>
				</div>

				{/* New post box — only for admin */}
				{isAdmin && (
					<Link href='/secret-dashboard' className='block'>
						<div className='flex items-start gap-3 px-4 py-3 border-b hover:bg-muted/30 transition-colors'>
							<Avatar className='w-9 h-9 shrink-0'>
								<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className='flex-1'>
								<p className='text-muted-foreground text-sm'>Escribir nueva publicación...</p>
								<div className='flex items-center gap-4 mt-3'>
									<ImageIcon className='w-5 h-5 text-muted-foreground' />
									<FileText className='w-5 h-5 text-muted-foreground' />
									<HelpCircle className='w-5 h-5 text-muted-foreground' />
									<Type className='w-5 h-5 text-muted-foreground' />
								</div>
							</div>
						</div>
					</Link>
				)}

				{/* Filter bar */}
				<div className='flex items-center gap-2 px-4 py-3 border-b'>
					<span className='bg-muted text-foreground text-sm font-semibold px-4 py-1.5 rounded-full'>Todo</span>
				</div>

				{/* Posts — feed first, no profile header */}
				<Posts canViewPrivate={isSubscribed} />
			</div>
		</BaseLayout>
	);
};
export default HomeScreen;
