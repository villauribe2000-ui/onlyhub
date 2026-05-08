import BaseLayout from "@/components/BaseLayout";
import { ArrowLeft, Search, Plus, SlidersHorizontal, Pencil } from "lucide-react";
import BackButton from "@/components/BackButton";

const MessagesPage = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<div className='flex flex-col h-full'>
				{/* Header */}
				<div className='flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<div className='flex items-center gap-3'>
						<BackButton ariaLabel='Volver a la página anterior'>
							<ArrowLeft className='w-5 h-5' />
						</BackButton>
						<h1 className='font-black text-lg uppercase tracking-wide'>Mensajes</h1>
					</div>
					<div className='flex items-center gap-4'>
						<Search className='w-5 h-5 text-muted-foreground cursor-pointer' />
						<Plus className='w-5 h-5 text-muted-foreground cursor-pointer' />
					</div>
				</div>

				{/* Filter bar */}
				<div className='flex items-center justify-between px-4 py-3 border-b'>
					<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
						El más reciente primero
					</p>
					<SlidersHorizontal className='w-4 h-4 text-muted-foreground' />
				</div>

				<div className='flex items-center gap-2 px-4 py-3 border-b'>
					<span className='bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full'>Todo</span>
					<button className='p-1.5 rounded-full hover:bg-muted transition-colors'>
						<Pencil className='w-4 h-4 text-muted-foreground' />
					</button>
				</div>

				{/* Empty state */}
				<div className='flex-1 flex items-center justify-center'>
					<p className='text-muted-foreground text-sm'>No se encontró nada</p>
				</div>
			</div>
		</BaseLayout>
	);
};
export default MessagesPage;
