"use client";
import { Camera } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { updateUserProfileAction } from "@/app/update-profile/actions";
import { useRouter } from "next/navigation";

const EditAvatarButton = ({ currentImage }: { currentImage?: string | null }) => {
	const router = useRouter();

	const handleUpload = async (url: string) => {
		await updateUserProfileAction({ name: "", image: url });
		router.refresh();
	};

	return (
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
					className='absolute bottom-0 right-0 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors'
				>
					<Camera className='w-3.5 h-3.5' />
				</button>
			)}
		</CldUploadWidget>
	);
};
export default EditAvatarButton;
