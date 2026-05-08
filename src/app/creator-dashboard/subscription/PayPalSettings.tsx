"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getUserProfileAction } from "@/app/update-profile/actions";

interface PayPalSettingsProps {
	paypalLink?: string | null;
}

const PayPalSettings = ({ paypalLink }: PayPalSettingsProps) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [link, setLink] = useState(paypalLink || "");
	const [isSaving, setIsSaving] = useState(false);

	const { mutate: savePayPalLink, isPending } = useMutation({
		mutationFn: async (paypalLink: string) => {
			const response = await fetch("/api/creator-dashboard/paypal-link", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ paypalLink }),
			});

			if (!response.ok) {
				throw new Error("Failed to save PayPal link");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			toast({ title: "Link de PayPal guardado" });
			setIsSaving(false);
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
			setIsSaving(false);
		},
	});

	const handleSave = () => {
		if (!link.trim()) {
			toast({ title: "Error", description: "El link de PayPal es obligatorio", variant: "destructive" });
			return;
		}

		setIsSaving(true);
		savePayPalLink(link);
	};

	return (
		<div className="mt-6">
			<p className="text-xl font-bold mb-4">Configurar PayPal</p>
			<div className="border rounded-xl p-6 max-w-md">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="paypalLink">Link de PayPal</Label>
						<Input
							id="paypalLink"
							type="url"
							placeholder="https://www.paypal.com/ncp/payment/..."
							value={link}
							onChange={(e) => setLink(e.target.value)}
							className="mt-1"
						/>
						<p className="text-xs text-muted-foreground">
							Pega tu link de PayPal aquí para recibir los pagos de tus suscriptores
						</p>
					</div>

					<Button
						className="w-full mt-4"
						onClick={handleSave}
						disabled={isSaving || isPending}
					>
						{isSaving || isPending ? "Guardando..." : "Guardar Link de PayPal"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PayPalSettings;
