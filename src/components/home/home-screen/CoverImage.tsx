"use client";
import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { updateCoverImageAction } from "@/app/update-profile/actions";
import { useQueryClient } from "@tanstack/react-query";

interface CoverImageProps {
	adminName: string;
	coverImage?: string | null;
	isAdmin?: boolean;
}

const CoverImage = ({ adminName, coverImage, isAdmin }: CoverImageProps) => {
	const [cover, setCover] = useState(coverImage || null);
	const queryClient = useQueryClient();

	const handleUpload = async (url: string) => {
		setCover(url);
		await updateCoverImageAction(url);
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	};

	return (
		<div className='h-48 overflow-hidden relative bg-gradient-to-br from-pink-500/30 to-purple-600/30'>
			{cover ? (
				<Image
					src={cover}
					className='h-full w-full object-cover select-none pointer-events-none'
					fill
					alt='Cover Image'
				/>
			) : (
				<div className='w-full h-full bg-gradient-to-br from-pink-500/40 via-rose-400/30 to-purple-600/40' />
			)}

			{/* Dark overlay */}
			<div className='absolute inset-0 bg-black/10' aria-hidden='true' />

			{/* Edit button for admin */}
			{isAdmin && (
				<CldUploadWidget
					signatureEndpoint='/api/sign-image'
					onSuccess={(result, { widget }) => {
						handleUpload((result.info as CloudinaryUploadWidgetInfo).secure_url);
						widget.close();
					}}
				>
					{({ open }) => (
						<button
							onClick={() => open()}
							className='absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors z-10'
						>
							<Camera className='w-4 h-4' />
							Edit cover
						</button>
					)}
				</CldUploadWidget>
			)}
		</div>
	);
};
export default CoverImage;
