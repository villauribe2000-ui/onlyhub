"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

interface SubscriptionBoxProps {
	creatorId?: string;
	creatorImage?: string | null;
	creatorName?: string;
	price1mo?: number | null;
	price3mo?: number | null;
	price12mo?: number | null;
	freeTrialDays?: number | null;
	isSubscribed?: boolean;
}

const fmt = (cents: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);

const SubscriptionBox = ({
	creatorId, creatorImage, creatorName, price1mo, price3mo, price12mo, freeTrialDays, isSubscribed
}: SubscriptionBoxProps) => {
	const [showPackages, setShowPackages] = useState(true);

	if (isSubscribed) return null;
	if (!price1mo) return null;

	const price3moTotal = price3mo || Math.round(price1mo * 3 * 0.85);
	const price12moTotal = price12mo || Math.round(price1mo * 12 * 0.75);
	const discount3mo = Math.round((1 - price3moTotal / (price1mo * 3)) * 100);
	const discount12mo = Math.round((1 - price12moTotal / (price1mo * 12)) * 100);

	return (
		<div className='px-4 py-4 border-b'>
			{/* Free trial */}
			{freeTrialDays && freeTrialDays > 0 ? (
				<div className='mb-3'>
					<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1'>Suscripción</p>
					<p className='text-xl font-black'>Oferta limitada - ¡Prueba gratuita por {freeTrialDays} días!</p>
					<div className='flex items-center gap-2 mt-2 bg-muted rounded-lg px-3 py-2'>
						<Avatar className='w-7 h-7'>
							<AvatarImage src={creatorImage || "/user-placeholder.png"} className='object-cover' />
							<AvatarFallback>C</AvatarFallback>
						</Avatar>
						<span className='text-sm text-muted-foreground'>Acceso gratuito. Próximo cierre.</span>
					</div>
					<Link href={`/profile/${creatorId}`}>
						<button className='w-full mt-3 bg-[#00AFF0] text-white font-black py-3.5 rounded-full flex items-center justify-between px-5'>
							<span>SUSCRÍBETE</span>
							<span>GRATIS por {freeTrialDays} días</span>
						</button>
					</Link>
					<p className='text-xs text-muted-foreground mt-2'>Precio regular {fmt(price1mo)} /mes</p>
				</div>
			) : (
				<div className='mb-3'>
					<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1'>Suscripción</p>
					<Link href={`/profile/${creatorId}`}>
						<button className='w-full mt-2 bg-[#00AFF0] text-white font-black py-3.5 rounded-full flex items-center justify-between px-5'>
							<span>SUSCRÍBETE</span>
							<span>{fmt(price1mo)} /mes</span>
						</button>
					</Link>
				</div>
			)}

			{/* Packages */}
			<div>
				<button
					onClick={() => setShowPackages(!showPackages)}
					className='flex items-center justify-between w-full py-2'
				>
					<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>Paquetes de suscripción</p>
					{showPackages ? <ChevronUp className='w-4 h-4 text-muted-foreground' /> : <ChevronDown className='w-4 h-4 text-muted-foreground' />}
				</button>

				{showPackages && (
					<div className='flex flex-col gap-2 mt-1'>
						<Link href={`/profile/${creatorId}`}>
							<button className='w-full bg-[#00AFF0] text-white font-bold py-3.5 rounded-full flex items-center justify-between px-5'>
								<span>3 MESES ({discount3mo}% de descuento)</span>
								<span>total de {fmt(price3moTotal)}</span>
							</button>
						</Link>
						<Link href={`/profile/${creatorId}`}>
							<button className='w-full bg-[#00AFF0] text-white font-bold py-3.5 rounded-full flex items-center justify-between px-5'>
								<span>12 MESES ({discount12mo}% de descuento)</span>
								<span>total de {fmt(price12moTotal)}</span>
							</button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};
export default SubscriptionBox;
