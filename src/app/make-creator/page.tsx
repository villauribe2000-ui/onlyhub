"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const MakeCreatorPage = () => {
	const { toast } = useToast();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetch("/api/admin/my-balance")
			.then(r => r.json())
			.then(data => setUser(data))
			.catch(err => console.error(err));
	}, []);

	const handleMakeCreator = async () => {
		if (!user) return;
		setLoading(true);
		try {
			const response = await fetch("/api/admin/make-creator", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Éxito",
					description: "Ahora eres creador",
				});
				setUser(prev => ({ ...prev, isCreator: true }));
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
				description: "Ocurrió un error al hacerte creador",
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
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-black">Hacerse Creador</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 bg-muted rounded-lg">
							<p className="text-sm text-muted-foreground">Nombre</p>
							<p className="font-semibold">{user.name}</p>
							<p className="text-xs text-muted-foreground">{user.email}</p>
							<p className="text-xs text-muted-foreground mt-2">ID: {user.id}</p>
						</div>
						<div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
							<p className="text-sm text-yellow-500 font-medium">Estado actual</p>
							<p className="font-semibold">{user.isCreator ? "Creador" : "No es creador"}</p>
						</div>
						<Button
							onClick={handleMakeCreator}
							disabled={loading || user.isCreator}
							className="w-full"
						>
							{loading ? "Procesando..." : user.isCreator ? "Ya eres creador" : "Hacerse Creador"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default MakeCreatorPage;
