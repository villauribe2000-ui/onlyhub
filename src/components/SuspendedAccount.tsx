"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";

interface SuspendedAccountProps {
	user: {
		id: string;
		name: string;
		image?: string | null;
		suspensionReason?: string | null;
		suspendedAt?: Date | string | null;
	};
	showDetails?: boolean;
}

const SuspendedAccount = ({ user, showDetails = false }: SuspendedAccountProps) => {
	const formatDate = (date: Date | string | null) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toLocaleDateString();
	};

	return (
		<div className="flex flex-col gap-2 p-4 border-b bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
			<div className="flex items-center gap-2.5">
				<div className="relative">
					<Avatar className="w-9 h-9 grayscale">
						<AvatarImage src="/user-placeholder.png" className="object-cover" />
						<AvatarFallback>⚠️</AvatarFallback>
					</Avatar>
					<div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
						<AlertTriangle className="w-2.5 h-2.5 text-white" />
					</div>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-1">
						<span className="font-semibold text-sm text-red-600 dark:text-red-400">
							Cuenta Suspendida
						</span>
					</div>
					<span className="text-xs text-red-500">
						Esta cuenta ha sido suspendida por violación de términos
					</span>
				</div>
			</div>

			{showDetails && (
				<div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
					<p className="text-sm text-red-700 dark:text-red-300 mb-1">
						<strong>Razón:</strong> {user.suspensionReason || "Violación de términos de servicio"}
					</p>
					{user.suspendedAt && (
						<p className="text-xs text-red-600 dark:text-red-400">
							Suspendida el: {formatDate(user.suspendedAt)}
						</p>
					)}
				</div>
			)}

			<div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<p className="text-sm text-gray-600 dark:text-gray-400 text-center">
					El contenido de esta cuenta no está disponible
				</p>
			</div>
		</div>
	);
};

export default SuspendedAccount;