"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, VideoIcon, Globe, Lock, X } from "lucide-react";
import { CldUploadWidget, CldVideoPlayer, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";
import { createPostAction } from "../actions";
import { useToast } from "@/components/ui/use-toast";

const ContentTab = () => {
	const [text, setText] = useState("");
	const [mediaType, setMediaType] = useState<"video" | "image">("image");
	const [isPublic, setIsPublic] = useState<boolean>(false);
	const [mediaUrl, setMediaUrl] = useState<string>("");
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate: createPost, isPending } = useMutation({
		mutationKey: ["createPost"],
		mutationFn: async () => createPostAction({ text, isPublic, mediaUrl, mediaType }),
		onSuccess: () => {
			toast({ title: "Post publicado" });
			setText("");
			setMediaType("image");
			setIsPublic(false);
			setMediaUrl("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	return (
		<div className='max-w-lg mx-auto mt-6'>
			<p className='text-xl font-bold mb-4'>Nueva publicación</p>

			<form onSubmit={(e) => { e.preventDefault(); createPost(); }}>
				<div className='border rounded-2xl overflow-hidden bg-card'>

					{/* Text area */}
					<Textarea
						placeholder="Escribe algo para tus fans..."
						value={text}
						onChange={(e) => setText(e.target.value)}
						className='border-0 resize-none text-base min-h-[120px] rounded-none focus-visible:ring-0 px-4 pt-4'
						required
					/>

					{/* Media preview */}
					{mediaUrl && mediaType === "image" && (
						<div className='relative w-full h-64 bg-muted'>
							<Image fill src={mediaUrl} alt='Preview' className='object-cover' />
							<button
								type='button'
								onClick={() => setMediaUrl("")}
								className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
					)}

					{mediaUrl && mediaType === "video" && (
						<div className='relative w-full'>
							<CldVideoPlayer width={960} height={540} src={mediaUrl} />
							<button
								type='button'
								onClick={() => setMediaUrl("")}
								className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
					)}

					{/* Bottom toolbar */}
					<div className='flex items-center justify-between px-4 py-3 border-t'>
						<div className='flex items-center gap-2'>
							{/* Image upload */}
							<CldUploadWidget
								signatureEndpoint='/api/sign-image'
								onSuccess={(result, { widget }) => {
									setMediaType("image");
									setMediaUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
									widget.close();
								}}
							>
								{({ open }) => (
									<button
										type='button'
										onClick={() => open()}
										className='p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary'
									>
										<ImageIcon className='w-5 h-5' />
									</button>
								)}
							</CldUploadWidget>

							{/* Video upload */}
							<CldUploadWidget
								signatureEndpoint='/api/sign-image'
								onSuccess={(result, { widget }) => {
									setMediaType("video");
									setMediaUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
									widget.close();
								}}
							>
								{({ open }) => (
									<button
										type='button'
										onClick={() => open()}
										className='p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary'
									>
										<VideoIcon className='w-5 h-5' />
									</button>
								)}
							</CldUploadWidget>
						</div>

						{/* Visibility toggle */}
						<button
							type='button'
							onClick={() => setIsPublic(!isPublic)}
							className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
								isPublic
									? "bg-green-500/10 text-green-600 border-green-500/30"
									: "bg-primary/10 text-primary border-primary/30"
							}`}
						>
							{isPublic ? (
								<><Globe className='w-4 h-4' /> Público</>
							) : (
								<><Lock className='w-4 h-4' /> Solo suscriptores</>
							)}
						</button>
					</div>
				</div>

				<Button
					type='submit'
					disabled={isPending || !text}
					className='w-full mt-3 rounded-full font-bold py-5 bg-primary text-primary-foreground hover:bg-primary/90'
				>
					{isPending ? "Publicando..." : "Publicar"}
				</Button>
			</form>

		</div>
	);
};
export default ContentTab;
