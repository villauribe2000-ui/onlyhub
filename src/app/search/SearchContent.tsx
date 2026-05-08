"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";
import Post from "@/components/home/home-screen/Post";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
	isVerified: boolean;
	isCreator: boolean;
	bio: string | null;
}

interface SearchPost {
	id: string;
	text: string;
	mediaUrl: string | null;
	mediaType: string | null;
	likes: number;
	isPublic: boolean;
	createdAt: Date;
	user: {
		id: string;
		name: string;
		username: string | null;
		image: string | null;
		isVerified: boolean;
	};
	likesList: any[];
}

const SearchContent = () => {
	const [query, setQuery] = useState("");
	const [users, setUsers] = useState<SearchUser[]>([]);
	const [posts, setPosts] = useState<SearchPost[]>([]);
	const [hashtags, setHashtags] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"all" | "users" | "posts">("all");
	const [filter, setFilter] = useState<"all" | "verified" | "media">("all");

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (query.length >= 2) {
				performSearch();
			} else {
				setUsers([]);
				setPosts([]);
				setHashtags([]);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [query, activeTab, filter]);

	const performSearch = async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				q: query,
				type: activeTab,
				filter: filter,
			});

			const response = await fetch(`/api/search/advanced?${params}`);
			const data = await response.json();

			setUsers(data.users || []);
			setPosts(data.posts || []);
			setHashtags(data.hashtags || []);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filterLabels = {
		all: "Todos",
		verified: "Verificados",
		media: "Con media",
	};

	return (
		<div className='flex flex-col h-full'>
			{/* Search Input */}
			<div className='px-4 py-3 border-b sticky top-[57px] bg-background z-10'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
					<input
						type='text'
						placeholder='Buscar creadores, contenido, #hashtags...'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className='w-full pl-10 pr-10 py-2.5 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary'
						autoFocus
					/>
					{query && (
						<button
							onClick={() => setQuery("")}
							className='absolute right-3 top-1/2 -translate-y-1/2'
						>
							<X className='w-5 h-5 text-muted-foreground' />
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className='flex items-center gap-2 px-4 py-3 border-b overflow-x-auto'>
				<button
					onClick={() => setActiveTab("all")}
					className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
						activeTab === "all"
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					}`}
				>
					Todo
				</button>
				<button
					onClick={() => setActiveTab("users")}
					className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
						activeTab === "users"
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					}`}
				>
					Usuarios
				</button>
				<button
					onClick={() => setActiveTab("posts")}
					className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
						activeTab === "posts"
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					}`}
				>
					Posts
				</button>

				{/* Filter Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' size='sm' className='ml-auto rounded-full'>
							<SlidersHorizontal className='w-4 h-4 mr-2' />
							{filterLabels[filter]}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem onClick={() => setFilter("all")}>
							Todos
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setFilter("verified")}>
							Verificados
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setFilter("media")}>
							Con media
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Results */}
			<div className='flex-1 overflow-y-auto'>
				{isLoading && (
					<div className='flex items-center justify-center py-20'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
					</div>
				)}

				{!isLoading && query.length < 2 && (
					<div className='flex flex-col items-center justify-center py-20 px-4'>
						<Search className='w-16 h-16 text-muted-foreground mb-4' />
						<p className='text-muted-foreground text-center'>
							Busca creadores, contenido o hashtags
						</p>
						<p className='text-sm text-muted-foreground text-center mt-2'>
							Escribe al menos 2 caracteres para comenzar
						</p>
					</div>
				)}

				{!isLoading && query.length >= 2 && users.length === 0 && posts.length === 0 && (
					<div className='flex flex-col items-center justify-center py-20 px-4'>
						<p className='text-muted-foreground text-center'>
							No se encontraron resultados para "{query}"
						</p>
					</div>
				)}

				{/* Users Results */}
				{!isLoading && (activeTab === "all" || activeTab === "users") && users.length > 0 && (
					<div className='border-b'>
						{activeTab === "all" && (
							<div className='px-4 py-3 border-b bg-muted/30'>
								<h2 className='font-bold text-sm'>Usuarios</h2>
							</div>
						)}
						{users.map((user) => (
							<Link
								key={user.id}
								href={`/profile/${user.id}`}
								className='flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b'
							>
								<Avatar className='w-12 h-12'>
									<AvatarImage src={user.image || "/user-placeholder.png"} className='object-cover' />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-1.5'>
										<p className='font-semibold truncate'>{user.name}</p>
										{user.isVerified && <VerifiedBadge size='sm' />}
									</div>
									<p className='text-sm text-muted-foreground truncate'>
										@{user.username || "usuario"}
									</p>
									{user.bio && (
										<p className='text-sm text-muted-foreground line-clamp-1 mt-1'>
											{user.bio}
										</p>
									)}
								</div>
								{user.isCreator && (
									<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold'>
										Creador
									</span>
								)}
							</Link>
						))}
					</div>
				)}

				{/* Posts Results */}
				{!isLoading && (activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
					<div>
						{activeTab === "all" && (
							<div className='px-4 py-3 border-b bg-muted/30'>
								<h2 className='font-bold text-sm'>Posts</h2>
							</div>
						)}
						{posts.map((post) => (
							<Post key={post.id} post={post as any} canViewPrivate={false} fromSearch={true} />
						))}
					</div>
				)}

				{/* Hashtags */}
				{!isLoading && hashtags.length > 0 && (
					<div className='px-4 py-3'>
						<h3 className='font-bold text-sm mb-2'>Hashtags encontrados</h3>
						<div className='flex flex-wrap gap-2'>
							{hashtags.map((tag, index) => (
								<button
									key={index}
									onClick={() => setQuery(tag)}
									className='px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors'
								>
									{tag}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchContent;
