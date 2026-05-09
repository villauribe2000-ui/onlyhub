"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, compactNumber } from "@/lib/utils";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Prisma } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ImageIcon, LockKeyholeIcon, MoreHorizontal, Trash, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deletePostAction, likePostAction, createDonationAction } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import VerifiedBadge from "@/components/VerifiedBadge";

type PostWithLikes = Prisma.PostGetPayload<{
        include: {
                user: true;
                likesList: true;
        };
}>;

const Post = ({ post, canViewPrivate, fromSearch = false }: { post: PostWithLikes; canViewPrivate: boolean; fromSearch?: boolean }) => {
        const [isLiked, setIsLiked] = useState(false);
        const [viewingImage, setViewingImage] = useState<string | null>(null);
        const [showDonation, setShowDonation] = useState(false);
        const [donationAmount, setDonationAmount] = useState("");
        const { user } = useKindeBrowserClient();

        const { toast } = useToast();
        const queryClient = useQueryClient();

        const { mutate: deletePost } = useMutation({
                mutationKey: ["deletePost"],
                mutationFn: async () => await deletePostAction(post.id),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts"] });
                        toast({
                                title: "Success",
                                description: "Post deleted successfully",
                        });
                },
                onError: (error) => {
                        toast({
                                title: "Error",
                                description: error.message,
                                variant: "destructive",
                        });
                },
        });

        const { mutate: likePost } = useMutation({
                mutationKey: ["likePost"],
                mutationFn: async () => {
                        post.likes += isLiked ? -1 : 1;
                        setIsLiked(!isLiked);
                        await likePostAction(post.id);
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts"] });
                },
                onError: (error) => {
                        toast({
                                title: "Error",
                                description: error.message || "Something went wrong. Please try again.",
                                variant: "destructive",
                        });
                },
        });

        const { mutate: createDonation, isPending: isDonating } = useMutation({
                mutationFn: async (amount: number) => {
                        await createDonationAction(post.user.id, Math.round(amount * 100));
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts"] });
                        toast({ title: "¡Gracias por tu donación!" });
                        setShowDonation(false);
                        setDonationAmount("");
                },
                onError: (error) => {
                        if (error.message?.includes("Insufficient balance")) {
                                // Redirect to reload wallet
                                window.location.href = "/wallet/reload";
                        } else {
                                toast({
                                        title: "Error",
                                        description: error.message || "No se pudo procesar la donación",
                                        variant: "destructive",
                                });
                        }
                },
        });

        const { mutate: subscribeToCreator } = useMutation({
                mutationKey: ["subscribeToCreator"],
                mutationFn: async (creatorId: string) => {
                        const response = await fetch("/api/creator-dashboard/subscription/free", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ creatorId }),
                        });
                        const data = await response.json();
                        if (!response.ok) {
                                throw new Error(data.error || "Error al suscribirse");
                        }
                        return data;
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts"] });
                        toast({
                                title: "¡Suscrito!",
                                description: "Te has suscrito correctamente. Ahora puedes ver el contenido privado.",
                        });
                },
                onError: (error) => {
                        toast({
                                title: "Error",
                                description: error.message,
                                variant: "destructive",
                        });
                },
        });

        const handleSubscribeClick = async () => {
                if (!user) {
                        toast({
                                title: "Error",
                                description: "Debes iniciar sesión para suscribirte",
                                variant: "destructive",
                        });
                        return;
                }

                // Check if subscription is free
                const subscriptionPrice = (post.user as any).subscriptionPrice || 0;
                
                if (subscriptionPrice === 0) {
                        // Free subscription - subscribe directly
                        subscribeToCreator(post.user.id);
                } else {
                        // Paid subscription - redirect to subscription page
                        window.location.href = `/subscribe/${post.user.id}`;
                }
        };

        // Check user's balance before showing donation modal
        const handleDonationClick = async () => {
                if (!user) {
                        toast({
                                title: "Error",
                                description: "Debes iniciar sesión para donar",
                                variant: "destructive",
                        });
                        return;
                }

                try {
                        // Check user's balance from server
                        const response = await fetch("/api/wallet/reload");
                        const data = await response.json();

                        if (response.ok && data.balance && data.balance > 0) {
                                // User has balance, show modal
                                setShowDonation(true);
                        } else {
                                // User doesn't have balance, redirect to reload
                                window.location.href = "/wallet/reload";
                        }
                } catch (error) {
                        // Redirect to reload
                        window.location.href = "/wallet/reload";
                }
        };

        useEffect(() => {
                if (post.likesList && user?.id) setIsLiked(post.likesList.length > 0);
        }, [post.likesList, user?.id]);

        const author = post.user;
        const createdAt = new Date(post.createdAt);
        const now = new Date();
        const diffMinutes = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60)));
        const relativeTime =
                diffMinutes < 60
                        ? `hace ${diffMinutes}m`
                        : diffMinutes < 1440
                          ? `hace ${Math.floor(diffMinutes / 60)}h`
                          : `hace ${Math.floor(diffMinutes / 1440)}d`;

        // Use username if available, otherwise use email (without domain)
        const displayUsername = author.username || author.email?.split('@')[0] || 'usuario';

        return (
                <div className='flex flex-col gap-2 p-4 border-b bg-background hover:bg-muted/30 transition-colors'>
                        <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2.5'>
                                        <Link href={`/profile/${author.id}`} className='flex items-center gap-2.5 hover:opacity-90 transition-opacity'>
                                                <Avatar className='w-9 h-9'>
                                                        <AvatarImage src={author.image || "/user-placeholder.png"} className='object-cover' />
                                                        <AvatarFallback>CN</AvatarFallback>
                                                </Avatar>
                                                <div className='flex flex-col'>
                                                        <div className='flex items-center gap-1'>
                                                                <span className='font-semibold text-sm leading-tight'>{author.name}</span>
                                                                {author.isVerified && (
                                                                        <VerifiedBadge size='sm' className='flex-shrink-0' />
                                                                )}
                                                        </div>
                                                        <span className='text-xs text-muted-foreground'>@{author.username || "usuario"} · {relativeTime}</span>
                                                </div>
                                        </Link>
                                </div>
                                <div className='flex gap-2 items-center'>
                                        <MoreHorizontal className='w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors' />

                                        {author.id === user?.id && (
                                                <Trash
                                                        className='w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors'
                                                        onClick={() => deletePost()}
                                                />
                                        )}
                                </div>
                        </div>

                        <p className='text-sm leading-relaxed'>{post.text}</p>

                        {!post.isPublic && canViewPrivate && (
                                <div className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground w-fit'>
                                        <LockKeyholeIcon className='w-3 h-3' />
                                        Privada
                                </div>
                        )}

                        {(post.isPublic || canViewPrivate) && post.mediaUrl && post.mediaType === "image" && (
                                <div className='relative w-full rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity' onClick={() => setViewingImage(post.mediaUrl)}>
                                        <Image 
                                                src={post.mediaUrl} 
                                                alt='Post Image' 
                                                width={600}
                                                height={600}
                                                className='rounded-lg object-contain w-full h-auto max-h-[600px]' 
                                        />
                                        <div className='absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-semibold pointer-events-none backdrop-blur-sm'>
                                                OnlyHub.com/@{displayUsername}
                                        </div>
                                </div>
                        )}

                        {viewingImage && (
                                <div className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4' onClick={() => setViewingImage(null)}>
                                        <button className='absolute top-4 right-4 text-white p-2' onClick={() => setViewingImage(null)}>
                                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                                        </button>
                                        <div className='relative max-w-full max-h-full' onClick={(e) => e.stopPropagation()}>
                                                <img src={viewingImage} alt='Post Image' className='max-w-full max-h-[90vh] object-contain' />
                                                <div className='absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded text-sm font-semibold pointer-events-none'>
                                                        OnlyHub.com/@{displayUsername}
                                                </div>
                                        </div>
                                </div>
                        )}

                        {(post.isPublic || canViewPrivate) && post.mediaUrl && post.mediaType === "video" && (
                                <div className='w-full mx-auto bg-muted rounded-lg overflow-hidden relative'>
                                        <div className='absolute inset-0 bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-blue-600/10' />
                                        <video 
                                                src={post.mediaUrl} 
                                                className='rounded-lg relative z-10 w-full h-auto' 
                                                controls 
                                                playsInline 
                                                loop
                                                muted={false}
                                                poster={post.mediaUrl ? `${post.mediaUrl.replace('.mp4', '.jpg')}?t=1` : undefined}
                                        />
                                        <div className='absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-semibold pointer-events-none z-20 backdrop-blur-sm'>
                                                OnlyHub.com/@{displayUsername}
                                        </div>
                                </div>
                        )}

                        {!canViewPrivate && !post.isPublic && (
                                <div
                                        className='w-full bg-slate-800 relative h-96 rounded-2xl bg-of flex flex-col justify-center
          items-center px-5 overflow-hidden
        '
                                >
                                        <LockKeyholeIcon className='w-16 h-16 text-zinc-400 mb-20 z-0' />

                                        <div aria-hidden='true' className='opacity-60 absolute top-0 left-0 w-full h-full bg-stone-800' />

                                        <div className='flex flex-col gap-2 z-10 border p-2 border-gray-500 w-full rounded-2xl'>
                                                <div className='flex gap-1 items-center'>
                                                        <ImageIcon className='w-4 h-4' />
                                                        <span className='text-xs'>1</span>
                                                </div>

                                                <button 
                                                        className='of-primary-btn w-full !rounded-full !font-black' 
                                                        onClick={handleSubscribeClick}
                                                >
                                                        Subscribe to unlock
                                                </button>
                                        </div>
                                </div>
                        )}

                        <div className='flex gap-6 items-center'>
                                <div className='flex gap-1.5 items-center group cursor-pointer' onClick={() => likePost()}>
                                        <Heart
                                                className={cn("w-5 h-5 transition-all group-hover:scale-110", { "text-red-500": isLiked, "fill-red-500": isLiked })}
                                        />
                                        <span className='text-xs text-muted-foreground font-medium'>{compactNumber(post.likes)}</span>
                                </div>

                                {post.mediaType === "video" && (
                                        <div className='flex gap-1.5 items-center'>
                                                <span className='text-xs text-muted-foreground font-medium'>
                                                        {compactNumber(post.views)} views
                                                </span>
                                        </div>
                                )}

                                <button
                                        onClick={handleDonationClick}
                                        className='flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors group'
                                >
                                        <DollarSign className='w-5 h-5 group-hover:scale-110 transition-transform' />
                                        <span className='text-xs text-muted-foreground font-medium'>Donar</span>
                                </button>
                        </div>

                        {showDonation && (
                                <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
                                        <div className='bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl'>
                                                <h3 className='text-xl font-black mb-4'>Donar a {post.user.name}</h3>
                                                <p className='text-sm text-muted-foreground mb-4'>
                                                        Tu donación ayudará a {post.user.name} a seguir creando contenido.
                                                </p>
                                                <div className='space-y-4 mb-6'>
                                                        <div className='grid grid-cols-4 gap-2'>
                                                                {[5, 10, 25, 50].map((amount) => (
                                                                        <button
                                                                                key={amount}
                                                                                onClick={() => setDonationAmount(amount.toString())}
                                                                                className={`py-2 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                                                                                        donationAmount === amount.toString()
                                                                                                ? "bg-green-500 text-white border-green-500"
                                                                                                : "border-border hover:bg-muted"
                                                                                }`}
                                                                        >
                                                                                ${amount}
                                                                        </button>
                                                                ))}
                                                        </div>
                                                        <div>
                                                                <Input
                                                                        type="number"
                                                                        placeholder="Otro monto"
                                                                        value={donationAmount}
                                                                        onChange={(e) => setDonationAmount(e.target.value)}
                                                                        className="text-center text-lg"
                                                                        min="1"
                                                                        step="0.01"
                                                                />
                                                        </div>
                                                </div>
                                                <div className='flex gap-2'>
                                                        <Button
                                                                variant="outline"
                                                                className="flex-1"
                                                                onClick={() => setShowDonation(false)}
                                                        >
                                                                Cancelar
                                                        </Button>
                                                        <Button
                                                                className="flex-1 bg-green-500 hover:bg-green-600"
                                                                disabled={isDonating || !donationAmount}
                                                                onClick={() => createDonation(parseFloat(donationAmount))}
                                                        >
                                                                {isDonating ? "Procesando..." : "Donar"}
                                                        </Button>
                                                </div>
                                        </div>
                                </div>
                        )}
                </div>
        );
};
export default Post;
