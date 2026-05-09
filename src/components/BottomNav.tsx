"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Plus } from "lucide-react";
import UserPanel from "./UserPanel";
import { useQuery } from "@tanstack/react-query";

interface BottomNavProps {
	image?: string | null;
	name?: string;
	username?: string | null;
	isAdmin?: boolean;
	billingUrl?: string;
	isCreator?: boolean;
	isVerified?: boolean;
	balance?: number;
	totalLikes?: number;
	followersCount?: number;
}

const BottomNav = ({ image, name, username, isAdmin, billingUrl, isCreator, isVerified, balance, totalLikes, followersCount }: BottomNavProps) => {
	const pathname = usePathname();

	const { data: unreadData } = useQuery({
		queryKey: ["unread-notifications"],
		queryFn: async () => {
			const res = await fetch("/api/notifications/unread-count");
			if (!res.ok) return { count: 0 };
			return res.json();
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	const unreadCount = unreadData?.count || 0;

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-between px-6 py-2 md:hidden'>
			<Link href='/' className={`flex items-center justify-center p-2 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>
				<Home className='w-6 h-6' />
			</Link>

			<Link href='/notifications' className={`flex items-center justify-center p-2 relative ${pathname === "/notifications" ? "text-primary" : "text-muted-foreground"}`}>
				<Bell className='w-6 h-6' />
				{unreadCount > 0 && (
					<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1'>
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</Link>

			<Link href='/new-post' className='flex items-center justify-center p-2'>
				<div className='w-9 h-9 rounded-full border-2 border-muted-foreground flex items-center justify-center'>
					<Plus className='w-5 h-5 text-muted-foreground' />
				</div>
			</Link>

			<Link href='/messages' className={`flex items-center justify-center p-2 ${pathname === "/messages" ? "text-primary" : "text-muted-foreground"}`}>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
				</svg>
			</Link>

			<UserPanel
				image={image}
				name={name || "Usuario"}
				username={username}
				billingUrl={billingUrl}
				triggerClassName='p-2 mt-0 w-auto'
				isCreator={isCreator}
				isVerified={isVerified}
				balance={balance}
				isAdmin={isAdmin}
				totalLikes={totalLikes}
				followersCount={followersCount}
			/>
		</div>
	);
};
export default BottomNav;
