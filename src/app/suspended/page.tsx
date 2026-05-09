import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/db/prisma";
import { redirect } from "next/navigation";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SuspendedPage() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) {
		redirect("/");
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			isSuspended: true,
			suspensionReason: true,
			suspendedAt: true,
		},
	});

	// If user is not suspended, redirect to home
	if (!dbUser?.isSuspended) {
		redirect("/");
	}

	const formatDate = (date: Date | null) => {
		if (!date) return "";
		return new Date(date).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
				<div className="mb-6">
					<div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
					</div>
					<h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
						Cuenta Suspendida
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Tu cuenta ha sido suspendida temporalmente
					</p>
				</div>

				<div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
					<h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
						Razón de la suspensión:
					</h3>
					<p className="text-red-700 dark:text-red-400 text-sm">
						{dbUser.suspensionReason || "Violación de términos de servicio"}
					</p>
					{dbUser.suspendedAt && (
						<p className="text-red-600 dark:text-red-500 text-xs mt-2">
							Suspendida el: {formatDate(dbUser.suspendedAt)}
						</p>
					)}
				</div>

				<div className="space-y-4">
					<p className="text-gray-600 dark:text-gray-400 text-sm">
						Durante la suspensión, no puedes:
					</p>
					<ul className="text-left text-sm text-gray-500 dark:text-gray-500 space-y-1">
						<li>• Crear nuevas publicaciones</li>
						<li>• Dar me gusta o comentar</li>
						<li>• Actualizar tu perfil</li>
						<li>• Realizar donaciones</li>
						<li>• Interactuar con otros usuarios</li>
					</ul>
				</div>

				<div className="mt-8 space-y-3">
					<Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
						<Link href="/support">
							<Mail className="w-4 h-4 mr-2" />
							Contactar Soporte
						</Link>
					</Button>
					<p className="text-xs text-gray-500 dark:text-gray-500">
						Si crees que esto es un error, contacta a nuestro equipo de soporte
					</p>
				</div>
			</div>
		</div>
	);
}