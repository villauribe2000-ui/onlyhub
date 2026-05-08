import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import { Prisma } from "@prisma/client";
import Link from "next/link";

type CommentWithUser = Prisma.CommentGetPayload<{
	include: {
		user: true;
	};
}>;

const Comment = ({ comment }: { comment: CommentWithUser }) => {
	return (
		<div className='flex gap-3 border-b py-3 px-1'>
			<Link href={`/profile/${comment.user.id}`}>
				<Avatar className='w-10 h-10'>
					<AvatarImage src={comment.user.image || "/user-placeholder.png"} className='object-cover' />
					<AvatarFallback>{comment.user.name[0]}</AvatarFallback>
				</Avatar>
			</Link>
			<div className='flex flex-col w-full'>
				<div className='flex items-center gap-2 mb-1'>
					<Link href={`/profile/${comment.user.id}`} className='font-semibold text-sm hover:underline flex items-center gap-1'>
						{comment.user.name}
						{comment.user.isVerified && <BadgeCheck className='w-4 h-4 text-[#00AFF0]' />}
					</Link>
				</div>
				<p className='text-sm leading-relaxed text-foreground'>{comment.text}</p>
				<span className='text-xs text-muted-foreground mt-1'>
					{new Date(comment.createdAt).toLocaleDateString("es", {
						day: "numeric",
						month: "short",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
		</div>
	);
};
export default Comment;
