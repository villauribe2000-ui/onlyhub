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
	videoCount?: number;
	likesCount?: number;
	followersCount?: number;
	formatNumber?: (value: number, type: 'videos' | 'likes' | 'followers') => string;
}

const CoverImage = ({ adminName, coverImage, isAdmin, videoCount = 0, likesCount = 0, followersCount = 0, formatNumber }: CoverImageProps) => {
	const [cover, setCover] = useState(coverImage || null);
	const queryClient = useQueryClient();

	const handleUpload = async (url: string) => {
		setCover(url);
		await updateCoverImageAction(url);
		queryClient.invalidateQueries({ queryKey: ["posts"] });
	};

	const defaultFormatNumber = (value: number, type: 'videos' | 'likes' | 'followers') => {
		if (value >= 1000000) {
			const formatted = (value / 1000000).toFixed(2).replace(/\.?0+$/, '');
			return `${formatted} Millones`;
		} else if (value >= 1000) {
			const formatted = (value / 1000).toFixed(1).replace(/\.?0+$/, '');
			if (type === 'likes') {
				return `${formatted}K Me gusta`;
			} else if (type === 'followers') {
				return `${formatted}K Seguidores`;
			} else {
				return `${formatted}K Reproducciones`;
			}
		}
		return value.toString();
	};

	const numberFormatter = formatNumber || defaultFormatNumber;

	const compactNumber = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
		}
		return value.toString();
	};

	const formatVideos = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'M';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
		}
		return value.toString();
	};

	const formatLikes = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K me gusta';
		}
		return value.toString();
	};

	const formatFollowers = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' millones';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K seguidores';
		}
		return value.toString();
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
			<div className='absolute inset-0 bg-black/20' aria-hidden='true' />

			{/* Estadísticas en la portada - Estilo OnlyFans */}
			<div className='absolute top-4 left-4 right-4 text-white z-10'>
				<div className='flex items-center justify-between mb-3'>
					<h2 className='text-2xl font-bold drop-shadow-lg'>{adminName}</h2>
				</div>
				<div className='flex items-center gap-2 text-sm'>
					<div className='flex items-center gap-1'>
						<span className='text-base'>📹</span>
						<span className='font-semibold'>{formatVideos(videoCount)}</span>
					</div>
					<span className='text-white/60'>•</span>
					<div className='flex items-center gap-1'>
						<span className='text-base'>❤️</span>
						<span className='font-semibold'>{formatLikes(likesCount)}</span>
					</div>
					<span className='text-white/60'>•</span>
					<div className='flex items-center gap-1'>
						<span className='text-base'>👥</span>
						<span className='font-semibold'>{formatFollowers(followersCount)}</span>
					</div>
				</div>
			</div>

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
