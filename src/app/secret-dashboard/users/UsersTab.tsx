"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, PlusCircle, Ban, CheckCircle } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { getAllUsersAction, toggleUserVerifiedAction, updateUserBalanceAction, suspendUserAction, unsuspendUserAction } from "../actions";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const UsersTab = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [balanceAmount, setBalanceAmount] = useState("");
	const [suspensionReason, setSuspensionReason] = useState("");

	const { data: users, isLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
	});

	const { mutate: toggleVerified } = useMutation({
		mutationFn: (userId: string) => toggleUserVerifiedAction(userId),
		onSuccess: (data, userId) => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({
				title: data.isVerified ? "Usuario verificado" : "Verificación removida",
			});
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: addBalance } = useMutation({
		mutationFn: ({ userId, amount }: { userId: string; amount: number }) => updateUserBalanceAction(userId, Math.round(amount * 100)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Saldo agregado", description: "El saldo se ha agregado correctamente." });
			setSelectedUser(null);
			setBalanceAmount("");
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: suspendUser } = useMutation({
		mutationFn: ({ userId, reason }: { userId: string; reason: string }) => suspendUserAction(userId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Usuario suspendido correctamente" });
			setSuspensionReason("");
		},
		onError: (error: any) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const { mutate: unsuspendUser } = useMutation({
		mutationFn: (userId: string) => unsuspendUserAction(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast({ title: "Usuario reactivado correctamente" });
		},
		onError: (error: any) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const handleAddBalance = () => {
		if (selectedUser && balanceAmount) {
			const amount = parseFloat(balanceAmount);
			if (amount > 0) {
				addBalance({ userId: selectedUser.id, amount });
			} else {
				toast({ title: "Error", description: "Ingresa un monto válido", variant: "destructive" });
			}
		}
	};

	const handleSuspendUser = (userId: string) => {
		if (suspensionReason.trim()) {
			suspendUser({ userId, reason: suspensionReason });
		} else {
			toast({ title: "Error", description: "Ingresa una razón para la suspensión", variant: "destructive" });
		}
	};

	const handleUnsuspendUser = (userId: string) => {
		unsuspendUser(userId);
	};

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground'>Cargando usuarios...</p>;

	return (
		<div className='mt-6'>
			<p className='text-xl font-bold mb-4'>Usuarios ({users?.length || 0})</p>
			<div className='flex flex-col gap-3'>
				{users?.map((user) => (
					<div key={user.id} className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-xl'>
						<div className='flex items-center gap-3'>
							<Avatar className={`w-10 h-10 ${(user as any).isSuspended ? 'grayscale' : ''}`}>
								<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
								<AvatarFallback>{user.name[0]}</AvatarFallback>
							</Avatar>
							<div>
								<div className='flex items-center gap-1'>
									<p className={`text-sm font-semibold ${(user as any).isSuspended ? 'text-red-600' : ''}`}>
										{user.name}
									</p>
									{user.isVerified && (
										<VerifiedBadge size='sm' />
									)}
									{(user as any).isSuspended && (
										<Ban className="w-4 h-4 text-red-500" />
									)}
								</div>
								<p className='text-xs text-muted-foreground'>{user.email}</p>
								<p className='text-xs text-muted-foreground'>Saldo: ${user.balance / 100}</p>
								{(user as any).isSuspended && (
									<p className='text-xs text-red-500'>
										Suspendido: {(user as any).suspensionReason}
									</p>
								)}
							</div>
						</div>

						<div className='flex items-center gap-2 flex-wrap'>
							{user.isSubscribed && (
								<Badge variant='secondary' className='text-xs'>Suscrito</Badge>
							)}
							<Button
								size='sm'
								variant={user.isVerified ? "destructive" : "outline"}
								onClick={() => toggleVerified(user.id)}
								className='text-xs bg-primary text-primary-foreground hover:bg-primary/90'
							>
								<ShieldCheck className='w-3 h-3 mr-1' />
								{user.isVerified ? "Quitar verificado" : "Verificar"}
							</Button>
							<Sheet>
								<SheetTrigger asChild>
									<Button size='sm' variant="outline" onClick={() => setSelectedUser(user)}>
										<PlusCircle className="w-3 h-3 mr-1" />
										Agregar saldo
									</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetHeader>
										<SheetTitle className="text-xl font-black">Agregar saldo a {user.name}</SheetTitle>
									</SheetHeader>
									<div className="py-4 space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Monto (USD)</label>
											<Input
												type="number"
												placeholder="Ej: 25.00"
												value={balanceAmount}
												onChange={(e) => setBalanceAmount(e.target.value)}
												min="1"
												step="0.01"
											/>
										</div>
										<Button onClick={handleAddBalance} className="w-full">
											Agregar saldo
										</Button>
									</div>
								</SheetContent>
							</Sheet>
							
							{/* Suspension Controls */}
							{(user as any).isSuspended ? (
								<Button
									size='sm'
									variant="outline"
									onClick={() => handleUnsuspendUser(user.id)}
									className='text-xs text-green-600 border-green-600 hover:bg-green-50'
								>
									<CheckCircle className='w-3 h-3 mr-1' />
									Reactivar cuenta
								</Button>
							) : (
								<Sheet>
									<SheetTrigger asChild>
										<Button size='sm' variant="destructive" className='text-xs'>
											<Ban className='w-3 h-3 mr-1' />
											Suspender
										</Button>
									</SheetTrigger>
									<SheetContent>
										<SheetHeader>
											<SheetTitle className="text-xl font-black text-red-600">Suspender cuenta de {user.name}</SheetTitle>
										</SheetHeader>
										<div className="py-4 space-y-4">
											<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
												<p className="text-sm text-red-700">
													⚠️ Esta acción suspenderá la cuenta del usuario. No podrá realizar ninguna acción en la plataforma.
												</p>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium">Razón de la suspensión</label>
												<Input
													placeholder="Ej: Violación de términos de servicio"
													value={suspensionReason}
													onChange={(e) => setSuspensionReason(e.target.value)}
												/>
											</div>
											<Button 
												onClick={() => handleSuspendUser(user.id)} 
												className="w-full bg-red-600 hover:bg-red-700"
											>
												Suspender cuenta
											</Button>
										</div>
									</SheetContent>
								</Sheet>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default UsersTab;
