"use client";
import { useState, useEffect } from "react";
import { Image as ImageIcon, Link as LinkIcon, Grid3x3, List, ExternalLink, Trash2, Plus } from "lucide-react";
import Posts from "@/components/home/home-screen/Posts";
import { getSocialLinksAction, trackLinkClickAction, deleteSocialLinkAction, addSocialLinkAction } from "./links-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ProfileTabsProps {
	userId: string;
	postCount: number;
	mediaCount: number;
	canViewPrivate: boolean;
	isMyProfile: boolean;
}

interface SocialLink {
	id: string;
	title: string;
	url: string;
	icon: string | null;
	clicks: number;
}

const ProfileTabs = ({ userId, postCount, mediaCount, canViewPrivate, isMyProfile }: ProfileTabsProps) => {
	const [activeTab, setActiveTab] = useState<"posts" | "media" | "links">("posts");
	const [links, setLinks] = useState<SocialLink[]>([]);
	const [isAddingLink, setIsAddingLink] = useState(false);
	const [newLinkTitle, setNewLinkTitle] = useState("");
	const [newLinkUrl, setNewLinkUrl] = useState("");
	const { toast } = useToast();

	useEffect(() => {
		if (activeTab === "links") {
			loadLinks();
		}
	}, [activeTab, userId]);

	const loadLinks = async () => {
		const data = await getSocialLinksAction(userId);
		setLinks(data as SocialLink[]);
	};

	const handleLinkClick = async (link: SocialLink) => {
		await trackLinkClickAction(link.id);
		window.open(link.url, "_blank");
	};

	const handleAddLink = async () => {
		if (!newLinkTitle || !newLinkUrl) {
			toast({
				title: "Error",
				description: "Por favor completa todos los campos",
				variant: "destructive",
			});
			return;
		}

		try {
			await addSocialLinkAction({
				title: newLinkTitle,
				url: newLinkUrl,
			});
			setNewLinkTitle("");
			setNewLinkUrl("");
			setIsAddingLink(false);
			loadLinks();
			toast({
				title: "Link agregado",
				description: "El link se agregó correctamente",
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	const handleDeleteLink = async (linkId: string) => {
		try {
			await deleteSocialLinkAction(linkId);
			loadLinks();
			toast({
				title: "Link eliminado",
				description: "El link se eliminó correctamente",
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex flex-col">
			{/* Tabs Navigation */}
			<div className="flex items-center border-b sticky top-0 bg-background z-10">
				<button
					onClick={() => setActiveTab("posts")}
					className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
						activeTab === "posts"
							? "text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<List className="w-5 h-5" />
					<span>Posts</span>
					<span className="text-xs bg-muted px-2 py-0.5 rounded-full">{postCount}</span>
					{activeTab === "posts" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>

				<button
					onClick={() => setActiveTab("media")}
					className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
						activeTab === "media"
							? "text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<Grid3x3 className="w-5 h-5" />
					<span>Media</span>
					<span className="text-xs bg-muted px-2 py-0.5 rounded-full">{mediaCount}</span>
					{activeTab === "media" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>

				<button
					onClick={() => setActiveTab("links")}
					className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
						activeTab === "links"
							? "text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<LinkIcon className="w-5 h-5" />
					<span>Links</span>
					<span className="text-xs bg-muted px-2 py-0.5 rounded-full">{links.length}</span>
					{activeTab === "links" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
			</div>

			{/* Tab Content */}
			<div className="flex-1">
				{activeTab === "posts" && (
					<Posts userId={userId} canViewPrivate={canViewPrivate} filter="all" />
				)}

				{activeTab === "media" && (
					<Posts userId={userId} canViewPrivate={canViewPrivate} filter="media" />
				)}

				{activeTab === "links" && (
					<div className="p-4 space-y-3">
						{isMyProfile && (
							<div className="mb-4">
								{!isAddingLink ? (
									<Button
										onClick={() => setIsAddingLink(true)}
										className="w-full rounded-full"
										variant="outline"
									>
										<Plus className="w-4 h-4 mr-2" />
										Agregar Link
									</Button>
								) : (
									<div className="space-y-3 p-4 border rounded-lg bg-muted/30">
										<Input
											placeholder="Título (ej: Instagram)"
											value={newLinkTitle}
											onChange={(e) => setNewLinkTitle(e.target.value)}
										/>
										<Input
											placeholder="URL (ej: https://instagram.com/usuario)"
											value={newLinkUrl}
											onChange={(e) => setNewLinkUrl(e.target.value)}
										/>
										<div className="flex gap-2">
											<Button onClick={handleAddLink} className="flex-1">
												Guardar
											</Button>
											<Button
												onClick={() => {
													setIsAddingLink(false);
													setNewLinkTitle("");
													setNewLinkUrl("");
												}}
												variant="outline"
												className="flex-1"
											>
												Cancelar
											</Button>
										</div>
									</div>
								)}
							</div>
						)}

						{links.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-20 px-4">
								<LinkIcon className="w-16 h-16 text-muted-foreground mb-4" />
								<p className="text-muted-foreground text-center font-semibold">
									No hay links disponibles
								</p>
								<p className="text-sm text-muted-foreground text-center mt-2">
									{isMyProfile ? "Agrega links a tus redes sociales" : "Los links externos aparecerán aquí"}
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{links.map((link) => (
									<div
										key={link.id}
										className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
									>
										<div className="flex-1 min-w-0">
											<button
												onClick={() => handleLinkClick(link)}
												className="flex items-center gap-2 w-full text-left"
											>
												<LinkIcon className="w-5 h-5 text-primary flex-shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="font-semibold truncate">{link.title}</p>
													<p className="text-xs text-muted-foreground truncate">{link.url}</p>
												</div>
												<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
											</button>
										</div>
										{isMyProfile && (
											<Button
												onClick={() => handleDeleteLink(link.id)}
												variant="ghost"
												size="sm"
												className="opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Trash2 className="w-4 h-4 text-red-500" />
											</Button>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfileTabs;
