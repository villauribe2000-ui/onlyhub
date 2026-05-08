"use client";

import { useState, useTransition } from "react";
import { submitPlaqueClaimAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const PlaqueClaimForm = ({ milestone, initialStatus }: { milestone: number; initialStatus: string }) => {
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();
	const [nameOnPlaque, setNameOnPlaque] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [country, setCountry] = useState("");

	const disabled = initialStatus !== "pending" && initialStatus !== "submitted";

	return (
		<form
			className='of-card p-4 space-y-3'
			onSubmit={(e) => {
				e.preventDefault();
				startTransition(async () => {
					try {
						await submitPlaqueClaimAction({
							milestone,
							nameOnPlaque,
							address,
							city,
							state: state || undefined,
							postalCode,
							country,
						});
						toast({ title: "Formulario enviado" });
					} catch (err: any) {
						toast({ title: "Error", description: err?.message || "No se pudo enviar", variant: "destructive" });
					}
				});
			}}
		>
			<div>
				<p className='text-sm font-black'>Placa OnlyHub ({milestone.toLocaleString()} seguidores)</p>
				<p className='text-xs text-muted-foreground'>Nombre que quieres que salga en la placa y dirección de entrega.</p>
			</div>

			<Input placeholder='Nombre en la placa' value={nameOnPlaque} onChange={(e) => setNameOnPlaque(e.target.value)} required />
			<Input placeholder='Dirección' value={address} onChange={(e) => setAddress(e.target.value)} required />
			<div className='grid grid-cols-2 gap-2'>
				<Input placeholder='Ciudad' value={city} onChange={(e) => setCity(e.target.value)} required />
				<Input placeholder='Estado / Provincia (opcional)' value={state} onChange={(e) => setState(e.target.value)} />
			</div>
			<div className='grid grid-cols-2 gap-2'>
				<Input placeholder='Código postal' value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
				<Input placeholder='País' value={country} onChange={(e) => setCountry(e.target.value)} required />
			</div>

			<Button type='submit' className='w-full rounded-full font-black' disabled={isPending || disabled}>
				{isPending ? "Enviando..." : initialStatus === "submitted" ? "Enviado (puedes actualizar)" : "Enviar"}
			</Button>
		</form>
	);
};

export default PlaqueClaimForm;

