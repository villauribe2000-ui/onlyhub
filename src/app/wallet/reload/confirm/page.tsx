"use client";
import { useState, Suspense } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function WalletReloadConfirmContent() {
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleConfirmPayment = async () => {
		setIsProcessing(true);

		try {
			const paymentId = searchParams.get("paymentId");
			const token = searchParams.get("token");
			const payerId = searchParams.get("PayerID");

			const response = await fetch(`/api/wallet/reload/confirm?paymentId=${paymentId}&token=${token}&payerId=${payerId || ""}`);
			const data = await response.json();

			if (response.ok) {
				setStatus("success");
				toast({
					title: "Éxito",
					description: "Tu pago ha sido confirmado y se está procesando.",
				});
			} else {
				setStatus("error");
				toast({
					title: "Error",
					description: data.error || "No se pudo confirmar el pago",
					variant: "destructive",
				});
			}
		} catch (error) {
			setStatus("error");
			toast({
				title: "Error",
				description: "Ocurrió un error al confirmar el pago",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
			<div className="max-w-md mx-auto">
				<Card className="text-center">
					<CardHeader>
						<CardTitle className="text-2xl font-black">Confirmación de Pago</CardTitle>
					</CardHeader>
					<CardContent className="py-8">
						{status === "pending" && (
							<div className="flex flex-col items-center gap-4">
								<CheckCircle className="w-16 h-16 text-green-500" />
								<p className="text-muted-foreground">Has completado el pago en PayPal.</p>
								<p className="text-muted-foreground">Tu pago está pendiente de aprobación.</p>
								<Button onClick={handleConfirmPayment} disabled={isProcessing} className="mt-4">
									{isProcessing ? "Procesando..." : "Ya pagué"}
								</Button>
							</div>
						)}
						{status === "success" && (
							<div className="flex flex-col items-center gap-4">
								<CheckCircle className="w-16 h-16 text-green-500" />
								<p className="text-muted-foreground">Tu pago ha sido confirmado.</p>
								<p className="text-muted-foreground">El admin lo revisará pronto.</p>
								<Button onClick={() => router.push("/wallet")} className="mt-4">
									Ir a mi billetera
								</Button>
							</div>
						)}
						{status === "error" && (
							<div className="flex flex-col items-center gap-4">
								<XCircle className="w-16 h-16 text-red-500" />
								<p className="text-muted-foreground">No se pudo confirmar el pago.</p>
								<Button onClick={() => router.push("/wallet/reload")} className="mt-4">
									Intentar de nuevo
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

const WalletReloadConfirmPage = () => {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
			<WalletReloadConfirmContent />
		</Suspense>
	);
};

export default WalletReloadConfirmPage;
