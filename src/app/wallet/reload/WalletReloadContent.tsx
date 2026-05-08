"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { CreditCard, Lock, Shield, PayPal, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const WalletReloadContent = () => {
	const { toast } = useToast();
	const { user } = useKindeBrowserClient();
	const router = useRouter();
	const [amount, setAmount] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [showModerationSheet, setShowModerationSheet] = useState(false);
	const [moderationAmount, setModerationAmount] = useState("");

	const handleReload = async () => {
		if (!user) {
			toast({
				title: "Error",
				description: "Debes iniciar sesión para recargar saldo",
				variant: "destructive",
			});
			return;
		}

		const amountNum = parseFloat(amount);
		if (!amountNum || amountNum <= 0) {
			toast({
				title: "Error",
				description: "Ingresa un monto válido",
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			const response = await fetch("/api/wallet/reload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: amountNum }),
			});
			const data = await response.json();
			if (response.ok) {
				// Redirect to PayPal
				window.location.href = data.url;
			} else {
				toast({
					title: "Error",
					description: data.error,
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al procesar la recarga",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleModerationRequest = async () => {
		if (!user) {
			toast({
				title: "Error",
				description: "Debes iniciar sesión para recargar saldo",
				variant: "destructive",
			});
			return;
		}

		const amountNum = parseFloat(moderationAmount);
		if (!amountNum || amountNum <= 0) {
			toast({
				title: "Error",
				description: "Ingresa un monto válido",
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			// Create a notification for the admin
			const response = await fetch("/api/wallet/reload/moderation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: amountNum }),
			});

			if (response.ok) {
				toast({
					title: "Solicitud enviada",
					description: "El admin revisará tu solicitud y te agregará el saldo.",
				});
				setShowModerationSheet(false);
				setModerationAmount("");
			} else {
				const data = await response.json();
				toast({
					title: "Error",
					description: data.error || "Ocurrió un error al enviar la solicitud",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al enviar la solicitud",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-black mb-2">Recargar Saldo</h1>
					<p className="text-muted-foreground">Agrega fondos a tu billetera para suscribirte a creadores</p>
				</div>

				<Card className="border-0 shadow-xl">
					<CardHeader className="bg-[#00AFF0]/5 border-b">
						<CardTitle className="text-2xl font-black text-[#00AFF0]">Monto de recarga</CardTitle>
						<CardDescription>Elige cuánto quieres recargar</CardDescription>
					</CardHeader>
					<CardContent className="p-8">
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="amount">Monto (USD)</Label>
								<div className="relative">
									<span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
									<Input
										id="amount"
										type="number"
										placeholder="10.00"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="pl-7"
										min="1"
										step="0.01"
									/>
								</div>
								<p className="text-xs text-muted-foreground">Mínimo $1.00 USD</p>
							</div>

							<div className="grid grid-cols-4 gap-2">
								{[10, 25, 50, 100].map((amount) => (
									<button
										key={amount}
										onClick={() => setAmount(amount.toString())}
										className="py-2 px-4 rounded-lg border text-sm font-semibold hover:bg-muted transition-colors"
									>
										${amount}
									</button>
								))}
							</div>

							<div className="space-y-4 pt-4 border-t">
								<div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
									<div className="flex items-center gap-3">
										<CreditCard className="w-6 h-6 text-[#00AFF0]" />
										<div>
											<p className="font-semibold">Pago Seguro</p>
											<p className="text-xs text-muted-foreground">Tarjetas y PayPal</p>
										</div>
									</div>
									<Lock className="w-5 h-5 text-green-500" />
								</div>

								<div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
									<div className="flex items-center gap-3">
										<img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" className="h-6 w-auto" />
										<div>
											<p className="font-semibold">PayPal</p>
											<p className="text-xs text-muted-foreground">Pago rápido y seguro</p>
										</div>
									</div>
									<Shield className="w-5 h-5 text-[#00AFF0]" />
								</div>
							</div>

							<Button
								onClick={handleReload}
								disabled={isProcessing || !amount}
								className="w-full h-14 text-lg font-black bg-[#00AFF0] hover:bg-[#0099d9] shadow-lg shadow-[#00AFF0]/25"
							>
								{isProcessing ? (
									<span className="flex items-center gap-2">
										<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Procesando...
									</span>
								) : (
									<span className="flex items-center gap-2">
										<img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" className="h-6 w-auto" />
										Recargar Saldo
									</span>
								)}
							</Button>

							<Sheet open={showModerationSheet} onOpenChange={setShowModerationSheet}>
								<SheetTrigger asChild>
									<Button variant="outline" className="w-full h-12 bg-muted hover:bg-muted/80 text-foreground mt-4">
										<AlertCircle className="w-4 h-4 mr-2" />
										Comprar con moderación
									</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetHeader>
										<SheetTitle className="text-xl font-black">Comprar con moderación</SheetTitle>
									</SheetHeader>
									<div className="py-4 space-y-4">
										<p className="text-sm text-muted-foreground">
											Solicita al administrador que te agregue saldo directamente a tu cuenta.
										</p>
										<div className="space-y-2">
											<Label htmlFor="moderationAmount">Monto (USD)</Label>
											<Input
												id="moderationAmount"
												type="number"
												placeholder="Ej: 25.00"
												value={moderationAmount}
												onChange={(e) => setModerationAmount(e.target.value)}
												min="1"
												step="0.01"
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											El administrador revisará tu solicitud y te agregará el saldo manualmente.
										</p>
										<Button
											onClick={handleModerationRequest}
											disabled={isProcessing || !moderationAmount}
											className="w-full"
										>
											{isProcessing ? "Enviando..." : "Enviar solicitud"}
										</Button>
									</div>
								</SheetContent>
							</Sheet>

							<p className="text-center text-xs text-muted-foreground">
								Al recargar, aceptas nuestros términos y condiciones. 
								El saldo se agregará a tu billetera después de que el admin apruebe tu pago.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default WalletReloadContent;
