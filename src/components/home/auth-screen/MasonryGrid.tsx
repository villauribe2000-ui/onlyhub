"use client";
import Image from "next/image";
import { useState } from "react";

const MasonryGrid = () => {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
		if (hoverIndex === index) {
			const rect = (e.target as HTMLDivElement).getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;

			setMousePosition({ x, y });
		}
	};

	return (
		<div className='p-5 sm:p-8'>
			<div className='columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [&>div:not(:first-child)]:mt-8'>
				{[...Array(15)].map((_, i) => (
					<div
						key={i}
						className='relative overflow-hidden rounded-md bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center'
						style={{ height: `${150 + (i % 3) * 80}px` }}
					>
						<div className='text-4xl opacity-30'>🔒</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default MasonryGrid;

// 	The class "[&>div:not(:first-child)]:mt-8" applies a margin-top 32px to all direct child <div> elements except the first one.

// Breakdown of the class:

// & refers to the current selector, which in this case is the parent <div> containing the class.
// > is the child combinator, which selects direct children of the parent.
// div specifies that the rule applies to <div> elements.
// :not(:first-child) is a pseudo-class selector that excludes the first child element.
// :mt-8 is a Tailwind utility class that sets the margin-top to 8 (2rem).

// So, this class ensures that all <div> elements except the first one have a margin-top of 2rem(32px).
