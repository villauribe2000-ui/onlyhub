"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, DollarSign, Search } from "lucide-react";
import { useState } from "react";
import { getCreatorRequestsAction, handleCreatorRequestAction, updateUserBalanceAction, setFreeTrialDaysAction, makeUserCreatorAction, getAllUsersAction } from "../actions";

const CreatorsTab = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
	const [freeTrialInputs, setFreeTrialInputs] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [allUsers, setAllUsers] = useState<any[]>([]);
	const [showAllUsers, setShowAllUsers] = useState(false);

	const { data: requests, isLoading } = useQuery({
		queryKey: ["creator-requests"],
		queryFn: () => getCreatorRequestsAction(),
	});

	const { data: allUsersData } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
	});

	const { mutate: handleRequest } = useMutation({
		mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
			handleCreatorRequestAction(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator-requests"] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Solicitud actualizada" });
		},
	});

	const { mutate: updateBalance } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
			updateUserBalanceAction(userId, amount),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator-requests"] });
			toast({ title: "Saldo actualizado" });
		},
	});

	const { mutate: setFreeTrialDays } = useMutation({
		mutationFn: ({ userId, days }: { userId: string; days: number }) =>
			setFreeTrialDaysAction(userId, days),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator-requests"] });
			toast({ title: "Prueba gratuita actualizada" });
		},
	});

	const { mutate: makeUserCreator } = useMutation({
		mutationFn: (userId: string) => makeUserCreatorAction(userId),
		onSuccess: (_, userId) => {
			queryClient.invalidateQueries({ queryKey: ["creator-requests"] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Usuario convertido en creador" });
			// Don't remove from allUsers list - just update the UI
			setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isCreator: true } : u));
		},
	});

	// Search users
	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		try {
			const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
			const data = await response.json();
			if (response.ok) {
				setAllUsers(data);
				setShowAllUsers(true);
			} else {
				toast({ title: "Error", description: data.error, variant: "destructive" });
			}
		} catch (error) {
			toast({ title: "Error", description: "Ocurrió un error al buscar usuarios", variant: "destructive" });
		}
	};

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground'>Cargando...</p>;

	// Separate pending and approved requests
	const pendingRequests = requests?.filter((r: any) => r.status === "pending");
	const approvedRequests = requests?.filter((r: any) => r.status === "approved");

	// Get all creators from all users
	const creators = allUsersData?.filter((u: any) => u.isCreator) || [];

	return (
		<div className='mt-6'>
			{/* Search users */}
			<div className='flex gap-2 mb-6'>
				<Input
					placeholder='Buscar usuario por nombre o email...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					className='flex-1'
				/>
				<Button onClick={handleSearch} className='bg-[#00AFF0] hover:bg-[#0099d9] text-white'>
					<Search className='w-4 h-4 mr-2' /> Buscar
				</Button>
			</div>

			{showAllUsers && allUsers.length > 0 && (
				<div className='mb-6 border rounded-xl p-4'>
					<p className='text-sm font-semibold mb-3'>Resultados de búsqueda ({allUsers.length})</p>
					<div className='space-y-3'>
						{allUsers.map((user) => (
							<div key={user.id} className='border rounded-xl p-4 flex flex-col gap-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Avatar className='w-10 h-10'>
											<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
											<AvatarFallback>{user.name[0]}</AvatarFallback>
										</Avatar>
										<div>
											<p className='font-semibold text-sm'>{user.name}</p>
											<p className='text-xs text-muted-foreground'>{user.email}</p>
										</div>
									</div>
									{!user.isCreator ? (
										<Button size='sm' onClick={() => makeUserCreator(user.id)} className='bg-green-500 hover:bg-green-600 text-white'>
											Hacer Creador
										</Button>
									) : (
										<Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
											Creador
										</Badge>
									)}
								</div>

								{user.isCreator && (
									<div className='flex flex-col gap-3 pt-2 border-t'>
										<div className='flex items-center gap-2'>
											<DollarSign className='w-4 h-4 text-muted-foreground' />
											<span className='text-sm text-muted-foreground'>Saldo actual: ${user.balance / 100}</span>
											<input
												type='number'
												placeholder='Monto en USD'
												value={balanceInputs[user.id] || ""}
												onChange={(e) => setBalanceInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
												className='border rounded-lg px-3 py-1.5 text-sm w-28 bg-background outline-none'
											/>
											<Button size='sm' onClick={() => {
												const amount = parseFloat(balanceInputs[user.id] || "0") * 100;
												updateBalance({ userId: user.id, amount });
											}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
												Asignar
											</Button>
										</div>
										<div className='flex items-center gap-2 pt-2 border-t'>
											<DollarSign className='w-4 h-4 text-green-500' />
											<span className='text-sm text-muted-foreground'>Prueba gratuita (días):</span>
											<input
												type='number'
												placeholder='30'
												value={freeTrialInputs[user.id] || ""}
												onChange={(e) => setFreeTrialInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
												className='border rounded-lg px-3 py-1.5 text-sm w-20 bg-background outline-none'
											/>
											<Button size='sm' onClick={() => {
												const days = parseInt(freeTrialInputs[user.id] || "0");
												if (days > 0) {
													setFreeTrialDays({ userId: user.id, days });
												}
											}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
												Establecer
											</Button>
										</div>
										<div className='flex items-center gap-2 pt-2 border-t'>
											<DollarSign className='w-4 h-4 text-blue-500' />
											<span className='text-sm text-muted-foreground'>Suscripción mensual:</span>
											<span className='text-sm font-semibold text-blue-500'>
												${(user.subscriptionPrice || 0) / 100}
											</span>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Pending Requests */}
			<p className='text-xl font-bold mb-4'>Solicitudes pendientes ({pendingRequests?.length || 0})</p>
			<div className='flex flex-col gap-4 mb-8'>
				{pendingRequests?.length === 0 && (
					<p className='text-muted-foreground text-sm text-center py-10'>No hay solicitudes pendientes</p>
				)}
				{pendingRequests?.map((req: any) => (
					<div key={req.id} className='border rounded-xl p-4 flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Avatar className='w-10 h-10'>
									<AvatarImage src={req.user.image || "/user-placeholder.png"} className='object-cover' />
									<AvatarFallback>{req.user.name[0]}</AvatarFallback>
								</Avatar>
								<div>
									<p className='font-semibold text-sm'>{req.user.name}</p>
									<p className='text-xs text-muted-foreground'>{req.user.email}</p>
								</div>
							</div>
							<Badge variant="secondary">Pendiente</Badge>
						</div>

						<p className='text-sm bg-muted rounded-lg p-3'>{req.message}</p>

						<div className='flex gap-2'>
							<Button size='sm' onClick={() => handleRequest({ id: req.id, status: "approved" })} className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90'>
								<Check className='w-4 h-4 mr-1' /> Aprobar
							</Button>
							<Button size='sm' variant='destructive' onClick={() => handleRequest({ id: req.id, status: "rejected" })} className='flex-1'>
								<X className='w-4 h-4 mr-1' /> Rechazar
							</Button>
						</div>
					</div>
				))}
			</div>

			{/* Approved Creators */}
			<p className='text-xl font-bold mb-4'>Creadores aprobados ({approvedRequests?.length || 0})</p>
			<div className='flex flex-col gap-4 mb-8'>
				{approvedRequests?.length === 0 && (
					<p className='text-muted-foreground text-sm text-center py-10'>No hay creadores aprobados</p>
				)}
				{approvedRequests?.map((req: any) => (
					<div key={req.id} className='border rounded-xl p-4 flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Avatar className='w-10 h-10'>
									<AvatarImage src={req.user.image || "/user-placeholder.png"} className='object-cover' />
									<AvatarFallback>{req.user.name[0]}</AvatarFallback>
								</Avatar>
								<div>
									<p className='font-semibold text-sm'>{req.user.name}</p>
									<p className='text-xs text-muted-foreground'>{req.user.email}</p>
								</div>
							</div>
							<Badge variant="default">Aprobado</Badge>
						</div>

						<p className='text-sm bg-muted rounded-lg p-3'>{req.message}</p>

						<div className='flex flex-col gap-3'>
							<div className='flex items-center gap-2'>
								<DollarSign className='w-4 h-4 text-muted-foreground' />
								<span className='text-sm text-muted-foreground'>Saldo actual: ${((req.user as any).balance || 0) / 100}</span>
								<input
									type='number'
									placeholder='Monto en USD'
									value={balanceInputs[req.user.id] || ""}
									onChange={(e) => setBalanceInputs(prev => ({ ...prev, [req.user.id]: e.target.value }))}
									className='border rounded-lg px-3 py-1.5 text-sm w-28 bg-background outline-none'
								/>
								<Button size='sm' onClick={() => {
									const amount = parseFloat(balanceInputs[req.user.id] || "0") * 100;
									updateBalance({ userId: req.user.id, amount });
								}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
									Asignar
								</Button>
							</div>
							<div className='flex items-center gap-2 pt-2 border-t'>
								<DollarSign className='w-4 h-4 text-green-500' />
								<span className='text-sm text-muted-foreground'>Prueba gratuita (días):</span>
								<input
									type='number'
									placeholder='30'
									value={freeTrialInputs[req.user.id] || ""}
									onChange={(e) => setFreeTrialInputs(prev => ({ ...prev, [req.user.id]: e.target.value }))}
									className='border rounded-lg px-3 py-1.5 text-sm w-20 bg-background outline-none'
								/>
								<Button size='sm' onClick={() => {
									const days = parseInt(freeTrialInputs[req.user.id] || "0");
									if (days > 0) {
										setFreeTrialDays({ userId: req.user.id, days });
									}
								}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
									Establecer
								</Button>
							</div>
							<div className='flex items-center gap-2 pt-2 border-t'>
								<DollarSign className='w-4 h-4 text-blue-500' />
								<span className='text-sm text-muted-foreground'>Suscripción mensual:</span>
								<span className='text-sm font-semibold text-blue-500'>
									${((req.user as any).subscriptionPrice || 0) / 100}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* All Creators from Users */}
			{creators.length > 0 && (
				<>
					<p className='text-xl font-bold mb-4'>Todos los creadores ({creators.length})</p>
					<div className='flex flex-col gap-4 mb-8'>
						{creators.map((user: any) => (
							<div key={user.id} className='border rounded-xl p-4 flex flex-col gap-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Avatar className='w-10 h-10'>
											<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
											<AvatarFallback>{user.name[0]}</AvatarFallback>
										</Avatar>
										<div>
											<p className='font-semibold text-sm'>{user.name}</p>
											<p className='text-xs text-muted-foreground'>{user.email}</p>
										</div>
									</div>
									<Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
										Creador
									</Badge>
								</div>

								<div className='flex flex-col gap-3 pt-2 border-t'>
									<div className='flex items-center gap-2'>
										<DollarSign className='w-4 h-4 text-muted-foreground' />
										<span className='text-sm text-muted-foreground'>Saldo actual: ${user.balance / 100}</span>
										<input
											type='number'
											placeholder='Monto en USD'
											value={balanceInputs[user.id] || ""}
											onChange={(e) => setBalanceInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
											className='border rounded-lg px-3 py-1.5 text-sm w-28 bg-background outline-none'
										/>
										<Button size='sm' onClick={() => {
											const amount = parseFloat(balanceInputs[user.id] || "0") * 100;
											updateBalance({ userId: user.id, amount });
										}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
											Asignar
										</Button>
									</div>
									<div className='flex items-center gap-2 pt-2 border-t'>
										<DollarSign className='w-4 h-4 text-green-500' />
										<span className='text-sm text-muted-foreground'>Prueba gratuita (días):</span>
										<input
											type='number'
											placeholder='30'
											value={freeTrialInputs[user.id] || ""}
											onChange={(e) => setFreeTrialInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
											className='border rounded-lg px-3 py-1.5 text-sm w-20 bg-background outline-none'
										/>
										<Button size='sm' onClick={() => {
											const days = parseInt(freeTrialInputs[user.id] || "0");
											if (days > 0) {
												setFreeTrialDays({ userId: user.id, days });
											}
										}} className='bg-primary text-primary-foreground hover:bg-primary/90'>
											Establecer
										</Button>
									</div>
									<div className='flex items-center gap-2 pt-2 border-t'>
										<DollarSign className='w-4 h-4 text-blue-500' />
										<span className='text-sm text-muted-foreground'>Suscripción mensual:</span>
										<span className='text-sm font-semibold text-blue-500'>
											${(user.subscriptionPrice || 0) / 100}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};
export default CreatorsTab;
