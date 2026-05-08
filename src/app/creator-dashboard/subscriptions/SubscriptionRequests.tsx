"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, DollarSign } from "lucide-react";
import { useState } from "react";
import { getSubscriptionRequestsAction, approveSubscriptionRequestAction, rejectSubscriptionRequestAction } from "../actions";

const SubscriptionRequests = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

	const { data: requests, isLoading } = useQuery({
		queryKey: ["subscriptionRequests"],
		queryFn: () => getSubscriptionRequestsAction(),
	});

	const { mutate: approveRequest } = useMutation({
		mutationFn: ({ requestId }: { requestId: string }) => approveSubscriptionRequestAction(requestId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscriptionRequests"] });
			toast({ title: "Suscripción aprobada" });
		},
	});

	const { mutate: rejectRequest } = useMutation({
		mutationFn: ({ requestId }: { requestId: string }) => rejectSubscriptionRequestAction(requestId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscriptionRequests"] });
			toast({ title: "Suscripción rechazada" });
		},
	});

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground'>Cargando...</p>;

	return (
		<div className='mt-6'>
			<p className='text-xl font-bold mb-4'>Solicitudes de suscripción ({requests?.length || 0})</p>
			<div className='flex flex-col gap-4'>
				{requests?.length === 0 && (
					<p className='text-muted-foreground text-sm text-center py-10'>No hay solicitudes pendientes</p>
				)}
				{requests?.map((req: any) => (
					<div key={req.id} className='border rounded-xl p-4 flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
									<span className='font-bold text-sm'>{req.user.name[0]}</span>
								</div>
								<div>
									<p className='font-semibold text-sm'>{req.user.name}</p>
									<p className='text-xs text-muted-foreground'>{req.user.email}</p>
								</div>
							</div>
							<div className='text-right'>
								<p className='font-bold text-sm'>${req.amount / 100}</p>
								<p className='text-xs text-muted-foreground'>Suscripción</p>
							</div>
						</div>

						{req.receiptUrl && (
							<div className='bg-muted rounded-lg p-3'>
								<p className='text-xs text-muted-foreground mb-2'>Comprobante:</p>
								<img src={req.receiptUrl} alt='Comprobante' className='rounded-lg max-h-32 object-contain' />
							</div>
						)}

						<div className='flex gap-2 pt-2 border-t'>
							<Button size='sm' onClick={() => approveRequest({ requestId: req.id })} className='flex-1 bg-green-500 text-white hover:bg-green-600'>
								<Check className='w-4 h-4 mr-1' /> Aprobar
							</Button>
							<Button size='sm' variant='destructive' onClick={() => rejectRequest({ requestId: req.id })} className='flex-1'>
								<X className='w-4 h-4 mr-1' /> Rechazar
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SubscriptionRequests;
