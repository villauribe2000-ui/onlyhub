"use client";
import { useQuery } from "@tanstack/react-query";

const NotificationBadge = () => {
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

	if (unreadCount === 0) return null;

	return (
		<span className='absolute top-0 right-0 lg:relative lg:ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1'>
			{unreadCount > 99 ? '99+' : unreadCount}
		</span>
	);
};

export default NotificationBadge;
