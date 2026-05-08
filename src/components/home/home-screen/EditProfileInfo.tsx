"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateProfileInfoAction } from "@/app/update-profile/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface EditProfileInfoProps {
	name: string;
	username?: string | null;
	bio?: string | null;
}

const EditProfileInfo = ({ name, username, bio }: EditProfileInfoProps) => {
	const [editing, setEditing] = useState(false);
	const [newUsername, setNewUsername] = useState(username || "");
	const [newBio, setNewBio] = useState(bio || "");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleSave = async () => {
		setLoading(true);
		try {
			await updateProfileInfoAction({ username: newUsername, bio: newBio });
			setEditing(false);
			router.refresh();
			toast({
				title: "Perfil actualizado",
				description: "Tu información se ha guardado correctamente",
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "No se pudo actualizar el perfil",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (!editing) {
		return (
			<div className='flex flex-col gap-1'>
				<div className='flex items-center gap-2'>
					<p className='text-xl font-bold'>{name}</p>
					<button onClick={() => setEditing(true)} className='text-muted-foreground hover:text-foreground transition-colors'>
						<Pencil className='w-3.5 h-3.5' />
					</button>
				</div>
				<p className='text-sm text-muted-foreground'>@{username || "username"}</p>
				{bio && <p className='text-sm mt-1 leading-relaxed'>{bio}</p>}
			</div>
		);
	}
	return (
		<div className='flex flex-col gap-2 w-full'>
			<div className='flex items-center gap-1'>
				<span className='text-muted-foreground text-sm'>@</span>
				<input
					value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)}
					placeholder='username'
					className='text-sm border-b border-primary bg-transparent outline-none flex-1'
				/>
			</div>
			<textarea
				value={newBio}
				onChange={(e) => setNewBio(e.target.value)}
				placeholder='Escribe tu descripción...'
				rows={3}
				className='text-sm border rounded-lg p-2 bg-transparent outline-none resize-none w-full'
			/>
			<div className='flex gap-2'>
				<button
					onClick={handleSave}
					disabled={loading}
					className='flex items-center gap-1 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold disabled:opacity-50'
				>
					<Check className='w-3 h-3' /> {loading ? "Guardando..." : "Guardar"}
				</button>
				<button
					onClick={() => setEditing(false)}
					className='flex items-center gap-1 border text-xs px-3 py-1.5 rounded-full'
				>
					<X className='w-3 h-3' /> Cancelar
				</button>
			</div>
		</div>
	);
};
export default EditProfileInfo;
