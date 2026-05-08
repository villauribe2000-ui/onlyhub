"use client";
import { useState } from "react";
import { ArrowLeft, ImageIcon, Flag, HelpCircle, Type, VideoIcon, X, Globe, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CldUploadWidget, CldVideoPlayer, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import Image from "next/image";
import { createUserPostAction } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfileAction } from "@/app/update-profile/actions";
import Link from "next/link";

const NewPostForm = () => {
	const [text, setText] = useState("");
	const [mediaUrl, setMediaUrl] = useState("");
	const [mediaType, setMediaType] = useState<"image" | "video">("image");
	const [isPublic, setIsPublic] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { data: userProfile } = useQuery({
		queryKey: ["userProfile"],
		queryFn: () => getUserProfileAction(),
	});

	const canPost = (userProfile as any)?.isVerified || (userProfile as any)?.isCreator;

	const { mutate: createPost, isPending } = useMutation({
		mutationKey: ["createPost"],
		mutationFn: async () => createUserPostAction({ text, isPublic, mediaUrl, mediaType }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast({ title: "Publicación creada" });
			router.push("/");
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	const canPublish = text.trim().length > 0;

	// Not verified — show blocked screen
	if (userProfile && !canPost) {
		return (
			<div className='flex flex-col h-full'>
				<div className='flex items-center gap-3 px-4 py-3 border-b'>
					<button onClick={() => router.back()}>
						<ArrowLeft className='w-5 h-5' />
					</button>
					<h1 className='font-black text-lg uppercase tracking-wide'>Nueva publicación</h1>
				</div>
				<div className='flex-1 flex flex-col items-center justify-center px-6 text-center gap-4'>
					<div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
						<ShieldCheck className='w-8 h-8 text-muted-foreground' />
					</div>
					<p className='font-bold text-lg'>Solo creadores verificados</p>
					<p className='text-muted-foreground text-sm'>
						Para publicar contenido necesitas ser un creador verificado. Solicita tu verificación y espera la aprobación.
					</p>
					<Link
						href='/become-creator'
						className='bg-primary text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-primary/90 transition-colors'
					>
						Solicitar verificación
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col h-full'>
			{/* Header */}
			<div className='flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10'>
				<div className='flex items-center gap-3'>
					<button onClick={() => router.back()}>
						<ArrowLeft className='w-5 h-5' />
					</button>
					<h1 className='font-black text-lg uppercase tracking-wide'>Nueva publicación</h1>
				</div>
				<button
					onClick={() => canPublish && createPost()}
					disabled={!canPublish || isPending}
					className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
						canPublish
							? "bg-primary text-white hover:bg-primary/90"
							: "bg-muted text-muted-foreground cursor-not-allowed"
					}`}
				>
					{isPending ? "..." : "Publicar"}
				</button>
			</div>

			{/* Text area */}
			<div className='flex-1 px-4 pt-4'>
				<textarea
					placeholder='Escribir nueva publicación...'
					value={text}
					onChange={(e) => setText(e.target.value)}
					className='w-full bg-transparent outline-none resize-none text-base min-h-[120px] placeholder:text-muted-foreground'
					autoFocus
				/>

				{/* Media preview */}
				{mediaUrl && mediaType === "image" && (
					<div className='relative w-full h-64 rounded-xl overflow-hidden mt-2'>
						<Image fill src={mediaUrl} alt='Preview' className='object-cover' />
						<button
							onClick={() => setMediaUrl("")}
							className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1'
						>
							<X className='w-4 h-4' />
						</button>
					</div>
				)}

				{mediaUrl && mediaType === "video" && (
					<div className='relative mt-2'>
						<CldVideoPlayer width={960} height={540} src={mediaUrl} />
						<button
							onClick={() => setMediaUrl("")}
							className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1'
						>
							<X className='w-4 h-4' />
						</button>
					</div>
				)}
			</div>

			{/* Bottom toolbar */}
			<div className='border-t px-4 py-3'>
				{/* Visibility toggle */}
				<button
					onClick={() => setIsPublic(!isPublic)}
					className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-3 transition-colors ${
						isPublic
							? "bg-green-500/10 text-green-600 border-green-500/30"
							: "bg-primary/10 text-primary border-primary/30"
					}`}
				>
					{isPublic ? <><Globe className='w-3.5 h-3.5' /> Público</> : <><Lock className='w-3.5 h-3.5' /> Solo suscriptores</>}
				</button>

				<div className='flex items-center gap-5'>
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
							<button type='button' onClick={() => open()} className='text-muted-foreground hover:text-primary transition-colors'>
								<ImageIcon className='w-6 h-6' />
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
							<button type='button' onClick={() => open()} className='text-muted-foreground hover:text-primary transition-colors'>
								<VideoIcon className='w-6 h-6' />
							</button>
						)}
					</CldUploadWidget>

					<button className='text-muted-foreground'>
						<Flag className='w-6 h-6' />
					</button>
					<button className='text-muted-foreground'>
						<HelpCircle className='w-6 h-6' />
					</button>
					<button className='text-muted-foreground'>
						<Type className='w-6 h-6' />
					</button>
				</div>
			</div>
		</div>
	);
};
export default NewPostForm;
