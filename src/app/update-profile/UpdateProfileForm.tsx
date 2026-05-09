"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useEffect, useState } from "react";
import { getUserProfileAction, updateUserProfileAction, updateProfileInfoAction, updateSubscriptionPriceAction } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const UpdateProfileForm = () => {
	const [mediaUrl, setMediaUrl] = useState("");
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [subPrice, setSubPrice] = useState("");
	const [subPrice3mo, setSubPrice3mo] = useState("");
	const [subPrice12mo, setSubPrice12mo] = useState("");
	const [freeTrialDays, setFreeTrialDays] = useState("");
	const { toast } = useToast();
	const router = useRouter();

	const { data: userProfile } = useQuery({
		queryKey: ["userProfile"],
		queryFn: async () => await getUserProfileAction(),
	});

	const { mutate: updateProfile, isPending } = useMutation({
		mutationKey: ["updateProfile"],
		mutationFn: async () => {
			await updateUserProfileAction({ name, image: mediaUrl });
			await updateProfileInfoAction({ username, bio });
			if ((userProfile as any)?.isCreator && subPrice) {
				await updateSubscriptionPriceAction(
					Math.round(parseFloat(subPrice) * 100),
					subPrice3mo ? Math.round(parseFloat(subPrice3mo) * 100) : undefined,
					subPrice12mo ? Math.round(parseFloat(subPrice12mo) * 100) : undefined,
					freeTrialDays ? parseInt(freeTrialDays) : 0,
				);
			}
		},
		onSuccess: () => {
			toast({ title: "Perfil actualizado" });
			router.push("/");
			router.refresh();
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	useEffect(() => {
		if (userProfile) {
			setName(userProfile.name);
			setUsername((userProfile as any).username || "");
			setBio((userProfile as any).bio || "");
			if ((userProfile as any).subscriptionPrice) setSubPrice(((userProfile as any).subscriptionPrice / 100).toString());
			if ((userProfile as any).subscriptionPrice3mo) setSubPrice3mo(((userProfile as any).subscriptionPrice3mo / 100).toString());
			if ((userProfile as any).subscriptionPrice12mo) setSubPrice12mo(((userProfile as any).subscriptionPrice12mo / 100).toString());
			if ((userProfile as any).freeTrialDays) setFreeTrialDays((userProfile as any).freeTrialDays.toString());
		}
	}, [userProfile]);

	return (
		<div className='px-2 md:px-10 my-10 max-w-lg mx-auto'>
			<Card>
				<CardHeader>
					<CardTitle className='text-xl'>Editar perfil</CardTitle>
				</CardHeader>

				<CardContent>
					{/* Avatar */}
					<div className='flex justify-center mb-4'>
						<div className='relative'>
							<Avatar className='w-24 h-24'>
								<AvatarImage
									src={mediaUrl || userProfile?.image || "/user-placeholder.png"}
									className='object-cover'
								/>
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<CldUploadWidget
								signatureEndpoint='/api/sign-image'
								options={{
									sources: ['local', 'camera'],
									multiple: false,
									maxFiles: 1,
									cropping: true,
									croppingAspectRatio: 1,
								}}
								onSuccess={(result, { widget }) => {
									if (result?.info && typeof result.info !== 'string') {
										setMediaUrl(result.info.secure_url);
										toast({ title: "Foto de perfil actualizada" });
									}
									widget.close();
								}}
								onError={(error) => {
									console.error('Upload error:', error);
									toast({ title: "Error al subir imagen", description: "Intenta de nuevo", variant: "destructive" });
								}}
							>
								{({ open }) => (
									<button
										onClick={() => open()}
										type='button'
										className='absolute bottom-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full font-semibold'
									>
										Cambiar
									</button>
								)}
							</CldUploadWidget>
						</div>
					</div>

					<form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className='flex flex-col gap-4'>
						<div>
							<Label>Nombre</Label>
							<Input
								placeholder='Tu nombre'
								value={name}
								className='mt-1'
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<Label>Usuario</Label>
							<div className='flex items-center mt-1'>
								<span className='px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground'>@</span>
								<Input
									placeholder='username'
									value={username}
									onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
									className='rounded-l-none'
								/>
							</div>
						</div>

						<div>
							<Label>Descripción</Label>
							<Textarea
								placeholder='Cuéntale a tus fans sobre ti...'
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className='mt-1 resize-none'
								rows={3}
								maxLength={200}
							/>
							<p className='text-xs text-muted-foreground text-right mt-1'>{bio.length}/200</p>
						</div>

						<div>
							<Label>Email</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger className='w-full' type='button'>
										<Input disabled value={userProfile?.email} className='mt-1' />
									</TooltipTrigger>
									<TooltipContent>
										<p className='text-sm'>El email no se puede cambiar.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{(userProfile as any)?.isCreator && (
							<div className='flex flex-col gap-3 border rounded-xl p-4'>
								<p className='font-semibold text-sm'>Precios de suscripción</p>

								<div>
									<Label>Precio mensual (USD)</Label>
									<div className='flex items-center mt-1'>
										<span className='px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground'>$</span>
										<Input type='number' placeholder='9.99' value={subPrice} onChange={(e) => setSubPrice(e.target.value)} className='rounded-l-none' min='1' step='0.01' />
									</div>
								</div>

								<div>
									<Label>Precio 3 meses (USD) — opcional</Label>
									<div className='flex items-center mt-1'>
										<span className='px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground'>$</span>
										<Input type='number' placeholder='24.99' value={subPrice3mo} onChange={(e) => setSubPrice3mo(e.target.value)} className='rounded-l-none' min='1' step='0.01' />
									</div>
								</div>

								<div>
									<Label>Precio 12 meses (USD) — opcional</Label>
									<div className='flex items-center mt-1'>
										<span className='px-3 py-2 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground'>$</span>
										<Input type='number' placeholder='79.99' value={subPrice12mo} onChange={(e) => setSubPrice12mo(e.target.value)} className='rounded-l-none' min='1' step='0.01' />
									</div>
								</div>

								<div>
									<Label>Días de prueba gratis (0 = sin prueba)</Label>
									<Input type='number' placeholder='30' value={freeTrialDays} onChange={(e) => setFreeTrialDays(e.target.value)} className='mt-1' min='0' />
								</div>
							</div>
						)}

						<Button className='w-full rounded-full font-bold' type='submit' disabled={isPending}>
							{isPending ? "Guardando..." : "Guardar cambios"}
						</Button>					</form>
				</CardContent>
			</Card>
		</div>
	);
};
export default UpdateProfileForm;
