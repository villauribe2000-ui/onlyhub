"use client";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useState } from "react";

const AuthButtons = () => {
	const [loading, setLoading] = useState(false);

	return (
		<div className='flex flex-col gap-3 w-full'>
			<LoginLink onClick={() => setLoading(true)}>
				<button
					disabled={loading}
					className='w-full font-bold py-3 rounded-full text-sm uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-60'
					style={{ backgroundColor: 'rgba(224,0,94,0.15)', color: '#E0005E' }}
				>
					{loading ? "Cargando..." : "Iniciar sesión"}
				</button>
			</LoginLink>

			<RegisterLink onClick={() => setLoading(true)}>
				<button
					disabled={loading}
					className='w-full text-center text-sm font-semibold hover:underline'
					style={{ color: '#E0005E' }}
				>
					· Regístrate en OnlyHub
				</button>
			</RegisterLink>
		</div>
	);
};
export default AuthButtons;
