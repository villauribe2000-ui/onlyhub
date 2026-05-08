"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { setCreatorSubscriptionPriceAction, setCreatorSubscriptionFreeAction } from "../actions";

const SubscriptionSettings = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [price1mo, setPrice1mo] = useState("");
	const [price3mo, setPrice3mo] = useState("");
	const [price12mo, setPrice12mo] = useState("");
	const [isFree, setIsFree] = useState(false);
	const [paypalLink, setPaypalLink] = useState("");

	const { mutate: setSubscriptionPrice, isPending } = useMutation({
		mutationFn: async ({ price1mo, price3mo, price12mo, paypalLink }: { price1mo: number; price3mo?: number; price12mo?: number; paypalLink: string }) => {
			// First save PayPal link
			if (paypalLink) {
				await fetch("/api/creator-dashboard/paypal-link", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ paypalLink }),
				});
			}

			// Then save subscription price
			await setCreatorSubscriptionPriceAction("me", price1mo, price3mo, price12mo);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			toast({ title: "Suscripción actualizada" });
			setPrice1mo("");
			setPrice3mo("");
			setPrice12mo("");
			setPaypalLink("");
		},
	});

	const { mutate: setSubscriptionFree, isPending: isFreePending } = useMutation({
		mutationFn: async () => {
			await setCreatorSubscriptionFreeAction("me");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			toast({ title: "Suscripción puesta como gratis" });
			setIsFree(true);
		},
	});

	return (
		<div className='mt-6'>
			<p className='text-xl font-bold mb-4'>Configurar Suscripción</p>
			<div className='border rounded-xl p-6 max-w-md'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
						<input
							type='radio'
							id='free'
							name='subscriptionType'
							checked={isFree}
							onChange={() => {
								setIsFree(true);
								setPrice1mo("");
								setPrice3mo("");
								setPrice12mo("");
							}}
							className='w-4 h-4'
						/>
						<label htmlFor='free' className='text-sm font-medium'>Suscripción GRATIS (todos pueden ver)</label>
					</div>

					<div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
						<input
							type='radio'
							id='paid'
							name='subscriptionType'
							checked={!isFree}
							onChange={() => setIsFree(false)}
							className='w-4 h-4'
						/>
						<label htmlFor='paid' className='text-sm font-medium'>Suscripción de PAGO</label>
					</div>

					{!isFree && (
						<div className='space-y-4 animate-in fade-in slide-in-from-top-2 duration-200'>
							<div className='space-y-2'>
								<Label htmlFor='price1mo'>Precio mensual (USD)</Label>
								<div className='relative'>
									<span className='absolute left-3 top-2.5 text-muted-foreground'>$</span>
									<Input
										id='price1mo'
										type='number'
										placeholder='5.00'
										value={price1mo}
										onChange={(e) => setPrice1mo(e.target.value)}
										className='pl-7'
										min='0'
										step='0.01'
									/>
								</div>
								<p className='text-xs text-muted-foreground'>Precio base para suscripción mensual</p>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='price3mo'>Precio 3 meses (USD) - Opcional</Label>
								<div className='relative'>
									<span className='absolute left-3 top-2.5 text-muted-foreground'>$</span>
									<Input
										id='price3mo'
										type='number'
										placeholder='12.75'
										value={price3mo}
										onChange={(e) => setPrice3mo(e.target.value)}
										className='pl-7'
										min='0'
										step='0.01'
									/>
								</div>
								<p className='text-xs text-muted-foreground'>Precio total para 3 meses (aprox. 15% descuento)</p>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='price12mo'>Precio 12 meses (USD) - Opcional</Label>
								<div className='relative'>
									<span className='absolute left-3 top-2.5 text-muted-foreground'>$</span>
									<Input
										id='price12mo'
										type='number'
										placeholder='45.00'
										value={price12mo}
										onChange={(e) => setPrice12mo(e.target.value)}
										className='pl-7'
										min='0'
										step='0.01'
									/>
								</div>
								<p className='text-xs text-muted-foreground'>Precio total para 12 meses (aprox. 25% descuento)</p>
							</div>

							<div className='space-y-2 pt-4 border-t'>
								<Label htmlFor='paypalLink'>Link de PayPal (Obligatorio)</Label>
								<Input
									id='paypalLink'
									type='url'
									placeholder='https://www.paypal.com/ncp/payment/...'
									value={paypalLink}
									onChange={(e) => setPaypalLink(e.target.value)}
									className='mt-1'
								/>
								<p className='text-xs text-muted-foreground'>Pega tu link de PayPal aquí para recibir los pagos de tus suscriptores</p>
							</div>
						</div>
					)}

					{isFree ? (
						<Button
							className='w-full mt-4'
							onClick={() => setSubscriptionFree()}
							disabled={isFreePending}
						>
							{isFreePending ? "Guardando..." : "Poner como gratis"}
						</Button>
					) : (
						<Button
							className='w-full mt-4'
							onClick={() => {
								const p1mo = parseFloat(price1mo) * 100;
								const p3mo = price3mo ? parseFloat(price3mo) * 100 : undefined;
								const p12mo = price12mo ? parseFloat(price12mo) * 100 : undefined;

								if (!paypalLink.trim()) {
									toast({ title: "Error", description: "El link de PayPal es obligatorio", variant: "destructive" });
									return;
								}

								if (p1mo > 0) {
									setSubscriptionPrice({ price1mo: p1mo, price3mo: p3mo, price12mo: p12mo, paypalLink });
								} else {
									toast({ title: "Error", description: "El precio mensual es obligatorio", variant: "destructive" });
								}
							}}
							disabled={isPending}
						>
							{isPending ? "Guardando..." : "Guardar precios"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};
export default SubscriptionSettings;
