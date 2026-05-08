"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addPostLikesAction,
	addUserFollowersOverrideAction,
	addUserEarningsAction,
	getAllPostsForAdminAction,
	getAllUsersAction,
	removePostLikesAction,
	removeUserEarningsAction,
	removeUserFollowersOverrideAction,
	generateRandomFollowersAction,
	getGlobalFakeUsersCountAction,
	simulateFollowerWaveAction,
	setPostLikesAction,
	setPostViewsAction,
	addPostViewsAction,
	removePostViewsAction,
	setUserFollowersOverrideAction,
	subscribeUserAction,
} from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfileAction } from "@/app/update-profile/actions";

const InteractionsTab = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [searchUser, setSearchUser] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [countryByUser, setCountryByUser] = useState<Record<string, string>>({});
	const [generatingFor, setGeneratingFor] = useState<{ userId: string; amount: number } | null>(null);
	const [createdByUser, setCreatedByUser] = useState<Record<string, number>>({});
	const [subscribeSheetOpen, setSubscribeSheetOpen] = useState(false);
	const [subscribeFormData, setSubscribeFormData] = useState<{ subscriberId: string; creatorId: string; price: string; quantity: string } | null>(null);

	const { data: users, isLoading: usersLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
	});

	const { data: posts, isLoading: postsLoading } = useQuery({
		queryKey: ["admin-posts"],
		queryFn: () => getAllPostsForAdminAction(),
	});
	const { data: me } = useQuery({
		queryKey: ["admin-me-profile"],
		queryFn: () => getUserProfileAction(),
	});
	const { data: globalFakeCount } = useQuery({
		queryKey: ["global-fake-users-count"],
		queryFn: () => getGlobalFakeUsersCountAction(),
	});

	const { mutate: setFollowers, isPending: isSavingFollowers } = useMutation({
		mutationFn: ({ userId, followers }: { userId: string; followers: number }) =>
			setUserFollowersOverrideAction(userId, followers),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Seguidores actualizados" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: setLikes, isPending: isSavingLikes } = useMutation({
		mutationFn: ({ postId, likes }: { postId: string; likes: number }) => setPostLikesAction(postId, likes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Likes actualizados" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: addFollowers, isPending: isAddingFollowers } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
			addUserFollowersOverrideAction(userId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Seguidores agregados" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: removeFollowers, isPending: isRemovingFollowers } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
			removeUserFollowersOverrideAction(userId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Seguidores removidos" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: addLikes, isPending: isAddingLikes } = useMutation({
		mutationFn: ({ postId, amount }: { postId: string; amount: number }) => addPostLikesAction(postId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Likes agregados" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: removeLikes, isPending: isRemovingLikes } = useMutation({
		mutationFn: ({ postId, amount }: { postId: string; amount: number }) => removePostLikesAction(postId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Likes removidos" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: setViews, isPending: isSavingViews } = useMutation({
		mutationFn: ({ postId, views }: { postId: string; views: number }) => setPostViewsAction(postId, views),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Reproducciones actualizadas" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: addViews, isPending: isAddingViews } = useMutation({
		mutationFn: ({ postId, amount }: { postId: string; amount: number }) => addPostViewsAction(postId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Reproducciones agregadas" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: removeViews, isPending: isRemovingViews } = useMutation({
		mutationFn: ({ postId, amount }: { postId: string; amount: number }) => removePostViewsAction(postId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Reproducciones removidas" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: addEarnings, isPending: isAddingEarnings } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) => addUserEarningsAction(userId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Ingresos agregados" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: removeEarnings, isPending: isRemovingEarnings } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) => removeUserEarningsAction(userId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Ingresos removidos" });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
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

	const { mutate: simulateWave, isPending: isSimulatingWave } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
			simulateFollowerWaveAction(userId, amount),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast({
				title: "Oleada simulada",
				description: `Se generaron ${data.simulatedNotifications} notificaciones (modo escalable).`,
			});
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: generateRandomFollowers, isPending: isGeneratingRandomFollowers } = useMutation({
		mutationFn: ({ userId, amount, country }: { userId: string; amount: number; country?: string }) =>
			generateRandomFollowersAction(userId, amount, country),
		onMutate: (vars) => {
			setGeneratingFor({ userId: vars.userId, amount: vars.amount });
		},
		onSuccess: (data, vars) => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["global-fake-users-count"] });
			setCreatedByUser((prev) => ({
				...prev,
				[vars.userId]: (prev[vars.userId] || 0) + data.created,
			}));
			toast({
				title: "Seguidores reales creados",
				description: `Se crearon ${data.created} usuarios aleatorios con foto y follow real.`,
			});
		},
		onSettled: () => {
			setGeneratingFor(null);
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

	const filteredPosts = useMemo(() => {
		if (!selectedUserId) return posts || [];
		return (posts || []).filter((post) => post.userId === selectedUserId);
	}, [posts, selectedUserId]);

	if (usersLoading || postsLoading) {
		return <p className='text-center mt-10 text-muted-foreground'>Cargando interacciones...</p>;
	}

	return (
		<div className='mt-6 space-y-8'>
			<div className='border rounded-xl p-3 space-y-3'>
				<p className='text-xl font-bold'>Buscar usuario</p>
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
					<Button type='button' variant='outline' size='sm' onClick={() => setSelectedUserId(null)}>
						Ver todos los usuarios
					</Button>
					{me?.id && (
						<Button type='button' variant='outline' size='sm' onClick={() => setSelectedUserId(me.id)}>
							Ir a mi usuario
						</Button>
					)}
					{selectedUserId && (
						<span className='text-xs text-muted-foreground'>
							Filtrando por: {usersById.get(selectedUserId)?.name || selectedUserId}
						</span>
					)}
				</div>
			</div>

			<div>
				<p className='text-xl font-bold mb-2'>Seguidores e ingresos</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Gestiona los seguidores y balances de los usuarios. Las acciones aquí afectan directamente el conteo de seguidores y los ingresos del creador.
				</p>
				<div className='flex flex-col gap-2'>
					{(selectedUserId ? (users || []).filter((u) => u.id === selectedUserId) : users)?.map((user) => (
						<div key={user.id} className='border rounded-xl p-3'>
							<div className='mb-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground'>
								<span className='font-semibold text-foreground'>Creados en esta sesión:</span>{" "}
								{createdByUser[user.id] || 0} ·{" "}
								<span className='font-semibold text-foreground'>Fake global:</span> {globalFakeCount ?? 0}
							</div>
							<div className='flex items-center justify-between gap-2'>
								<div className='min-w-0'>
									<p className='text-sm font-semibold truncate'>{user.name}</p>
									<p className='text-xs text-muted-foreground truncate'>{user.email}</p>
									<p className='text-xs text-muted-foreground'>
										Reales: {user._count.followers} · Manuales: {user.followersOverride || 0} · Total:{" "}
										<span className='font-semibold text-foreground'>
											{user._count.followers + (user.followersOverride || 0)}
										</span>
									</p>
								</div>
								<div className='flex flex-col sm:flex-row gap-2'>
									<form
										className='flex items-center gap-2'
										title="Fija el número total de seguidores manuales para este usuario"
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const followers = Number(formData.get("followers") || 0);
											setFollowers({ userId: user.id, followers });
										}}
									>
										<Input
											name='followers'
											type='number'
											min={0}
											defaultValue={user.followersOverride ?? 0}
											className='w-24 h-8 text-xs'
										/>
										<Button size='sm' type='submit' disabled={isSavingFollowers} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Fijar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										title="Agrega seguidores manuales adicionales (envía notificaciones)"
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("addFollowers") || 0);
											if (amount <= 0) return;
											addFollowers({ userId: user.id, amount });
											(e.currentTarget.elements.namedItem("addFollowers") as HTMLInputElement).value = "";
										}}
									>
										<Input name='addFollowers' type='number' min={1} placeholder='+ seguidores' className='w-28 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isAddingFollowers} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Agregar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										title="Quita seguidores manuales (envía notificaciones simuladas)"
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("removeFollowers") || 0);
											if (amount <= 0) return;
											removeFollowers({ userId: user.id, amount });
											(e.currentTarget.elements.namedItem("removeFollowers") as HTMLInputElement).value = "";
										}}
									>
										<Input name='removeFollowers' type='number' min={1} placeholder='- seguidores' className='w-28 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isRemovingFollowers} variant='outline' className='h-8 text-xs'>
											Quitar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										title="Agrega ingresos al balance del usuario (en cents)"
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("earningsAdd") || 0);
											if (amount <= 0) return;
											addEarnings({ userId: user.id, amount });
											(e.currentTarget.elements.namedItem("earningsAdd") as HTMLInputElement).value = "";
										}}
									>
										<Input name='earningsAdd' type='number' min={1} placeholder='+ ingresos (cents)' className='w-36 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isAddingEarnings} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											+$
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										title="Quita ingresos del balance del usuario (en cents)"
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("earningsRemove") || 0);
											if (amount <= 0) return;
											removeEarnings({ userId: user.id, amount });
											(e.currentTarget.elements.namedItem("earningsRemove") as HTMLInputElement).value = "";
										}}
									>
										<Input name='earningsRemove' type='number' min={1} placeholder='- ingresos (cents)' className='w-36 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isRemovingEarnings} variant='outline' className='h-8 text-xs'>
											-$
										</Button>
									</form>
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
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("waveFollowers") || 0);
											if (amount <= 0) return;
											simulateWave({ userId: user.id, amount });
											(e.currentTarget.elements.namedItem("waveFollowers") as HTMLInputElement).value = "";
										}}
									>
										<Input
											name='waveFollowers'
											type='number'
											min={1}
											placeholder='simular + seguidores'
											className='w-40 h-8 text-xs'
										/>
										<Button size='sm' type='submit' disabled={isSimulatingWave} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Simular
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("realFollowers") || 0);
											if (amount <= 0) return;
											generateRandomFollowers({
												userId: user.id,
												amount,
												country: countryByUser[user.id] || undefined,
											});
											(e.currentTarget.elements.namedItem("realFollowers") as HTMLInputElement).value = "";
										}}
									>
										<select
											className='h-8 rounded-md border bg-background px-2 text-xs'
											value={countryByUser[user.id] || "MIX"}
											onChange={(e) =>
												setCountryByUser((prev) => ({
													...prev,
													[user.id]: e.target.value,
												}))
											}
										>
											<option value='MIX'>MIX</option>
											<option value='MX'>MX</option>
											<option value='CO'>CO</option>
											<option value='ES'>ES</option>
											<option value='US'>US</option>
											<option value='AR'>AR</option>
											<option value='CL'>CL</option>
											<option value='PE'>PE</option>
										</select>
										<Input
											name='realFollowers'
											type='number'
											min={1}
											max={500}
											placeholder='crear seguidores reales'
											className='w-44 h-8 text-xs'
										/>
										<Button size='sm' type='submit' disabled={isGeneratingRandomFollowers} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											{isGeneratingRandomFollowers && generatingFor?.userId === user.id
												? `Creando ${generatingFor.amount}...`
												: "Crear"}
										</Button>
									</form>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div>
				<p className='text-xl font-bold mb-2'>Likes y reproducciones por publicación</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Gestiona los likes y reproducciones de las publicaciones. Útil para simular engagement o corregir conteos.
				</p>
				<div className='flex flex-col gap-2'>
					{filteredPosts?.length === 0 && (
						<p className='text-sm text-muted-foreground border rounded-xl p-3'>
							No hay publicaciones para ese usuario (o aun no se han creado).
						</p>
					)}
					{filteredPosts?.map((post) => (
						<div key={post.id} className='border rounded-xl p-3'>
							<div className='flex items-center justify-between gap-2'>
								<div className='min-w-0'>
									<p className='text-sm font-semibold truncate'>
										{usersById.get(post.userId)?.name || `Usuario ${post.userId.slice(0, 8)}...`}
									</p>
									<p className='text-xs text-muted-foreground truncate'>{post.text}</p>
									<p className='text-xs text-muted-foreground'>
										Likes actuales: <span className='font-semibold text-foreground'>{post.likes}</span>
									</p>
									<p className='text-xs text-muted-foreground'>
										Reproducciones: <span className='font-semibold text-foreground'>{post.views}</span>
									</p>
								</div>
								<div className='flex flex-col sm:flex-row gap-2'>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const likes = Number(formData.get("likes") || 0);
											setLikes({ postId: post.id, likes });
										}}
									>
										<Input name='likes' type='number' min={0} defaultValue={post.likes} className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isSavingLikes} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Fijar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("addLikes") || 0);
											if (amount <= 0) return;
											addLikes({ postId: post.id, amount });
											(e.currentTarget.elements.namedItem("addLikes") as HTMLInputElement).value = "";
										}}
									>
										<Input name='addLikes' type='number' min={1} placeholder='+ likes' className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isAddingLikes} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Agregar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("removeLikes") || 0);
											if (amount <= 0) return;
											removeLikes({ postId: post.id, amount });
											(e.currentTarget.elements.namedItem("removeLikes") as HTMLInputElement).value = "";
										}}
									>
										<Input name='removeLikes' type='number' min={1} placeholder='- likes' className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isRemovingLikes} variant='outline' className='h-8 text-xs'>
											Quitar
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const views = Number(formData.get("views") || 0);
											setViews({ postId: post.id, views });
										}}
									>
										<Input name='views' type='number' min={0} defaultValue={post.views} className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isSavingViews} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											Fijar views
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("addViews") || 0);
											if (amount <= 0) return;
											addViews({ postId: post.id, amount });
											(e.currentTarget.elements.namedItem("addViews") as HTMLInputElement).value = "";
										}}
									>
										<Input name='addViews' type='number' min={1} placeholder='+ views' className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isAddingViews} className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
											+views
										</Button>
									</form>
									<form
										className='flex items-center gap-2'
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											const amount = Number(formData.get("removeViews") || 0);
											if (amount <= 0) return;
											removeViews({ postId: post.id, amount });
											(e.currentTarget.elements.namedItem("removeViews") as HTMLInputElement).value = "";
										}}
									>
										<Input name='removeViews' type='number' min={1} placeholder='- views' className='w-24 h-8 text-xs' />
										<Button size='sm' type='submit' disabled={isRemovingViews} variant='outline' className='h-8 text-xs'>
											-views
										</Button>
									</form>
								</div>
							</div>
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
							className="bg-primary text-primary-foreground hover:bg-primary/90"
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

export default InteractionsTab;
