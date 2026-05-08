import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Shirt, Home, LayoutDashboard, User, Bell, Search } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ModeToggle } from "./ModeToggle";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import LogoutButton from "./LogoutButton";
import { getUserProfileAction } from "@/app/update-profile/actions";
import NotificationBadge from "@/components/NotificationBadge";

const SIDEBAR_LINKS = [
	{
		icon: Home,
		label: "Home",
		href: "/",
	},
	{
		icon: Search,
		label: "Buscar",
		href: "/search",
	},
	{
		icon: Bell,
		label: "Notifications",
		href: "/notifications",
		showBadge: true,
	},
	{
		icon: Shirt,
		label: "Merch",
		href: "/merch",
	},
];

const Sidebar = async () => {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const userProfile = await getUserProfileAction();

	const isAdmin = process.env.ADMIN_EMAIL === user?.email;

	return (
		<div
			className='flex flex-col gap-3 px-3 py-4 border-r sticky
    left-0 top-0 h-screen w-full'
		>
			<Link href='/update-profile' className='max-w-fit mb-2'>
				<Avatar className='cursor-pointer w-10 h-10'>
					<AvatarImage src={userProfile?.image || "/user-placeholder.png"} className='object-cover' />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</Link>

			<nav className='flex flex-col gap-1'>
				{SIDEBAR_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className='flex items-center gap-3 hover:bg-muted font-semibold hover:text-primary px-3 py-2.5 rounded-lg justify-start transition-colors relative'
					>
						<link.icon className='w-5 h-5' />
						<span className='text-sm'>{link.label}</span>
						{link.showBadge && <NotificationBadge />}
					</Link>
				))}

				{isAdmin && (
					<Link
						href={"/secret-dashboard"}
						className='flex items-center gap-3 hover:bg-muted font-semibold hover:text-primary px-3 py-2.5 rounded-lg justify-start transition-colors'
					>
						<LayoutDashboard className='w-5 h-5' />
						<span className='text-sm'>Dashboard</span>
					</Link>
				)}

				<DropdownMenu>
					<div className='flex items-center gap-3 hover:bg-muted font-semibold hover:text-primary px-3 py-2.5 rounded-lg justify-start transition-colors'>
						<DropdownMenuTrigger className='flex items-center gap-3 w-full'>
							<User className='w-5 h-5' />
							<span className='text-sm'>Settings</span>
						</DropdownMenuTrigger>
					</div>

					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<Link href={process.env.STRIPE_BILLING_PORTAL_LINK_DEV + "?prefilled_email=" + user?.email}>
							<DropdownMenuItem>Billing</DropdownMenuItem>
						</Link>
						<LogoutButton />
					</DropdownMenuContent>
				</DropdownMenu>

				<div className='mt-2'>
					<ModeToggle />
				</div>
			</nav>
		</div>
	);
};
export default Sidebar;
