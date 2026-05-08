"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitCreatorRequestAction } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";

const BecomeCreatorForm = () => {
	const [message, setMessage] = useState("");
	const { toast } = useToast();
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: () => submitCreatorRequestAction(message),
		onSuccess: () => {
			toast({ title: "Solicitud enviada", description: "Te contactaremos pronto." });
			router.push("/");
		},
		onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
	});

	return (
		<div className='max-w-lg mx-auto px-4 py-10'>
			<div className='flex flex-col items-center gap-3 mb-8'>
				<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
					<TrendingUp className='w-8 h-8 text-primary' />
				</div>
				<h1 className='text-2xl font-black text-center'>Conviértete en creador</h1>
				<p className='text-muted-foreground text-center text-sm'>
					Cuéntanos sobre ti y por qué quieres ser creador en OnlyHub. Revisaremos tu solicitud y te contactaremos.
				</p>
			</div>

			<div className='flex flex-col gap-4'>
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder='Cuéntanos sobre ti, tu contenido y por qué quieres unirte...'
					rows={6}
					className='w-full border rounded-xl p-4 text-sm bg-background outline-none resize-none focus:ring-2 focus:ring-primary/30'
				/>

				<button
					onClick={() => message.trim() && mutate()}
					disabled={isPending || !message.trim()}
					className='w-full bg-primary text-white font-bold py-3 rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors'
				>
					{isPending ? "Enviando..." : "Enviar solicitud"}
				</button>
			</div>
		</div>
	);
};
export default BecomeCreatorForm;
