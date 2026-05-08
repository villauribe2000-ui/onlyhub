"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsersAction, subscribeUserAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

const SubscriptionsTab = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [searchUser, setSearchUser] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [subscribeSheetOpen, setSubscribeSheetOpen] = useState(false);
	const [subscribeFormData, setSubscribeFormData] = useState<{ subscriberId: string; creatorId: string; price: string; quantity: string } | null>(null);

	const { data: users, isLoading: usersLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
	});

	const { mutate: subscribeUser, isPending: isSubscribing } = useMutation({
		mutationFn: ({ subscriberId, creatorId, priceInCents, quantity }: { subscriberId: string; creatorId: string; priceInCents: number; quantity: number }) =>
			subscribeUserAction(subscriberId, creatorId, priceInCents, quantity),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Suscripción creada" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const normalizeText = (v: string) =>
		v
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");

	const filteredUsers = useMemo(() => {
		const qRaw = searchUser.trim();
		if (!qRaw) return users || [];
		const q = normalizeText(qRaw);

		const scored = (users || [])
			.map((u) => {
				const name = normalizeText(u.name || "");
				const username = normalizeText(u.username || "");
				const email = normalizeText(u.email || "");
				const id = normalizeText(u.id || "");
				let score = 0;

				if (name === q || username === q || email === q || id === q) score += 100;
				if (name.startsWith(q) || username.startsWith(q)) score += 50;
				if (name.includes(q) || username.includes(q) || email.includes(q) || id.includes(q)) score += 10;
				return { u, score };
			})
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score);

		return scored.map((x) => x.u);
	}, [users, searchUser]);

	const usersById = useMemo(() => {
		const map = new Map<string, { name: string; username: string | null }>();
		(users || []).forEach((u) => map.set(u.id, { name: u.name, username: u.username }));
		return map;
	}, [users]);

	if (usersLoading) {
		return <p className='text-center mt-10 text-muted-foreground'>Cargando...</p>;
	}

	return (
		<div className='mt-6 space-y-6'>
			<div className='border rounded-xl p-4 space-y-3'>
				<p className='text-xl font-bold'>Buscar usuario para suscribir</p>
				<Input
					placeholder='Buscar por nombre, @usuario o email'
					value={searchUser}
					onChange={(e) => setSearchUser(e.target.value)}
				/>
				<div className='max-h-56 overflow-y-auto flex flex-col gap-2'>
					{filteredUsers?.slice(0, 100).map((user) => (
						<button
							key={user.id}
							type='button'
							onClick={() => setSelectedUserId(user.id)}
							className={`text-left border rounded-lg p-2 hover:bg-muted transition-colors ${
								selectedUserId === user.id ? "border-primary bg-primary/5" : ""
							}`}
						>
							<p className='text-sm font-semibold'>{user.name}</p>
							<p className='text-xs text-muted-foreground'>
								@{user.username || "usuario"} · {user.email}
							</p>
						</button>
					))}
					{filteredUsers?.length === 0 && (
						<p className='text-sm text-muted-foreground'>No se encontraron usuarios.</p>
					)}
				</div>
				<div className='flex items-center gap-2'>
					<Button type='button' variant='outline' size='sm' onClick={() => setSelectedUserId(null)} className='bg-primary text-primary-foreground hover:bg-primary/90'>
						Ver todos los usuarios
					</Button>
					{selectedUserId && (
						<span className='text-xs text-muted-foreground'>
							Filtrando por: {usersById.get(selectedUserId)?.name || selectedUserId}
						</span>
					)}
				</div>
			</div>

			<div>
				<p className='text-xl font-bold mb-2'>Gestión de suscripciones</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Crea suscripciones mensuales para usuarios. Cada suscriptor recibirá una notificación con nombre aleatorio.
				</p>
				<div className='flex flex-col gap-2'>
					{(selectedUserId ? (users || []).filter((u) => u.id === selectedUserId) : users)?.map((user) => (
						<div key={user.id} className='border rounded-xl p-4'>
							<div className='mb-3'>
								<p className='text-sm font-semibold'>{user.name}</p>
								<p className='text-xs text-muted-foreground'>{user.email}</p>
								<p className='text-xs text-muted-foreground mt-1'>
									Estado actual: <span className={`font-semibold ${user.isSubscribed ? "text-green-600" : "text-muted-foreground"}`}>
										{user.isSubscribed ? "Suscrito" : "No suscrito"}
									</span>
								</p>
							</div>
							<Button
								size='sm'
								type='button'
								variant='outline'
								className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'
								title="Crear suscripción para este usuario con notificaciones automáticas"
								onClick={() => {
									setSubscribeFormData({ subscriberId: user.id, creatorId: user.id, price: (user.subscriptionPrice || 0).toString(), quantity: "1" });
									setSubscribeSheetOpen(true);
								}}
								disabled={isSubscribing}
							>
								Suscribir
							</Button>
						</div>
					))}
				</div>
			</div>

			<Sheet open={subscribeSheetOpen} onOpenChange={setSubscribeSheetOpen}>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Suscribir usuario</SheetTitle>
						<SheetDescription>
							Crea una suscripción mensual para este usuario y transfiere automáticamente los ingresos al creador.
						</SheetDescription>
					</SheetHeader>
					<div className="py-4 space-y-6">
						{subscribeFormData && (
							<>
								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
									<p className="font-semibold text-blue-900 mb-1">👤 Usuario seleccionado:</p>
									<p className="text-blue-800 font-medium">{usersById.get(subscribeFormData.subscriberId)?.name || subscribeFormData.subscriberId}</p>
									<p className="text-xs text-blue-600 mt-1">Se creará una suscripción activa para este usuario</p>
								</div>
								
								<div className="space-y-2">
									<label className="text-sm font-semibold text-foreground">Cantidad de suscriptores</label>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min="1"
											defaultValue={subscribeFormData.quantity}
											onChange={(e) => {
												if (subscribeFormData) {
													setSubscribeFormData({ ...subscribeFormData, quantity: e.target.value });
												}
											}}
											className="font-mono"
										/>
										<span className="text-xs text-muted-foreground">personas</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Cada suscriptor recibirá una notificación con un nombre aleatorio
									</p>
								</div>
								
								<div className="space-y-2">
									<label className="text-sm font-semibold text-foreground">Precio por suscripción (USD)</label>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min="0"
											step="0.01"
											defaultValue={subscribeFormData.price}
											onChange={(e) => {
												if (subscribeFormData) {
													setSubscribeFormData({ ...subscribeFormData, price: e.target.value });
												}
											}}
											className="font-mono"
										/>
										<span className="text-xs text-muted-foreground">por mes</span>
									</div>
									<p className="text-xs text-muted-foreground">
										El precio se convertirá automáticamente a cents
									</p>
								</div>
								
								<div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
									<p className="font-semibold text-green-900 mb-2">💰 Resumen de ingresos:</p>
									<div className="flex justify-between text-sm">
										<span className="text-green-800">Precio por suscriptor:</span>
										<span className="font-semibold text-green-900">${(parseFloat(subscribeFormData.price) || 0).toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-green-800">Cantidad de suscriptores:</span>
										<span className="font-semibold text-green-900">{subscribeFormData.quantity}</span>
									</div>
									<div className="border-t border-green-200 mt-2 pt-2 flex justify-between font-bold text-green-900">
										<span>Total a transferir:</span>
										<span>${((parseFloat(subscribeFormData.price) || 0) * (parseInt(subscribeFormData.quantity) || 1)).toFixed(2)}</span>
									</div>
								</div>
								
								<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
									<strong>ℹ️ ¿Qué pasa con esto?</strong>
									<ul className="list-disc ml-4 mt-1 space-y-1">
										<li>Se creará una suscripción activa para el usuario</li>
										<li>Se enviarán notificaciones al creador (una por suscriptor)</li>
										<li>Los ingresos se transferirán automáticamente al balance del creador</li>
										<li>El usuario recibirá una notificación de confirmación</li>
									</ul>
								</div>
							</>
						)}
					</div>
					<SheetFooter>
						<SheetClose asChild>
							<Button type="button" variant="outline">Cancelar</Button>
						</SheetClose>
						<Button
							type="button"
							onClick={() => {
								if (subscribeFormData) {
									const priceInCents = Math.round(parseFloat(subscribeFormData.price) * 100);
									const quantity = parseInt(subscribeFormData.quantity) || 1;
									if (priceInCents > 0 && quantity > 0) {
										subscribeUser({
											subscriberId: subscribeFormData.subscriberId,
											creatorId: subscribeFormData.creatorId,
											priceInCents,
											quantity,
										});
										setSubscribeSheetOpen(false);
										setSubscribeFormData(null);
									}
								}
							}}
							disabled={isSubscribing || !subscribeFormData}
						>
							{isSubscribing ? "Procesando..." : "Suscribir"}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default SubscriptionsTab;
