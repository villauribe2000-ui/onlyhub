"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Post {
	id: string;
	mediaUrl: string | null;
	mediaType: string | null;
	text: string;
	userId: string;
	views: number;
	createdAt: string;
	user: {
		name: string;
		email: string;
	};
}

const ViewsTab = () => {
	const { toast } = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [editingPost, setEditingPost] = useState<Post | null>(null);
	const [newViews, setNewViews] = useState("");

	useEffect(() => {
		if (searchQuery) {
			fetchPosts();
		}
	}, [page]);

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/admin/videos/search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
			const data = await response.json();
			if (response.ok) {
				if (page === 1) {
					setPosts(data.posts);
				} else {
					setPosts((prev) => [...prev, ...data.posts]);
				}
				setHasMore(data.hasMore);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudieron cargar los videos",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		fetchPosts();
	};

	const handleUpdateViews = (post: Post) => {
		setEditingPost(post);
		setNewViews(post.views.toString());
	};

	const handleSaveViews = async () => {
		if (!editingPost || !newViews || isNaN(Number(newViews))) return;

		try {
			const response = await fetch(`/api/admin/videos/${editingPost.id}/views`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ views: Number(newViews) }),
			});
			const data = await response.json();
			if (response.ok) {
				toast({
					title: "Reproducciones actualizadas",
					description: `Ahora tiene ${data.post.views} reproducciones.`,
				});
				setPosts((prev) =>
					prev.map((p) => (p.id === editingPost.id ? { ...p, views: data.post.views } : p))
				);
				setEditingPost(null);
				setNewViews("");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudieron actualizar las reproducciones",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSearch} className="flex gap-2">
				<Input
					type="text"
					placeholder="Buscar por título, usuario o email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" disabled={loading}>
					{loading ? "Buscando..." : "Buscar"}
				</Button>
			</form>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{posts.map((post) => (
					<Card key={post.id} className="border-0 shadow-lg overflow-hidden">
						{post.mediaUrl && post.mediaType === "video" && (
							<div className="relative aspect-video bg-black">
								<video
									src={post.mediaUrl}
									className="w-full h-full object-cover"
									poster={post.mediaUrl.replace(".mp4", ".jpg")}
									controls={false}
								/>
								<div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
									{post.user.name}
								</div>
							</div>
						)}
						<CardHeader>
							<CardTitle className="text-lg line-clamp-2">{post.text}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{post.views} reproducciones
								</span>
								<button
									onClick={() => handleUpdateViews(post)}
									className="flex items-center gap-1 text-[#00AFF0] hover:text-[#0099d9]"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
									<span className="text-xs text-muted-foreground">Editar</span>
								</button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{hasMore && (
				<div className="text-center">
					<Button
						variant="outline"
						onClick={() => setPage((prev) => prev + 1)}
						disabled={loading}
					>
						Cargar más
					</Button>
				</div>
			)}

			{editingPost && (
				<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
					<div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
						<h3 className="text-xl font-black mb-4">Editar reproducciones</h3>
						<p className="text-sm text-muted-foreground mb-2">
							Video: {editingPost.text}
						</p>
						<p className="text-sm text-muted-foreground mb-4">
							Usuario: {editingPost.user.name}
						</p>
						<Input
							type="number"
							value={newViews}
							onChange={(e) => setNewViews(e.target.value)}
							placeholder="Número de reproducciones"
							className="text-center text-lg mb-6"
						/>
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => {
									setEditingPost(null);
									setNewViews("");
								}}
							>
								Cancelar
							</Button>
							<Button
								className="flex-1 bg-[#00AFF0] hover:bg-[#0099d9]"
								onClick={handleSaveViews}
							>
								Guardar
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewsTab;
