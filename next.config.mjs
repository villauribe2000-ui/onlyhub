/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [{ hostname: "res.cloudinary.com" }],
	},
	eslint: {
		// Desactivar ESLint durante el build de producción
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Desactivar errores de TypeScript durante el build
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
