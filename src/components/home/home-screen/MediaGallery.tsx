"use client";
import Image from "next/image";
import { useState } from "react";

interface MediaGalleryProps {
	posts: {
		id: string;
		mediaUrl: string | null;
		mediaType: string | null;
		userId: string;
		user: {
			name: string | null;
			image: string | null;
		};
		likes: number;
		views: number;
		isPublic: boolean;
	}[];
	canViewPrivate: boolean;
}

const MediaGallery = ({ posts, canViewPrivate }: MediaGalleryProps) => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	if (!posts || posts.length === 0) {
		return (
			<div className='mt-10 px-3'>
				<div className='flex flex-col items-center space-y-3 w-full md:w-3/4 mx-auto '>
					<p className='text-xl font-semibold'>No hay publicaciones</p>
					<p className='text-center text-muted-foreground'>Esta persona aún no ha subido imágenes.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="grid grid-cols-2 gap-2 md:gap-3">
				{posts.map((post) => (
					<div key={post.id} className="relative w-full pb-[100%] group cursor-pointer" onClick={() => setSelectedImage(post.mediaUrl || "")}>
						{post.mediaUrl && (
							<Image
								src={post.mediaUrl}
								alt="Post image"
								fill
								className="object-cover"
							/>
						)}
					</div>
				))}
			</div>

			{selectedImage && (
				<div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
					<div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
						<button 
							className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
							onClick={() => setSelectedImage(null)}
						>
							✕
						</button>
						<Image
							src={selectedImage}
							alt="Full screen"
							width={1200}
							height={800}
							className="max-w-full max-h-[85vh] object-contain"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default MediaGallery;
