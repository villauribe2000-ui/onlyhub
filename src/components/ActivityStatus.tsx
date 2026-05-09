"use client";

interface ActivityStatusProps {
	lastActive: Date | string;
	showText?: boolean;
	size?: "sm" | "md" | "lg";
}

const ActivityStatus = ({ lastActive, showText = false, size = "md" }: ActivityStatusProps) => {
	const getActivityStatus = () => {
		const now = new Date();
		const lastActiveDate = new Date(lastActive);
		const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));

		if (diffInMinutes < 5) {
			return { isOnline: true, text: "Online now" };
		} else if (diffInMinutes < 60) {
			return { isOnline: false, text: `Active ${diffInMinutes}m ago` };
		} else if (diffInMinutes < 1440) { // 24 hours
			const hours = Math.floor(diffInMinutes / 60);
			return { isOnline: false, text: `Active ${hours}h ago` };
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			return { isOnline: false, text: `Active ${days}d ago` };
		}
	};

	const { isOnline, text } = getActivityStatus();

	const dotSize = {
		sm: "w-2 h-2",
		md: "w-3 h-3",
		lg: "w-4 h-4"
	}[size];

	const textSize = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base"
	}[size];

	return (
		<div className="flex items-center gap-1.5">
			<div className={`${dotSize} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ${isOnline ? 'animate-pulse' : ''}`} />
			{showText && (
				<span className={`${textSize} text-muted-foreground`}>
					{text}
				</span>
			)}
		</div>
	);
};

export default ActivityStatus;