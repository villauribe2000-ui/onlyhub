"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Check, CreditCard, Lock, Shield, Wallet } from "lucide-react";
import Link from "next/link";

interface SubscribePageClientProps {
	creatorId: string;
	creatorName: string;
	subscriptionPrice: number;
	subscriptionPrice3mo?: number | null;
	subscriptionPrice12mo?: number | null;
	freeTrialDays?: number;
}

const SubscribePageClient = ({ creatorId, creatorName, subscriptionPrice, subscriptionPrice3mo, subscriptionPrice12mo, freeTrialDays }: SubscribePageClientProps) => {
	const { toast } = useToast();
	const { user } = useKindeBrowserClient();
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paypal">("wallet");
	const [selectedPlan, setSelectedPlan] = useState<"1mo" | "3mo" | "12mo">("1mo");

	const getCurrentPrice = () => {
		switch (selectedPlan) {
			case "3mo":
				return subscriptionPrice3mo || subscriptionPrice * 3;
			case "12mo":
				return subscriptionPrice12mo || subscriptionPrice * 12;
			default:
				return subscriptionPrice;
		}
	};

	const getPlanLabel = () => {
		switch (selectedPlan) {
			case "3mo":
				return "3 meses";
			case "12mo":
				return "12 meses";
			default:
				return "1 mes";
		}
	};

	const handleSubscribe = async () => {
		if (!user) {
			toast({
				title: "Error",
				description: "Debes iniciar sesión para suscribirte",
				variant: "destructive",
			});
			return;
		}

		if (paymentMethod === "wallet") {
			// Check if user has enough balance from API
			try {
				const response = await fetch("/api/wallet/reload");
				const data = await response.json();
				if (response.ok) {
					const userBalance = data.balance || 0;
					if (userBalance < getCurrentPrice()) {
						toast({
							title: "Saldo insuficiente",
							description: `Tu saldo es de $${(userBalance / 100).toFixed(2)} USD. Necesitas $${(getCurrentPrice() / 100).toFixed(2)} USD para suscribirte.`,
							variant: "destructive",
						});
						window.location.href = "/wallet/reload";
						return;
					}
				}
			} catch (error) {
				// Ignore error, continue with subscription attempt
			}

			// User has enough balance, subscribe directly
			setIsProcessing(true);
			try {
				const response = await fetch("/api/creator-dashboard/subscription/free", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ creatorId }),
				});
				const data = await response.json();
				if (response.ok) {
					toast({
						title: "Suscripción activa",
						description: "Te has suscrito correctamente.",
					});
					// Redirigir a la página de perfil después de suscribirse
					window.location.href = `/profile/${creatorId}`;
				} else {
					toast({
						title: "Error",
						description: data.error || "No se pudo suscribir",
						variant: "destructive",
					});
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al suscribirte",
					variant: "destructive",
				});
			} finally {
				setIsProcessing(false);
			}
		} else {
			// User wants to pay with PayPal
			try {
				const response = await fetch(`/api/creator-dashboard/paypal-link/${creatorId}`);
				const data = await response.json();

				if (response.ok && data.paypalLink) {
					// Redirect to creator's PayPal link
					window.location.href = data.paypalLink;
				} else {
					// Fallback to default PayPal link
					const defaultPaypalUrl = `https://www.paypal.com/ncp/payment/RFGJW4SCEF8PJ?amount=${getCurrentPrice() / 100}&creatorId=${creatorId}`;
					window.location.href = defaultPaypalUrl;
				}
			} catch (error) {
				// Fallback to default PayPal link
				const defaultPaypalUrl = `https://www.paypal.com/ncp/payment/RFGJW4SCEF8PJ?amount=${getCurrentPrice() / 100}&creatorId=${creatorId}`;
				window.location.href = defaultPaypalUrl;
			}
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-black mb-4">
						Suscribirse a <span className="text-[#00AFF0]">{creatorName}</span>
					</h1>
					<p className="text-lg text-muted-foreground">
						Accede a todo el contenido exclusivo y videos privados
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{/* Creator Profile Card */}
					<div className="md:col-span-1 space-y-6">
						<Card className="border-0 shadow-lg">
							<CardContent className="pt-6">
								<div className="flex flex-col items-center text-center">
									<div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00AFF0] to-blue-600 p-1 mb-4">
										<div className="w-full h-full rounded-full bg-background flex items-center justify-center">
											<span className="text-4xl font-bold text-[#00AFF0]">
												{creatorName[0].toUpperCase()}
											</span>
										</div>
									</div>
									<h2 className="text-2xl font-bold mb-2">{creatorName}</h2>
									<p className="text-sm text-muted-foreground mb-4">
										Creador de contenido verificado
									</p>
									<div className="flex gap-2 text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<Shield className="w-4 h-4 text-[#00AFF0]" />
											Verificado
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg">¿Qué incluye?</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3">
									<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
									<span className="text-sm">Contenido exclusivo</span>
								</div>
								<div className="flex items-center gap-3">
									<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
									<span className="text-sm">Videos privados</span>
								</div>
								<div className="flex items-center gap-3">
									<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
									<span className="text-sm">Acceso directo</span>
								</div>
								<div className="flex items-center gap-3">
									<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
									<span className="text-sm">Notificaciones</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Subscription Card */}
					<div className="md:col-span-2">
						<Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/30">
							<CardHeader className="bg-[#00AFF0]/5 border-b">
								<CardTitle className="text-2xl font-black text-[#00AFF0]">
									Plan de Suscripción
								</CardTitle>
								<CardDescription>
									{selectedPlan === "1mo" && "Pago mensual - Cancela cuando quieras"}
									{selectedPlan === "3mo" && "Pago por 3 meses - Ahorra dinero"}
									{selectedPlan === "12mo" && "Pago anual - Mejor precio"}
								</CardDescription>
							</CardHeader>
							<CardContent className="p-8">
								{/* Plan selector */}
								{(subscriptionPrice3mo || subscriptionPrice12mo) && (
									<div className="space-y-3 mb-6">
										<p className="text-sm font-semibold">Selecciona tu plan:</p>
										<div className="grid gap-3">
											<button
												onClick={() => setSelectedPlan("1mo")}
												className={`p-4 rounded-xl border text-left transition-all ${
													selectedPlan === "1mo"
														? "bg-[#00AFF0] text-white border-[#00AFF0]"
														: "border-border hover:bg-muted"
												}`}
											>
												<div className="flex justify-between items-center">
													<div>
														<p className="font-semibold">Plan Mensual</p>
														<p className="text-sm opacity-75">Pago mensual</p>
													</div>
													<div className="text-right">
														<p className="text-2xl font-bold">${(subscriptionPrice / 100).toFixed(2)}</p>
														<p className="text-sm opacity-75">/mes</p>
													</div>
												</div>
											</button>
											
											{subscriptionPrice3mo && (
												<button
													onClick={() => setSelectedPlan("3mo")}
													className={`p-4 rounded-xl border text-left transition-all ${
														selectedPlan === "3mo"
															? "bg-[#00AFF0] text-white border-[#00AFF0]"
															: "border-border hover:bg-muted"
													}`}
												>
													<div className="flex justify-between items-center">
														<div>
															<p className="font-semibold">Plan 3 Meses</p>
															<p className="text-sm opacity-75">Ahorra dinero</p>
														</div>
														<div className="text-right">
															<p className="text-2xl font-bold">${(subscriptionPrice3mo / 100).toFixed(2)}</p>
															<p className="text-sm opacity-75">total</p>
														</div>
													</div>
												</button>
											)}
											
											{subscriptionPrice12mo && (
												<button
													onClick={() => setSelectedPlan("12mo")}
													className={`p-4 rounded-xl border text-left transition-all ${
														selectedPlan === "12mo"
															? "bg-[#00AFF0] text-white border-[#00AFF0]"
															: "border-border hover:bg-muted"
													}`}
												>
													<div className="flex justify-between items-center">
														<div>
															<p className="font-semibold">Plan Anual</p>
															<p className="text-sm opacity-75">Mejor precio</p>
														</div>
														<div className="text-right">
															<p className="text-2xl font-bold">${(subscriptionPrice12mo / 100).toFixed(2)}</p>
															<p className="text-sm opacity-75">total</p>
														</div>
													</div>
												</button>
											)}
										</div>
									</div>
								)}

								<div className="text-center mb-8">
									<div className="text-6xl font-black mb-2">
										${(getCurrentPrice() / 100).toFixed(2)}
										<span className="text-xl text-muted-foreground font-normal">/{getPlanLabel()}</span>
									</div>
									<p className="text-muted-foreground">
										Suscríbete hoy y accede a todo el contenido
									</p>
								</div>

								<div className="space-y-4 mb-6">
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
										<Check className="w-5 h-5 text-green-500" />
									</div>
								</div>

								{/* Payment method selector */}
								<div className="space-y-3 mb-6">
									<p className="text-sm font-semibold">Selecciona tu método de pago:</p>
									<div className="grid grid-cols-2 gap-3">
										<button
											onClick={() => setPaymentMethod("wallet")}
											className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
												paymentMethod === "wallet"
													? "bg-[#00AFF0] text-white border-[#00AFF0]"
													: "border-border hover:bg-muted"
											}`}
										>
											<Wallet className="w-6 h-6" />
											<span className="font-semibold">Billetera</span>
										</button>
										<button
											onClick={() => setPaymentMethod("paypal")}
											className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
												paymentMethod === "paypal"
													? "bg-[#00AFF0] text-white border-[#00AFF0]"
													: "border-border hover:bg-muted"
											}`}
										>
											<img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" className="h-6 w-auto" />
											<span className="font-semibold">PayPal</span>
										</button>
									</div>
								</div>

								<Button
									onClick={handleSubscribe}
									disabled={isProcessing}
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
									) : paymentMethod === "wallet" ? (
										<span className="flex items-center gap-2">
											<Wallet className="w-5 h-5" />
											Pagar con billetera
										</span>
									) : (
										<span className="flex items-center gap-2">
											<img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" className="h-6 w-auto" />
											Pagar con PayPal
										</span>
									)}
								</Button>

								<p className="text-center text-xs text-muted-foreground mt-4">
									Al suscribirte, aceptas nuestros términos y condiciones. 
									El pago se procesará automáticamente cada mes hasta que canceles.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscribePageClient;
