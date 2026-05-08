"use client";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface SupportTicket {
	id: string;
	userId: string;
	message: string;
	status: string;
	adminReply?: string;
	createdAt: string;
	user: {
		name: string;
		email: string;
	};
}

const SupportTicketsPage = () => {
	const { toast } = useToast();
	const [tickets, setTickets] = useState<SupportTicket[]>([]);
	const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
	const [reply, setReply] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			const response = await fetch("/api/admin/support-tickets");
			const data = await response.json();
			if (response.ok) {
				setTickets(data.tickets);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudieron cargar los tickets",
				variant: "destructive",
			});
		}
	};

	const handleReply = async () => {
		if (!selectedTicket || !reply.trim()) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reply }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Respuesta enviada",
					description: "El usuario ha sido notificado.",
				});
				setReply("");
				fetchTickets();
				setSelectedTicket(null);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudo enviar la respuesta",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<BaseLayout>
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-black mb-6 text-[#00AFF0]">Tickets de Soporte</h1>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-4">
							<h2 className="text-xl font-bold">Todos los tickets</h2>
							{tickets.map((ticket) => (
								<Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTicket(ticket)}>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg">{ticket.user.name}</CardTitle>
											<span className={`text-xs px-2 py-1 rounded-full ${
												ticket.status === "resolved" ? "bg-green-100 text-green-800" :
												ticket.status === "in_progress" ? "bg-blue-100 text-blue-800" :
												"bg-yellow-100 text-yellow-800"
											}`}>
												{ticket.status === "resolved" ? "Resuelto" : ticket.status === "in_progress" ? "En progreso" : "Pendiente"}
											</span>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
										<p className="text-xs text-muted-foreground mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
									</CardContent>
								</Card>
							))}
						</div>

						{selectedTicket && (
							<Card className="border-0 shadow-xl">
								<CardHeader>
									<CardTitle className="text-xl">Chat con {selectedTicket.user.name}</CardTitle>
									<p className="text-sm text-muted-foreground">{selectedTicket.user.email}</p>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="bg-muted rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
										<div className="flex flex-col gap-2">
											<div className="bg-[#00AFF0] text-white p-3 rounded-lg self-start">
												<p className="text-sm">{selectedTicket.message}</p>
											</div>
											{selectedTicket.adminReply && (
												<div className="bg-green-500 text-white p-3 rounded-lg self-end">
													<p className="text-sm">{selectedTicket.adminReply}</p>
												</div>
											)}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Tu respuesta</label>
										<Textarea
											value={reply}
											onChange={(e) => setReply(e.target.value)}
											placeholder="Escribe tu respuesta aquí..."
											className="min-h-[100px]"
										/>
										<Button
											onClick={handleReply}
											disabled={isSubmitting || !reply.trim()}
											className="w-full bg-[#00AFF0] hover:bg-[#0099d9]"
										>
											{isSubmitting ? "Enviando..." : "Enviar respuesta"}
										</Button>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};

export default SupportTicketsPage;
