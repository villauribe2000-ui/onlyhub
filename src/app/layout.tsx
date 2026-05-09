import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "next-cloudinary/dist/cld-video-player.css";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Footer from "@/components/Footer";
import TanStackProvider from "@/providers/TanStackProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "OnlyHub - Content Platform",
	description: "OnlyHub is a platform for exclusive content creators and their subscribers.",
	manifest: "/manifest.json",
	themeColor: "#00AFF0",
	viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "OnlyHub",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="OnlyHub" />
				<meta name="mobile-web-app-capable" content="yes" />
				<link rel="apple-touch-icon" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="57x57" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="60x60" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="72x72" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="76x76" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="114x114" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="120x120" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="144x144" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="152x152" href="/full-logo.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/full-logo.png" />
				<link rel="icon" type="image/png" sizes="192x192" href="/full-logo.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/full-logo.png" />
				<link rel="icon" type="image/png" sizes="96x96" href="/full-logo.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/full-logo.png" />
			</head>
			<body className={inter.className}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
					<div className='h-screen flex flex-col'>
						<div className='flex-1'>
							<TanStackProvider>{children}</TanStackProvider>
						</div>
						<Footer />
					</div>
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	);
}
