"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReceiptUploadProps {
	creatorId: string;
	amount: number;
}

const ReceiptUpload = ({ creatorId, amount }: ReceiptUploadProps) => {
	const { toast } = useToast();
	const router = useRouter();
	const [receiptUrl, setReceiptUrl] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			// Crear una URL temporal para mostrar la imagen
			setReceiptUrl(URL.createObjectURL(selectedFile));
		}
	};

	const { mutate: submitReceipt, isPending } = useMutation({
		mutationFn: async () => {
			if (!file) throw new Error("No file selected");

			// Subir a Cloudinary
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", "onlyhub-receipts"); // Reemplaza con tu upload preset

			const cloudinaryRes = await fetch(
				`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
				{
					method: "POST",
					body: formData,
				}
			);

			const cloudinaryData = await cloudinaryRes.json();
			if (!cloudinaryData.secure_url) throw new Error("Failed to upload to Cloudinary");

			// Enviar la URL a la API
			const res = await fetch("/api/submit-receipt", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ creatorId, amount, receiptUrl: cloudinaryData.secure_url }),
			});
			if (!res.ok) throw new Error("Failed to submit receipt");
			return res.json();
		},
		onSuccess: () => {
			toast({ title: "Comprobante enviado" });
			router.push(`/profile/${creatorId}`);
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	return (
		<div className='space-y-4'>
			<p className='text-sm text-muted-foreground'>Sube una foto del comprobante de pago</p>
			<div className='border-2 border-dashed rounded-lg p-8 text-center'>
				<Upload className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
				<p className='text-sm text-muted-foreground mb-4'>Arrastra y suelta tu comprobante aquí</p>
				<input
					type='file'
					accept='image/*'
					onChange={handleFileChange}
					className='hidden'
					id='receipt-upload'
				/>
				<label htmlFor='receipt-upload' className='cursor-pointer bg-primary text-white px-4 py-2 rounded-lg inline-block'>
					Seleccionar archivo
				</label>
			</div>
			<Button
				className='w-full'
				onClick={() => submitReceipt()}
				disabled={!receiptUrl || isPending}
			>
				{isPending ? "Enviando..." : "Enviar comprobante"}
			</Button>
		</div>
	);
};

export default ReceiptUpload;
