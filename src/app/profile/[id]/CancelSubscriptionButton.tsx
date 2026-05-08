"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CancelSubscriptionButtonProps {
	creatorId: string;
}

const CancelSubscriptionButton = ({ creatorId }: CancelSubscriptionButtonProps) => {
	const { toast } = useToast();
	const [isProcessing, setIsProcessing] = useState(false);

	const handleCancel = async () => {
		if (confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
			setIsProcessing(true);
			try {
				const response = await fetch('/api/creator-dashboard/subscription/cancel', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ creatorId }),
				});
				const data = await response.json();
				if (response.ok) {
					toast({
						title: "Suscripción cancelada",
						description: "Tu suscripción se ha cancelado correctamente.",
					});
					window.location.href = `/profile/${creatorId}`;
				} else {
					toast({
						title: "Error",
						description: data.error || "No se pudo cancelar la suscripción",
						variant: "destructive",
					});
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al cancelar la suscripción",
					variant: "destructive",
				});
			} finally {
				setIsProcessing(false);
			}
		}
	};

	return (
		<button
			className='w-full bg-red-500 text-white font-bold py-3.5 rounded-full flex items-center justify-between px-5 hover:bg-red-600 transition-colors'
			onClick={handleCancel}
			disabled={isProcessing}
		>
			<span>CANCELAR SUSCRIPCIÓN</span>
			{isProcessing && (
				<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			)}
		</button>
	);
};

export default CancelSubscriptionButton;
