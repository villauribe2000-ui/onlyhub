import BaseLayout from "@/components/BaseLayout";
import NotificationsList from "./NotificationsList";
import { ArrowLeft, Search, Settings } from "lucide-react";
import BackButton from "@/components/BackButton";

const NotificationsPage = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<div className='flex flex-col'>
				{/* Header */}
				<div className='flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<div className='flex items-center gap-3'>
						<BackButton ariaLabel='Volver a la página anterior'>
							<ArrowLeft className='w-5 h-5' />
						</BackButton>
						<h1 className='font-black text-lg uppercase tracking-wide'>Notificaciones</h1>
					</div>
					<div className='flex items-center gap-3'>
						<Search className='w-5 h-5 text-muted-foreground cursor-pointer' />
						<Settings className='w-5 h-5 text-muted-foreground cursor-pointer' />
					</div>
				</div>

				{/* Filter tabs */}
				<div className='flex items-center gap-2 px-4 py-3 border-b overflow-x-auto'>
					{["Todo", "Etiquetas", "Comentarios", "Menciones", "Suscripciones"].map((tab, i) => (
						<span
							key={tab}
							className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer ${
								i === 0
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-muted"
							}`}
						>
							{tab}
						</span>
					))}
				</div>

				<NotificationsList />
			</div>
		</BaseLayout>
	);
};
export default NotificationsPage;
