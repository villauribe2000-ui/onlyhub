import BaseLayout from "@/components/BaseLayout";
import { getMyPlaqueClaimsAction } from "./actions";
import PlaqueClaimForm from "./PlaqueClaimForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";

const PlaquePage = async () => {
	const claims = await getMyPlaqueClaimsAction();

	return (
		<BaseLayout renderRightPanel={false}>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<div className='flex items-center gap-3'>
						<BackButton ariaLabel='Volver a la página anterior'>
							<ArrowLeft className='w-5 h-5' />
						</BackButton>
						<h1 className='font-black text-lg uppercase tracking-wide'>Placa OnlyHub</h1>
					</div>
				</div>

				<div className='px-4 py-6 space-y-4'>
					{claims.length === 0 ? (
						<div className='of-card p-4'>
							<p className='font-bold'>Aún no tienes placas disponibles</p>
							<p className='text-sm text-muted-foreground mt-1'>
								Cuando alcances 100K, 1M o 10M seguidores, aquí aparecerá el formulario para reclamar tu placa.
							</p>
						</div>
					) : (
						claims.map((c) => (
							<PlaqueClaimForm key={c.id} milestone={c.milestone} initialStatus={c.status} />
						))
					)}
				</div>
			</div>
		</BaseLayout>
	);
};

export default PlaquePage;

