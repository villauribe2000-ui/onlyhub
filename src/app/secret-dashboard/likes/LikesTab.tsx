"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addPostLikesAction,
	getAllPostsForAdminAction,
	getAllUsersAction,
	removePostLikesAction,
	setPostLikesAction,
} from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const LikesTab = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [searchUser, setSearchUser] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [selectedUserName, setSelectedUserName] = useState<string>("");

	const { data: posts, isLoading: postsLoading } = useQuery({
		queryKey: ["admin-posts"],
		queryFn: () => getAllPostsForAdminAction(),
	});

	const { data: allUsers, isLoading: usersLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAllUsersAction(),
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

	// Get all users from database
	const users = useMemo(() => {
		if (!allUsers) return [];
		return allUsers;
	}, [allUsers]);

	// Filter users by search
	const filteredUsers = useMemo(() => {
		if (!searchUser.trim()) return users.slice(0, 20); // Show first 20 users when no search
		const query = searchUser.toLowerCase();
		return users.filter((user: any) => 
			user.name?.toLowerCase().includes(query) || 
			user.username?.toLowerCase().includes(query) ||
			user.email?.toLowerCase().includes(query)
		);
	}, [users, searchUser]);

	// Filter posts by selected user
	const userPosts = useMemo(() => {
		if (!posts || !selectedUserId) return [];
		return posts.filter((post: any) => post.userId === selectedUserId);
	}, [posts, selectedUserId]);

	if (postsLoading || usersLoading) {
		return <p className='text-center mt-10 text-muted-foreground'>Cargando...</p>;
	}

	return (
		<div className='mt-6 space-y-6'>
			{/* User Search */}
			<div className='border rounded-xl p-4 space-y-3'>
				<p className='text-xl font-bold'>Buscar Usuario</p>
				<Input
					placeholder='Buscar por nombre, username o email...'
					value={searchUser}
					onChange={(e) => setSearchUser(e.target.value)}
				/>
				<div className='max-h-64 overflow-y-auto space-y-2'>
					{filteredUsers.map((user: any) => (
						<button
							key={user.id}
							onClick={() => {
								setSelectedUserId(user.id);
								setSelectedUserName(user.name);
								setSearchUser("");
							}}
							className={`w-full text-left border rounded-lg p-3 hover:bg-muted transition-colors flex items-center gap-3 ${
								selectedUserId === user.id ? "border-primary bg-primary/5" : ""
							}`}
						>
							<Avatar className='w-10 h-10'>
								<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
								<AvatarFallback>{user.name[0]}</AvatarFallback>
							</Avatar>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-semibold truncate'>{user.name}</p>
								<p className='text-xs text-muted-foreground truncate'>
									@{user.username || "usuario"}
								</p>
							</div>
						</button>
					))}
					{filteredUsers.length === 0 && searchUser.trim() && (
						<p className='text-sm text-muted-foreground text-center py-4'>
							No se encontraron usuarios con "{searchUser}"
						</p>
					)}
					{users.length === 0 && !searchUser.trim() && (
						<p className='text-sm text-muted-foreground text-center py-4'>
							No hay usuarios registrados
						</p>
					)}
				</div>
			</div>

			{/* Selected User Posts */}
			{selectedUserId && (
				<div className='border rounded-xl p-4 space-y-4'>
					<div className='flex items-center justify-between'>
						<p className='text-xl font-bold'>Posts de {selectedUserName}</p>
						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								setSelectedUserId(null);
								setSelectedUserName("");
							}}
						>
							Limpiar selección
						</Button>
					</div>

					{userPosts.length === 0 ? (
						<p className='text-sm text-muted-foreground text-center py-8'>
							Este usuario no tiene publicaciones
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{userPosts.map((post: any) => (
								<div key={post.id} className='border rounded-lg p-4 space-y-3'>
									{/* Post Content */}
									<div>
										<p className='text-sm line-clamp-2'>{post.text}</p>
										{post.mediaUrl && post.mediaType === "image" && (
											<div className='relative w-full h-48 mt-2 rounded-lg overflow-hidden bg-muted'>
												<Image
													src={post.mediaUrl}
													alt='Post'
													fill
													className='object-cover'
												/>
											</div>
										)}
										{post.mediaUrl && post.mediaType === "video" && (
											<div className='relative w-full mt-2 rounded-lg overflow-hidden bg-muted'>
												<video
													src={post.mediaUrl}
													className='w-full h-auto max-h-48'
													controls
												/>
											</div>
										)}
									</div>

									{/* Current Likes */}
									<div className='flex items-center gap-2 text-sm'>
										<Heart className='w-4 h-4 text-red-500 fill-red-500' />
										<span className='font-semibold'>{post.likes} likes</span>
									</div>

									{/* Like Controls */}
									<div className='flex flex-col gap-2'>
										<form
											className='flex items-center gap-2'
											onSubmit={(e) => {
												e.preventDefault();
												const formData = new FormData(e.currentTarget);
												const likes = Number(formData.get("likes") || 0);
												setLikes({ postId: post.id, likes });
											}}
										>
											<Input
												name='likes'
												type='number'
												min={0}
												defaultValue={post.likes}
												className='flex-1 h-9 text-sm'
												placeholder='Fijar likes'
											/>
											<Button size='sm' type='submit' disabled={isSavingLikes} className='h-9'>
												Fijar
											</Button>
										</form>
										<div className='flex gap-2'>
											<form
												className='flex-1 flex items-center gap-2'
												onSubmit={(e) => {
													e.preventDefault();
													const formData = new FormData(e.currentTarget);
													const amount = Number(formData.get("addLikes") || 0);
													if (amount <= 0) return;
													addLikes({ postId: post.id, amount });
													(e.currentTarget.elements.namedItem("addLikes") as HTMLInputElement).value = "";
												}}
											>
												<Input
													name='addLikes'
													type='number'
													min={1}
													placeholder='+ likes'
													className='flex-1 h-9 text-sm'
												/>
												<Button size='sm' type='submit' disabled={isAddingLikes} className='h-9'>
													+
												</Button>
											</form>
											<form
												className='flex-1 flex items-center gap-2'
												onSubmit={(e) => {
													e.preventDefault();
													const formData = new FormData(e.currentTarget);
													const amount = Number(formData.get("removeLikes") || 0);
													if (amount <= 0) return;
													removeLikes({ postId: post.id, amount });
													(e.currentTarget.elements.namedItem("removeLikes") as HTMLInputElement).value = "";
												}}
											>
												<Input
													name='removeLikes'
													type='number'
													min={1}
													placeholder='- likes'
													className='flex-1 h-9 text-sm'
												/>
												<Button size='sm' type='submit' disabled={isRemovingLikes} variant='outline' className='h-9'>
													-
												</Button>
											</form>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Instructions */}
			{!selectedUserId && (
				<div className='border rounded-xl p-6 text-center'>
					<ImageIcon className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
					<p className='text-lg font-semibold mb-2'>Selecciona un usuario</p>
					<p className='text-sm text-muted-foreground'>
						Busca y selecciona un usuario para ver sus publicaciones y gestionar los likes
					</p>
				</div>
			)}
		</div>
	);
};

export default LikesTab;
