"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, DollarSign } from "lucide-react";
import { useState } from "react";
import { getWalletReloadsAction, approveWalletReloadAction, rejectWalletReloadAction } from "../actions";

const WalletReloadsTab = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { data: walletReloads, isLoading } = useQuery({
		queryKey: ["walletReloads"],
		queryFn: () => getWalletReloadsAction(),
	});

	const { mutate: approveWalletReload } = useMutation({
		mutationFn: ({ id }: { id: string }) => approveWalletReloadAction(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["walletReloads"] });
			toast({ title: "Recarga aprobada" });
		},
	});

	const { mutate: rejectWalletReload } = useMutation({
		mutationFn: ({ id }: { id: string }) => rejectWalletReloadAction(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["walletReloads"] });
			toast({ title: "Recarga rechazada" });
		},
	});

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground'>Cargando...</p>;

	return (
		<div className='mt-6'>
			<p className='text-xl font-bold mb-4'>Recargas de Saldo ({walletReloads?.length || 0})</p>
			<div className='flex flex-col gap-4'>
				{walletReloads?.length === 0 && (
					<p className='text-muted-foreground text-sm text-center py-10'>No hay recargas pendientes</p>
				)}
				{walletReloads?.map((reload: any) => (
					<div key={reload.id} className='border rounded-xl p-4 flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
									<span className='font-bold text-sm'>{reload.user.name[0]}</span>
								</div>
								<div>
									<p className='font-semibold text-sm'>{reload.user.name}</p>
									<p className='text-xs text-muted-foreground'>{reload.user.email}</p>
								</div>
							</div>
							<div className='text-right'>
								<p className='font-bold text-sm'>${reload.amount / 100}</p>
								<p className='text-xs text-muted-foreground'>Recarga de saldo</p>
							</div>
						</div>

						<div className='flex gap-2 pt-2 border-t'>
							<Button size='sm' onClick={() => approveWalletReload({ id: reload.id })} className='flex-1 bg-green-500 text-white hover:bg-green-600'>
								<Check className='w-4 h-4 mr-1' /> Aprobar
							</Button>
							<Button size='sm' variant='destructive' onClick={() => rejectWalletReload({ id: reload.id })} className='flex-1'>
								<X className='w-4 h-4 mr-1' /> Rechazar
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default WalletReloadsTab;
