"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addUserEarningsAction,
	getAllUsersAction,
	removeUserEarningsAction,
} from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const EarningsTab = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [searchUser, setSearchUser] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const { data: users, isLoading: usersLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
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
				<p className='text-xl font-bold'>Buscar usuario para gestionar ingresos</p>
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
				<p className='text-xl font-bold mb-2'>Gestión de ingresos</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Agrega o quita ingresos al balance del usuario seleccionado.
				</p>
				<div className='flex flex-col gap-2'>
					{(selectedUserId ? (users || []).filter((u) => u.id === selectedUserId) : users)?.map((user) => (
						<div key={user.id} className='border rounded-xl p-4'>
							<div className='mb-3'>
								<p className='text-sm font-semibold'>{user.name}</p>
								<p className='text-xs text-muted-foreground'>{user.email}</p>
								<p className='text-xs text-muted-foreground mt-1'>
									Balance actual: <span className='font-semibold text-foreground'>${((user.balance || 0) / 100).toFixed(2)}</span>
								</p>
							</div>
							<div className='flex flex-col sm:flex-row gap-2'>
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
										Agregar
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
									<Button size='sm' type='submit' disabled={isRemovingEarnings} variant='outline' className='h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90'>
										Quitar
									</Button>
								</form>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default EarningsTab;
