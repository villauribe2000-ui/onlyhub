interface VerifiedBadgeProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

const VerifiedBadge = ({ className = "", size = "md" }: VerifiedBadgeProps) => {
	const sizes = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-6 h-6",
	};

	return (
		<svg
			className={`${sizes[size]} ${className} shrink-0`}
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			{/* Seal/badge shape with wavy edges like OnlyFans */}
			<path
				d='M12 2L13.8 4.5L16.8 3.8L17.5 6.8L20.5 7.5L19.8 10.5L22 12L19.8 13.5L20.5 16.5L17.5 17.2L16.8 20.2L13.8 19.5L12 22L10.2 19.5L7.2 20.2L6.5 17.2L3.5 16.5L4.2 13.5L2 12L4.2 10.5L3.5 7.5L6.5 6.8L7.2 3.8L10.2 4.5L12 2Z'
				className='fill-black dark:fill-white'
			/>
			<path
				d='M8 12.5L10.5 15L16 9'
				className='stroke-white dark:stroke-black'
				strokeWidth='2.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				fill='none'
			/>
		</svg>
	);
};
export default VerifiedBadge;
