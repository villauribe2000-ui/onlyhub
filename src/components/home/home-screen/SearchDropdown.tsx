"use client";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

interface SearchUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
	isVerified: boolean;
}

interface SearchDropdownProps {
	isOpen: boolean;
	onClose: () => void;
}

const SearchDropdown = ({ isOpen, onClose }: SearchDropdownProps) => {
	const [query, setQuery] = useState("");
	const [users, setUsers] = useState<SearchUser[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	useEffect(() => {
		if (query.length >= 2) {
			setIsLoading(true);
			fetch(`/api/search?q=${encodeURIComponent(query)}`)
				.then((res) => res.json())
				.then((data) => {
					setUsers(data.users);
					setIsLoading(false);
				});
		} else {
			setUsers([]);
		}
	}, [query]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 bg-background/95 backdrop-blur-sm' onClick={onClose}>
			<div className='container mx-auto px-4 py-8 max-w-2xl h-full flex flex-col' onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-2xl font-bold'>Buscar usuarios</h1>
					<button onClick={onClose} className='p-2 hover:bg-muted rounded-full transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='relative mb-8'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
					<input
						type='text'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Buscar por nombre o usuario...'
						className='w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring'
						autoFocus
					/>
					{query && (
						<button
							onClick={() => setQuery("")}
							className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors'
						>
							<X className='w-4 h-4 text-muted-foreground' />
						</button>
					)}
				</div>

				{isLoading ? (
					<p className='text-muted-foreground text-center py-8'>Buscando...</p>
				) : query.length >= 2 ? (
					<div>
						<h2 className='text-lg font-semibold mb-4'>
							{users.length} resultado{users.length !== 1 && "s"}
						</h2>

						{users.length > 0 ? (
							<div className='flex flex-col gap-2'>
								{users.map((user) => (
									<Link
										key={user.id}
										href={`/profile/${user.id}?from=search`}
										onClick={(e) => {
											e.stopPropagation();
											onClose();
										}}
										className='flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'
									>
										<Avatar className='w-12 h-12'>
											<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
											<AvatarFallback>{user.name[0]}</AvatarFallback>
										</Avatar>
										<div className='flex-1 min-w-0 flex items-center gap-2'>
											<div>
												<p className='font-semibold truncate'>{user.name}</p>
												{user.username && (
													<p className='text-sm text-muted-foreground truncate'>@{user.username}</p>
												)}
											</div>
											{user.isVerified && <BadgeCheck className='w-4 h-4 text-[#00AFF0]' />}
										</div>
									</Link>
								))}
							</div>
						) : (
							<p className='text-muted-foreground text-center py-8'>
								No se encontraron usuarios que coincidan con tu búsqueda.
							</p>
						)}
					</div>
				) : (
					<p className='text-muted-foreground text-center py-8'>
						Escribe al menos 2 caracteres para buscar.
					</p>
				)}
			</div>
		</div>
	);
};

export default SearchDropdown;
