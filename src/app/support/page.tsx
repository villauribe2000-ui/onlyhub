"use client";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useState, useEffect } from "react";

interface SupportTicket {
	id: string;
	message: string;
	status: string;
	adminReply?: string;
	createdAt: string;
}

const SupportPage = () => {
	const { toast } = useToast();
	const { user } = useKindeBrowserClient();
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tickets, setTickets] = useState<SupportTicket[]>([]);

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			const response = await fetch("/api/support/tickets");
			const data = await response.json();
			if (response.ok) {
				setTickets(data.tickets);
			}
		} catch (error) {
			// Ignore error
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim()) {
			toast({
				title: "Error",
				description: "Por favor escribe tu mensaje",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/support/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Mensaje enviado",
					description: "Te responderemos pronto.",
				});
				setMessage("");
			} else {
				toast({
					title: "Error",
					description: data.error || "No se pudo enviar el mensaje",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al enviar el mensaje",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<BaseLayout>
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
				<div className="max-w-2xl mx-auto">
					<Card className="border-0 shadow-xl">
						<CardHeader>
							<CardTitle className="text-2xl font-black text-[#00AFF0]">Ayuda y Soporte</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-6">
								¿Tienes alguna pregunta o necesitas ayuda? Envíanos un mensaje y te responderemos lo antes posible.
							</p>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Tu mensaje</label>
									<Textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Escribe tu mensaje aquí..."
										className="min-h-[150px]"
										disabled={isSubmitting}
									/>
								</div>

								<Button
									type="submit"
									disabled={isSubmitting || !message.trim()}
									className="w-full h-12 text-lg font-bold bg-[#00AFF0] hover:bg-[#0099d9]"
								>
									{isSubmitting ? "Enviando..." : "Enviar mensaje"}
								</Button>
							</form>

							<div className="mt-8 pt-6 border-t">
								<h3 className="text-lg font-semibold mb-4">Historial de mensajes</h3>
								<div className="space-y-4">
									{tickets.length === 0 ? (
										<p className="text-sm text-muted-foreground">No tienes mensajes aún.</p>
									) : (
										tickets.map((ticket) => (
											<Card key={ticket.id} className="border-0">
												<CardContent className="p-4">
													<div className="space-y-2">
														<div className="bg-[#00AFF0] text-white p-3 rounded-lg">
															<p className="text-sm">{ticket.message}</p>
														</div>
														{ticket.adminReply && (
															<div className="bg-green-500 text-white p-3 rounded-lg">
																<p className="text-sm">{ticket.adminReply}</p>
															</div>
														)}
														<p className="text-xs text-muted-foreground text-right">
															{new Date(ticket.createdAt).toLocaleDateString()}
														</p>
													</div>
												</CardContent>
											</Card>
										))
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</BaseLayout>
	);
};

export default SupportPage;
