"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const BalancePage = () => {
	const { toast } = useToast();
	const [user, setUser] = useState<any>(null);
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetch("/api/admin/my-balance")
			.then(r => r.json())
			.then(data => setUser(data))
			.catch(err => console.error(err));
	}, []);

	const handleUpdateBalance = async () => {
		if (!user) return;
		setLoading(true);
		try {
			const response = await fetch("/api/admin/update-balance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id, amount, type: "add" }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Éxito",
					description: `Saldo actualizado. Nuevo saldo: $${data.balance.toFixed(2)}`,
				});
				setUser(prev => ({ ...prev, balance: data.balance }));
				setAmount("");
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

	if (!user) return <div className="p-8">Cargando...</div>;

	return (
		<div className="min-h-screen bg-background py-12 px-4">
			<div className="max-w-md mx-auto">
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-2xl font-black">Tu Saldo</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 bg-muted rounded-lg">
							<p className="text-sm text-muted-foreground">Nombre</p>
							<p className="font-semibold">{user.name}</p>
							<p className="text-xs text-muted-foreground">{user.email}</p>
						</div>
						<div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
							<p className="text-sm text-green-500 font-medium">Saldo disponible</p>
							<p className="text-3xl font-black text-green-500">${user.balance.toFixed(2)} USD</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-xl font-black">Agregar Saldo (Admin)</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
							disabled={loading || !amount}
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

export default BalancePage;
