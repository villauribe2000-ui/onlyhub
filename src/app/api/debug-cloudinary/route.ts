export async function GET() {
	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;

	return Response.json({
		cloudName: {
			value: cloudName,
			length: cloudName?.length,
			hasNewline: cloudName?.includes('\n') || cloudName?.includes('\r'),
		},
		apiKey: {
			value: apiKey,
			length: apiKey?.length,
			hasNewline: apiKey?.includes('\n') || apiKey?.includes('\r'),
		},
		apiSecret: {
			value: apiSecret ? '***' + apiSecret.slice(-4) : undefined,
			length: apiSecret?.length,
			hasNewline: apiSecret?.includes('\n') || apiSecret?.includes('\r'),
		},
	});
}
