"use client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User, CreditCard, Settings, HelpCircle, Moon, LogOut, ChevronDown, Globe, BookMarked, TrendingUp, Wallet, LayoutDashboard, BarChart3, BadgeCheck } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { ModeToggle } from "./ModeToggle";
import prisma from "@/db/prisma";

interface UserPanelProps {
	name: string;
	username?: string | null;
	image?: string | null;
	email?: string;
	billingUrl?: string;
	triggerClassName?: string;
	isCreator?: boolean;
	balance?: number;
	isAdmin?: boolean;
	isVerified?: boolean;
	totalLikes?: number;
	followersCount?: number;
}

const UserPanel = ({ name, username, image, email, billingUrl, triggerClassName, isCreator, isVerified, balance, isAdmin, totalLikes, followersCount }: UserPanelProps) => {
	const initials = name?.slice(0, 2).toUpperCase() || "U";

	const formatNumber = (value: number) => {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'M';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
		}
		return value.toString();
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<button className={`flex items-center gap-3 rounded-full hover:bg-muted transition-colors text-left ${triggerClassName || "px-3 py-3 w-full mt-auto"}`}>
					<Avatar className='w-9 h-9 shrink-0'>
						<AvatarImage src={image || "/user-placeholder.png"} className='object-cover' />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					{!triggerClassName && (
						<div className='hidden lg:flex flex-col min-w-0'>
							<div className='flex items-center gap-1'>
								<span className='font-semibold text-sm truncate'>{name}</span>
								{isVerified && <BadgeCheck className='w-3 h-3 text-[#00AFF0]' />}
							</div>
							<span className='text-xs text-muted-foreground truncate'>@{username || "usuario"}</span>
						</div>
					)}
				</button>
			</SheetTrigger>

			<SheetContent side='right' className='w-[300px] p-0 overflow-y-auto'>
				<div className='flex flex-col h-full'>
					{/* Header */}
					<div className='flex items-start gap-3 p-5 border-b'>
						<div className='relative'>
							<Avatar className='w-12 h-12'>
								<AvatarImage src={image || "/user-placeholder.png"} className='object-cover' />
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background' />
						</div>
						<div className='flex-1'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='flex items-center gap-1'>
										<p className='font-bold text-sm'>{name}</p>
										{isVerified && <BadgeCheck className='w-4 h-4 text-[#00AFF0]' />}
									</div>
									<p className='text-xs text-muted-foreground'>@{username || "usuario"}</p>
								</div>
								<ChevronDown className='w-4 h-4 text-muted-foreground' />
							</div>
							{isCreator ? (
								<p className='text-xs text-muted-foreground mt-1'>Creador verificado</p>
							) : (
								<p className='text-xs text-muted-foreground mt-1'>
									{formatNumber(totalLikes || 0)} Fans · {formatNumber(followersCount || 0)} Seguidores
								</p>
							)}
							{isCreator && (
								<p className='text-xs font-bold text-foreground mt-1'>
									💰 Saldo: ${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format((balance || 0) / 100)}
								</p>
							)}
						</div>
					</div>

					{/* Menu */}
					<nav className='flex flex-col py-2'>
						<Link href='/profile' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<User className='w-5 h-5' />
							Mi perfil
						</Link>

						<Link href='#' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<BookMarked className='w-5 h-5' />
							Colecciones
						</Link>

						<Link href='/update-profile' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<Settings className='w-5 h-5' />
							Configuración
						</Link>

						{isCreator && (
							<Link href='/wallet' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
								<Wallet className='w-5 h-5 text-green-500' />
								<span>Billetera <span className='font-bold text-foreground text-xs'>${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format((balance || 0) / 100)}</span></span>
							</Link>
						)}

						{isAdmin && (
							<Link href='/secret-dashboard' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
								<LayoutDashboard className='w-5 h-5 text-primary' />
								Panel admin
							</Link>
						)}

						<div className='border-t my-1' />

						{billingUrl && (
							<Link href={billingUrl} className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
								<CreditCard className='w-5 h-5' />
								<span>Tus tarjetas <span className='text-muted-foreground font-normal text-xs'>(para suscribirte)</span></span>
							</Link>
						)}

						{(isCreator || isVerified) ? (
							<Link href='/creator-dashboard' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
								<BarChart3 className='w-5 h-5 text-primary' />
								<span>Creador <span className='text-primary font-normal text-xs'>(estadísticas, placas e ingresos)</span></span>
							</Link>
						) : (
							<Link href='/become-creator' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
								<TrendingUp className='w-5 h-5' />
								<span>Conviértete en creador <span className='text-green-500 font-normal text-xs'>(enviar solicitud)</span></span>
							</Link>
						)}

						<div className='border-t my-1' />

						<Link href='/support' className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<HelpCircle className='w-5 h-5' />
							Ayuda y soporte
						</Link>

						<div className='flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<div className='flex items-center gap-4'>
								<Moon className='w-5 h-5' />
								Modo oscuro
							</div>
							<ModeToggle />
						</div>

						<div className='flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium'>
							<div className='flex items-center gap-4'>
								<Globe className='w-5 h-5' />
								Español
							</div>
							<ChevronDown className='w-4 h-4 text-muted-foreground' />
						</div>

						<div className='border-t my-1' />

						<div className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors text-sm font-medium text-destructive'>
							<LogOut className='w-5 h-5' />
							<LogoutButton />
						</div>
					</nav>
				</div>
			</SheetContent>
		</Sheet>
	);
};
export default UserPanel;
