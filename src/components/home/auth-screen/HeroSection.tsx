"use client";
import AuthButtons from "./AuthButtons";
import Image from "next/image";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

const HeroSection = () => {
	return (
		<div className='min-h-screen w-full flex flex-col bg-white dark:bg-background px-5 py-8 max-w-md mx-auto'>
			{/* Logo */}
			<div className='flex items-center gap-2 mb-8'>
				<Image src='/logo.png' alt='OnlyHub Logo' width={48} height={48} className='object-contain' />
				<span className='text-2xl font-black' style={{ color: '#E0005E' }}>OnlyHub</span>
			</div>

			{/* Headline */}
			<h1 className='text-3xl font-bold text-foreground leading-tight mb-8'>
				Regístrate para apoyar a tus creadores favoritos
			</h1>

			{/* Login section */}
			<p className='text-sm font-semibold text-foreground mb-3'>Iniciar sesión</p>

			{/* Fake inputs — visual only, Kinde handles real auth */}
			<div className='flex flex-col gap-3 mb-3'>
				<div className='w-full border border-border rounded-lg px-4 py-3 text-muted-foreground text-sm bg-background'>
					Correo
				</div>
				<div className='w-full border border-border rounded-lg px-4 py-3 text-muted-foreground text-sm bg-background flex justify-between items-center'>
					<span>Contraseña</span>
					<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-muted-foreground'>
						<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/>
						<circle cx='12' cy='12' r='3'/>
					</svg>
				</div>
			</div>

			{/* Email login/register buttons */}
			<AuthButtons />

			{/* Terms */}
			<p className='text-xs text-muted-foreground mt-3 leading-relaxed'>
				Al iniciar sesión y usar OnlyHub, aceptas nuestros{' '}
				<span style={{ color: '#E0005E' }}>Términos de servicio</span> y{' '}
				<span style={{ color: '#E0005E' }}>Política de privacidad</span>, y confirmas que tienes al menos 18 años.
			</p>

			<div className='my-5 border-t border-border' />

			{/* Social login */}
			<div className='flex flex-col gap-3'>
				{/* Google */}
				<LoginLink
					authUrlParams={{ connection_id: "conn_019dfb16bd10c21ad4f8a111d26f8e0d" }}
					className='w-full flex items-center justify-center gap-3 bg-[#00AFF0] text-white font-bold py-3 rounded-full text-sm hover:opacity-90 transition-opacity'
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'>
						<path fill='white' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
						<path fill='white' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
						<path fill='white' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
						<path fill='white' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
					</svg>
					INICIAR SESIÓN CON GOOGLE
				</LoginLink>
			</div>
		</div>
	);
};
export default HeroSection;
