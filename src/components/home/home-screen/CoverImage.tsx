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
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
							<line x1="8" y1="21" x2="16" y2="21"/>
							<line x1="12" y1="17" x2="12" y2="21"/>
						</svg>
						<span className='font-semibold'>{formatVideos(videoCount)}</span>
					</div>
					<span className='text-white/60'>•</span>
					<div className='flex items-center gap-1'>
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
						</svg>
						<span className='font-semibold'>{formatLikes(likesCount)}</span>
					</div>
					<span className='text-white/60'>•</span>
					<div className='flex items-center gap-1'>
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
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
