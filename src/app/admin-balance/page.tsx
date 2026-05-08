"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const AdminBalancePage = () => {
	const { toast } = useToast();
	const [userId, setUserId] = useState("");
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);

	const handleUpdateBalance = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/admin/update-balance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, amount, type: "add" }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Éxito",
					description: `Saldo actualizado. Nuevo saldo: $${data.balance.toFixed(2)}`,
				});
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
				description: "Ocurrió un error al actualizar el saldo",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background py-12 px-4">
			<div className="max-w-md mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-black">Actualizar Saldo (Admin)</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">User ID</label>
							<Input
								placeholder="ID del usuario"
								value={userId}
								onChange={(e) => setUserId(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Monto (USD)</label>
							<Input
								type="number"
								placeholder="100"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="1"
								step="0.01"
							/>
						</div>
						<Button
							onClick={handleUpdateBalance}
							disabled={loading || !userId || !amount}
							className="w-full"
						>
							{loading ? "Procesando..." : "Agregar Saldo"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminBalancePage;
