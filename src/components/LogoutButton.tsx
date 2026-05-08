"use client";

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";

const LogoutButton = () => {
	return (
		<LogoutLink className='w-full text-left'>
			Cerrar sesión
		</LogoutLink>
	);
};
export default LogoutButton;
