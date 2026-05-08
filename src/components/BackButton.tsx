"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface BackButtonProps {
	fallbackHref?: string;
	ariaLabel?: string;
	className?: string;
	children: ReactNode;
}

const BackButton = ({ fallbackHref = "/", ariaLabel = "Volver", className, children }: BackButtonProps) => {
	const router = useRouter();

	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
			return;
		}
		router.push(fallbackHref);
	};

	return (
		<button type='button' onClick={handleBack} aria-label={ariaLabel} className={className}>
			{children}
		</button>
	);
};

export default BackButton;

