"use client";
import UnderlinedText from "@/components/decorators/UnderlinedText";
import Post from "./Post";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import MediaGallery from "./MediaGallery";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostsAction, getPostsByUserIdAction } from "./actions";

const Posts = ({
	canViewPrivate,
	userId,
	filter = "all",
	fromSearch = false,
}: {
	canViewPrivate: boolean;
	userId?: string;
	filter?: "all" | "media";
	fromSearch?: boolean;
}) => {
	const { data: posts, isLoading } = useQuery({
		queryKey: ["posts", userId],
		queryFn: async () => {
			if (userId) {
				return await getPostsByUserIdAction(userId);
			}
			return await getPostsAction();
		},
	});

	const filteredPosts = useMemo(() => {
		if (!posts) return [];
		if (filter === "media") return posts.filter((p) => Boolean(p.mediaUrl) && p.mediaType === "image");
		// When searching, only show public posts regardless of subscription status
		if (fromSearch) return posts.filter((p) => p.isPublic);
		return posts;
	}, [posts, filter, fromSearch]);

	return (
		<div>
			{!isLoading && filter === "media" ? (
				<MediaGallery posts={filteredPosts} canViewPrivate={canViewPrivate} />
			) : (
				<div>
					{!isLoading && filteredPosts.map((post) => <Post key={post.id} post={post} canViewPrivate={canViewPrivate} fromSearch={fromSearch} />)}

					{isLoading && (
						<div className='mt-10 px-3 flex flex-col gap-10'>
							{[...Array(3)].map((_, i) => (
								<PostSkeleton key={i} />
							))}
						</div>
					)}

					{!isLoading && filteredPosts.length === 0 && (
						<div className='mt-10 px-3'>
							<div className='flex flex-col items-center space-y-3 w-full md:w-3/4 mx-auto '>
								<p className='text-xl font-semibold'>
									No Posts <UnderlinedText>Yet</UnderlinedText>
								</p>

								<p className='text-center'>
									Stay tuned for more posts from{" "}
									<span className='text-primary font-semibold text-xl'>OnlyHub.</span> You can subscribe to
									access exclusive content when it's available.
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
export default Posts;
