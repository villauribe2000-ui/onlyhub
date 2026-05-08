"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsAction, markNotificationsReadAction } from "./actions";
import { useEffect } from "react";

const getIcon = (title: string) => {
	if (title.includes("verificado") || title.includes("aceptado")) return "✅";
	if (title.includes("ganado") || title.includes("pago") || title.includes("Pago")) return "💰";
	if (title.includes("retiro")) return "💸";
	if (title.includes("suscri")) return "⭐";
	return "🔔";
};

const NotificationsList = () => {
	const queryClient = useQueryClient();
	
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => getNotificationsAction(),
	});

	const { mutate: markRead } = useMutation({
		mutationFn: markNotificationsReadAction,
		onSuccess: () => {
			// Invalidate the unread count query when notifications are marked as read
			queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	useEffect(() => {
		markRead();
	}, []);

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground text-sm'>Cargando...</p>;

	if (!notifications?.length) {
		return (
			<div className='flex flex-col items-center justify-center py-32'>
				<p className='text-muted-foreground text-sm'>¡No hay notificaciones en este momento!</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col'>
			{notifications.map((n) => (
				<div key={n.id} className={`flex gap-3 px-4 py-4 border-b ${!n.isRead ? "bg-primary/5" : ""}`}>
					<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-lg'>
						{getIcon(n.title)}
					</div>
					<div className='flex flex-col gap-0.5 flex-1'>
						<p className='font-semibold text-sm'>{n.title}</p>
						<p className='text-sm text-muted-foreground whitespace-pre-line'>{n.message}</p>
						<p className='text-xs text-muted-foreground mt-1'>
							{new Date(n.createdAt).toLocaleDateString("es", {
								day: "numeric",
								month: "short",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					{!n.isRead && (
						<div className='w-2 h-2 rounded-full bg-primary mt-1 shrink-0' />
					)}
				</div>
			))}
		</div>
	);
};
export default NotificationsList;
