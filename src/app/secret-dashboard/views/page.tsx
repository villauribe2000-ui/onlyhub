"use client";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

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

const ViewsPage = () => {
	const { toast } = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

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

	const handleUpdateViews = async (postId: string, currentViews: number) => {
		const newViews = prompt("Ingresa el nuevo número de reproducciones:", currentViews.toString());
		if (newViews === null || isNaN(Number(newViews))) return;

		try {
			const response = await fetch(`/api/admin/videos/${postId}/views`, {
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
					prev.map((p) => (p.id === postId ? { ...p, views: data.post.views } : p))
				);
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
		<BaseLayout>
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-black mb-6 text-[#00AFF0]">Gestión de Reproducciones</h1>

					<form onSubmit={handleSearch} className="mb-6">
						<div className="flex gap-2">
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
						</div>
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
										<Button
											size="sm"
											onClick={() => handleUpdateViews(post.id, post.views)}
											className="bg-[#00AFF0] hover:bg-[#0099d9]"
										>
											Editar
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{hasMore && (
						<div className="mt-6 text-center">
							<Button
								variant="outline"
								onClick={() => setPage((prev) => prev + 1)}
								disabled={loading}
							>
								Cargar más
							</Button>
						</div>
					)}
				</div>
			</div>
		</BaseLayout>
	);
};

export default ViewsPage;
