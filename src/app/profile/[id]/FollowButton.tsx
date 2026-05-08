"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "./actions";

interface FollowButtonProps {
	profileId: string;
	initialIsFollowing: boolean;
}

const FollowButton = ({ profileId, initialIsFollowing }: FollowButtonProps) => {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isPending, startTransition] = useTransition();

	const handleFollowToggle = () => {
		startTransition(async () => {
			const previousValue = isFollowing;
			setIsFollowing(!previousValue);
			try {
				const result = await toggleFollowAction(profileId);
				setIsFollowing(result.isFollowing);
			} catch {
				setIsFollowing(previousValue);
			}
		});
	};

	return (
		<button
			type='button'
			onClick={handleFollowToggle}
			disabled={isPending}
			className='rounded-full bg-[#00AFF0] text-white px-5 py-2.5 font-bold text-sm disabled:opacity-70'
		>
			{isFollowing ? "SIGUIENDO" : "SEGUIR"}
		</button>
	);
};

export default FollowButton;
