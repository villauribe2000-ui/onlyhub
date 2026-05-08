"use server";

import prisma from "@/db/prisma";
import { centsToDollars } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { maybeCreateFollowerMilestoneNotifications } from "@/lib/milestones";

type PostArgs = {
	text: string;
	mediaUrl?: string;
	mediaType?: "image" | "video";
	isPublic: boolean;
};

export async function createPostAction({ isPublic, mediaUrl, mediaType, text }: PostArgs) {
	const admin = await checkIfAdmin();

	if (!admin) {
		throw new Error("Unauthorized");
	}

	const newPost = await prisma.post.create({
		data: {
			text,
			mediaUrl,
			mediaType,
			isPublic,
			userId: admin.id,
		},
	});

	return { success: true, post: newPost };
}

export async function getAllProductsAction() {
	const isAdmin = await checkIfAdmin();

	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	const products = await prisma.product.findMany();

	return products;
}

type ProductArgs = {
	name: string;
	image: string;
	price: string;
};

export async function addNewProductToStoreAction({ name, image, price }: ProductArgs) {
	const isAdmin = await checkIfAdmin();

	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	if (!name || !image || !price) {
		throw new Error("Please provide all the required fields");
	}

	const priceInCents = Math.round(parseFloat(price) * 100);

	if (isNaN(priceInCents)) {
		throw new Error("Price must be a number");
	}

	const newProduct = await prisma.product.create({
		data: {
			image,
			price: priceInCents,
			name,
		},
	});

	return { success: true, product: newProduct };
}

export async function toggleProductArchiveAction(productId: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	const product = await prisma.product.findUnique({ where: { id: productId } });

	if (!product) {
		throw new Error("Product not found");
	}

	const updatedProduct = await prisma.product.update({
		where: { id: productId },
		data: {
			isArchived: !product.isArchived,
		},
	});

	return { success: true, product: updatedProduct };
}

export async function getDashboardData() {
	const totalRevenuePromise = Promise.all([
		prisma.order.aggregate({
			_sum: {
				price: true,
			},
		}),
		prisma.subscription.aggregate({
			_sum: {
				price: true,
			},
		}),
	]);

	const totalSalesPromise = prisma.order.count();
	const totalSubscriptionsPromise = prisma.subscription.count();

	const recentSalesPromise = prisma.order.findMany({
		take: 4,
		orderBy: {
			orderDate: "desc",
		},
		select: {
			user: {
				select: {
					name: true,
					email: true,
					image: true,
				},
			},
			price: true,
			orderDate: true,
		},
	});

	const recentSubscriptionsPromise = prisma.subscription.findMany({
		take: 4,
		orderBy: {
			startDate: "desc",
		},
		select: {
			user: {
				select: {
					name: true,
					email: true,
					image: true,
				},
			},
			price: true,
			startDate: true,
		},
	});

	// run all promises in parallel so that they don't block each other
	const [totalRevenueResult, totalSales, totalSubscriptions, recentSales, recentSubscriptions] = await Promise.all([
		totalRevenuePromise,
		totalSalesPromise,
		totalSubscriptionsPromise,
		recentSalesPromise,
		recentSubscriptionsPromise,
	]);

	const totalRevenue = (totalRevenueResult[0]._sum.price || 0) + (totalRevenueResult[1]._sum.price || 0);

	return {
		totalRevenue: centsToDollars(totalRevenue),
		totalSales,
		totalSubscriptions,
		recentSales,
		recentSubscriptions,
	};
}

async function checkIfAdmin() {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const isAdmin = user?.email === process.env.ADMIN_EMAIL;

	if (!user || !isAdmin) return null;

	return user;
}

export async function getAllUsersAction() {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const admin = await checkIfAdmin();
	const adminId = admin?.id;

	const allUsers = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			username: true,
			email: true,
			image: true,
			isSubscribed: true,
			isVerified: true,
			followersOverride: true,
			_count: {
				select: {
					followers: true,
				},
			},
			createdAt: true,
		},
	});

	if (!adminId) return allUsers;

	return allUsers.sort((a, b) => {
		if (a.id === adminId) return -1;
		if (b.id === adminId) return 1;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

export async function toggleUserVerifiedAction(userId: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw new Error("User not found");

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { isVerified: !user.isVerified },
	});

	return { success: true, isVerified: updated.isVerified };
}

export async function getCreatorRequestsAction() {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	return prisma.creatorRequest.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			user: {
				select: { id: true, name: true, email: true, image: true, isVerified: true, balance: true, isCreator: true },
			},
		},
	});
}

export async function handleCreatorRequestAction(requestId: string, status: "approved" | "rejected") {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const request = await prisma.creatorRequest.update({
		where: { id: requestId },
		data: { status },
		include: { user: true },
	});

	if (status === "approved") {
		await prisma.user.update({
			where: { id: request.userId },
			data: { isCreator: true, isVerified: true },
		});

		// Notify the creator
		await prisma.notification.create({
			data: {
				userId: request.userId,
				title: "✅ ¡Fuiste aceptado como creador!",
				message: "Tu solicitud fue aprobada. Ya eres creador verificado en OnlyHub. Ahora puedes publicar contenido exclusivo y recibir pagos.",
			},
		});
	}

	// Delete the request after processing
	await prisma.creatorRequest.delete({ where: { id: requestId } });

	return { success: true };
}

export async function makeUserCreatorAction(userId: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw new Error("User not found");

	// Create a creator request with approved status
	const creatorRequest = await prisma.creatorRequest.create({
		data: {
			userId,
			message: "Creado por administrador",
			status: "approved",
		},
	});

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { isCreator: true, isVerified: true },
	});

	// Send notification to the user
	await prisma.notification.create({
		data: {
			userId,
			title: "✅ ¡Fuiste aceptado como creador!",
			message: "Tu cuenta ha sido convertida en creador por el administrador. Ahora puedes publicar contenido exclusivo y recibir pagos.",
		},
	});

	return { success: true, isCreator: updated.isCreator, creatorRequest };
}

export async function updateUserBalanceAction(userId: string, amountInCents: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	await prisma.user.update({
		where: { id: userId },
		data: { balance: amountInCents },
	});

	// Send notification to the creator
	const dollars = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amountInCents / 100);
	await prisma.notification.create({
		data: {
			userId,
			title: "💰 OnlyHub te ha enviado un pago",
			message: `Has ganado ${dollars} USD.\n\nEste pago fue enviado por OnlyHub. Puedes verlo en tu billetera.`,
		},
	});

	return { success: true };
}

export async function setFreeTrialDaysAction(userId: string, days: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	await prisma.user.update({
		where: { id: userId },
		data: { freeTrialDays: days },
	});

	return { success: true };
}

export async function setCreatorSubscriptionPriceAction(userId: string, price1mo: number, price3mo?: number, price12mo?: number) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	// Allow admin or the creator themselves
	if (user.email !== process.env.ADMIN_EMAIL && user.id !== userId) {
		throw new Error("Unauthorized");
	}

	const targetUserId = userId === "me" ? user.id : userId;

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			subscriptionPrice: price1mo,
			subscriptionPrice3mo: price3mo,
			subscriptionPrice12mo: price12mo,
		},
	});

	return { success: true };
}

export async function setCreatorSubscriptionFreeAction(userId: string) {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) throw new Error("Unauthorized");

	// Allow admin or the creator themselves
	if (user.email !== process.env.ADMIN_EMAIL && user.id !== userId) {
		throw new Error("Unauthorized");
	}

	const targetUserId = userId === "me" ? user.id : userId;

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			subscriptionPrice: null,
			subscriptionPrice3mo: null,
			subscriptionPrice12mo: null,
		},
	});

	return { success: true };
}

export async function setUserFollowersOverrideAction(userId: string, followers: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	if (followers < 0) throw new Error("Followers cannot be negative");

	const current = await prisma.user.findUnique({
		where: { id: userId },
		select: { followersOverride: true, name: true },
	});
	if (!current) throw new Error("User not found");

	await prisma.user.update({
		where: { id: userId },
		data: { followersOverride: followers },
	});

	const delta = followers - (current.followersOverride || 0);
	if (delta !== 0) {
		await prisma.followerAdjustment.create({
			data: { userId, delta },
		});
	}

	// Send 100 follower notifications with drip effect
	const sampleCount = Math.min(100, Math.abs(delta));
	const sampleNames = Array.from({ length: sampleCount }).map((_, i) => `fan_${i + 1}`);

	for (const name of sampleNames) {
		await prisma.notification.create({
			data: {
				userId,
				title: "👤 Nuevo seguidor",
				message: `${name} comenzó a seguirte.`,
			},
		});
		// Wait 200ms between notifications for drip effect
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	await maybeCreateFollowerMilestoneNotifications(userId);

	return { success: true };
}

export async function getAllPostsForAdminAction() {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	// Always use backward-compatible selection; some environments still don't have Post.views in Prisma client.
	const posts = await prisma.post.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			text: true,
			likes: true,
			userId: true,
		},
		take: 100,
	});
	return posts.map((p) => ({ ...p, views: 0 }));
}

export async function setPostLikesAction(postId: string, likes: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	if (likes < 0) throw new Error("Likes cannot be negative");

	await prisma.post.update({
		where: { id: postId },
		data: { likes },
	});

	return { success: true };
}

export async function addPostLikesAction(postId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const post = await prisma.post.findUnique({ where: { id: postId }, select: { likes: true } });
	if (!post) throw new Error("Post not found");

	await prisma.post.update({
		where: { id: postId },
		data: { likes: post.likes + amount },
	});

	return { success: true };
}

export async function removePostLikesAction(postId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const post = await prisma.post.findUnique({ where: { id: postId }, select: { likes: true } });
	if (!post) throw new Error("Post not found");

	await prisma.post.update({
		where: { id: postId },
		data: { likes: Math.max(post.likes - amount, 0) },
	});

	return { success: true };
}

export async function addUserFollowersOverrideAction(userId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { followersOverride: true, name: true },
	});
	if (!user) throw new Error("User not found");

	await prisma.user.update({
		where: { id: userId },
		data: { followersOverride: (user.followersOverride || 0) + amount },
	});

	await prisma.followerAdjustment.create({
		data: { userId, delta: amount },
	});

	// Send 100 follower notifications with drip effect
	const sampleCount = Math.min(100, amount);
	const sampleNames = Array.from({ length: sampleCount }).map((_, i) => `fan_${i + 1}`);

	for (const name of sampleNames) {
		await prisma.notification.create({
			data: {
				userId,
				title: "👤 Nuevo seguidor",
				message: `${name} comenzó a seguirte.`,
			},
		});
		// Wait 200ms between notifications for drip effect
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	await maybeCreateFollowerMilestoneNotifications(userId);

	return { success: true };
}

export async function removeUserFollowersOverrideAction(userId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { followersOverride: true, name: true },
	});
	if (!user) throw new Error("User not found");

	const newOverride = Math.max((user.followersOverride || 0) - amount, 0);
	await prisma.user.update({
		where: { id: userId },
		data: { followersOverride: newOverride },
	});

	await prisma.followerAdjustment.create({
		data: { userId, delta: -amount },
	});

	// Send 100 follower notifications with drip effect (simulating that people followed before being removed)
	const sampleCount = Math.min(100, amount);
	const sampleNames = Array.from({ length: sampleCount }).map((_, i) => `fan_${i + 1}`);

	for (const name of sampleNames) {
		await prisma.notification.create({
			data: {
				userId,
				title: "👤 Nuevo seguidor",
				message: `${name} comenzó a seguirte.`,
			},
		});
		// Wait 200ms between notifications for drip effect
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	// Removing followers can't create new milestones; skip check.

	return { success: true };
}

export async function simulateFollowerWaveAction(userId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount <= 0) throw new Error("Amount must be greater than 0");

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { followersOverride: true, name: true },
	});
	if (!user) throw new Error("User not found");

	await prisma.user.update({
		where: { id: userId },
		data: { followersOverride: (user.followersOverride || 0) + amount },
	});

	await prisma.followerAdjustment.create({
		data: { userId, delta: amount },
	});

	// Scalable mode: one summary + a few sample events (not 100k rows).
	const sampleCount = Math.min(amount, 25);
	const sampleNames = Array.from({ length: sampleCount }).map((_, i) => `fan_${i + 1}`);

	await prisma.notification.create({
		data: {
			userId,
			title: "🚀 Oleada de seguidores",
			message: `¡${amount.toLocaleString()} personas comenzaron a seguirte! Tu cuenta está creciendo muy rápido.`,
		},
	});

	for (const n of sampleNames) {
		await prisma.notification.create({
			data: {
				userId,
				title: "👤 Nuevo seguidor",
				message: `${n} comenzó a seguirte.`,
			},
		});
	}

	await maybeCreateFollowerMilestoneNotifications(userId);

	return { success: true, simulatedNotifications: sampleCount + 1 };
}

const FIRST_NAMES = [
	"Emma",
	"Sofia",
	"Valentina",
	"Mia",
	"Camila",
	"Isabella",
	"Luna",
	"Noah",
	"Liam",
	"Mateo",
	"Santiago",
	"Daniel",
	"Lucas",
	"Sebastian",
];

const LAST_NAMES = ["Garcia", "Lopez", "Martinez", "Rodriguez", "Perez", "Gonzalez", "Hernandez", "Torres"];
const COUNTRIES = ["MX", "CO", "ES", "US", "AR", "CL", "PE"] as const;

function randomFrom<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function makeFakePerson(seed: string, country?: string) {
	const first = randomFrom(FIRST_NAMES);
	const last = randomFrom(LAST_NAMES);
	const normalizedCountry = (country || randomFrom([...COUNTRIES])).toUpperCase();
	const name = `${first} ${last}`;
	const username = `${first.toLowerCase()}_${last.toLowerCase()}_${normalizedCountry.toLowerCase()}_${seed.slice(-4)}`;
	const email = `${username}@onlyhub-fake.local`;
	const image = `https://api.dicebear.com/8.x/personas/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
	const bio = `Creator from ${normalizedCountry}`;
	return { name, username, email, image, country: normalizedCountry, bio };
}

export async function generateRandomFollowersAction(targetUserId: string, amount: number, country?: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount <= 0) throw new Error("Amount must be greater than 0");
	if (amount > 500) throw new Error("Max 500 per request for performance.");

	const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, name: true } });
	if (!target) throw new Error("Target user not found");

	let created = 0;
	const now = Date.now().toString();

	for (let i = 0; i < amount; i++) {
		const seed = `${now}_${i}_${Math.floor(Math.random() * 99999)}`;
		const fake = makeFakePerson(seed, country);

		const follower = await prisma.user.create({
			data: {
				email: fake.email,
				name: fake.name,
				username: fake.username,
				image: fake.image,
				bio: fake.bio,
				isSubscribed: true,
			},
		});

		await prisma.follow.create({
			data: {
				followerId: follower.id,
				followingId: target.id,
			},
		});

		created++;
	}

	await prisma.notification.create({
		data: {
			userId: target.id,
			title: "🧲 Nuevos seguidores",
			message: `Ganaste ${created.toLocaleString()} seguidores nuevos con perfiles completos.`,
		},
	});

	await maybeCreateFollowerMilestoneNotifications(target.id);

	return { success: true, created };
}

export async function getGeneratedFollowersStatsAction(targetUserId: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const [totalFakeUsers, fakeFollowersForTarget] = await Promise.all([
		prisma.user.count({
			where: {
				email: {
					contains: "@onlyhub-fake.local",
				},
			},
		}),
		prisma.follow.count({
			where: {
				followingId: targetUserId,
				follower: {
					email: {
						contains: "@onlyhub-fake.local",
					},
				},
			},
		}),
	]);

	return {
		totalFakeUsers,
		fakeFollowersForTarget,
	};
}

export async function getGlobalFakeUsersCountAction() {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	return prisma.user.count({
		where: {
			email: {
				contains: "@onlyhub-fake.local",
			},
		},
	});
}

export async function setPostViewsAction(postId: string, views: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (views < 0) throw new Error("Views cannot be negative");

	const current = await prisma.post.findUnique({ where: { id: postId }, select: { views: true } });
	if (!current) throw new Error("Post not found");

	await prisma.post.update({
		where: { id: postId },
		data: { views },
	});

	const delta = views - current.views;
	if (delta !== 0) {
		await prisma.postViewAdjustment.create({
			data: { postId, delta },
		});
	}

	return { success: true };
}

export async function addPostViewsAction(postId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const post = await prisma.post.findUnique({ where: { id: postId }, select: { views: true } });
	if (!post) throw new Error("Post not found");

	await prisma.post.update({
		where: { id: postId },
		data: { views: post.views + amount },
	});

	await prisma.postViewAdjustment.create({
		data: { postId, delta: amount },
	});

	return { success: true };
}

export async function removePostViewsAction(postId: string, amount: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amount < 0) throw new Error("Amount cannot be negative");

	const post = await prisma.post.findUnique({ where: { id: postId }, select: { views: true } });
	if (!post) throw new Error("Post not found");

	const newViews = Math.max(post.views - amount, 0);
	await prisma.post.update({
		where: { id: postId },
		data: { views: newViews },
	});

	await prisma.postViewAdjustment.create({
		data: { postId, delta: -amount },
	});

	return { success: true };
}

export async function addUserEarningsAction(userId: string, amountInCents: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amountInCents < 0) throw new Error("Amount cannot be negative");

	await prisma.user.update({
		where: { id: userId },
		data: { balance: { increment: amountInCents } },
	});

	await prisma.earningsAdjustment.create({
		data: { userId, amount: amountInCents },
	});

	return { success: true };
}

export async function removeUserEarningsAction(userId: string, amountInCents: number) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (amountInCents < 0) throw new Error("Amount cannot be negative");

	const u = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });
	if (!u) throw new Error("User not found");

	const newBalance = Math.max(u.balance - amountInCents, 0);
	await prisma.user.update({
		where: { id: userId },
		data: { balance: newBalance },
	});

	await prisma.earningsAdjustment.create({
		data: { userId, amount: -amountInCents },
	});

	return { success: true };
}

export async function subscribeUserAction(subscriberId: string, creatorId: string, priceInCents: number, quantity: number = 1) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");
	if (priceInCents < 0) throw new Error("Price cannot be negative");
	if (quantity < 1) throw new Error("Quantity must be at least 1");

	// Get creator info
	const creator = await prisma.user.findUnique({
		where: { id: creatorId },
		select: { name: true, subscriptionPrice: true, subscriptionPrice3mo: true, subscriptionPrice12mo: true },
	});
	if (!creator) throw new Error("Creator not found");

	// Create subscription
	const planId = "monthly"; // Default to monthly
	const now = new Date();
	const endDate = new Date(now);
	endDate.setMonth(endDate.getMonth() + 1);

	const subscription = await prisma.subscription.upsert({
		where: { userId: subscriberId },
		update: {
			planId,
			price: priceInCents,
			startDate: now,
			endDate,
		},
		create: {
			userId: subscriberId,
			planId,
			price: priceInCents,
			startDate: now,
			endDate,
		},
	});

	// Update subscriber isSubscribed status
	await prisma.user.update({
		where: { id: subscriberId },
		data: { isSubscribed: true },
	});

	// Transfer earnings to creator (multiply by quantity)
	const totalAmount = priceInCents * quantity;
	await prisma.user.update({
		where: { id: creatorId },
		data: { balance: { increment: totalAmount } },
	});

	await prisma.earningsAdjustment.create({
		data: { userId: creatorId, amount: totalAmount },
	});

	// Send notifications with random names to creator (one per subscription)
	const FIRST_NAMES = ["Emma", "Sofia", "Valentina", "Mia", "Camila", "Isabella", "Luna", "Noah", "Liam", "Mateo"];
	const LAST_NAMES = ["Garcia", "Lopez", "Martinez", "Rodriguez", "Perez", "Gonzalez", "Hernandez", "Torres"];

	for (let i = 0; i < quantity; i++) {
		const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
		const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
		const randomName = `${firstName} ${lastName}`;

		await new Promise((resolve) => setTimeout(resolve, 200)); // Drip effect

		await prisma.notification.create({
			data: {
				userId: creatorId,
				title: "🎉 ¡Felicidades!",
				message: `Tienes un nuevo suscriptor: ${randomName}\n\n¡Tu comunidad sigue creciendo!`,
			},
		});
	}

	// Send notification to subscriber
	const dollars = (priceInCents / 100).toFixed(2);
	await prisma.notification.create({
		data: {
			userId: subscriberId,
			title: "✅ Suscripción activa",
			message: `¡Felicidades! Ahora estás suscrito a ${creator.name} por ${dollars} USD/mes.`,
		},
	});

	return { success: true, subscription };
}

export async function getWalletReloadsAction() {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const walletReloads = await (prisma as any).walletReload.findMany({
		where: {
			status: "pending",
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return walletReloads;
}

export async function approveWalletReloadAction(id: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const walletReload = await (prisma as any).walletReload.findUnique({
		where: { id },
	});

	if (!walletReload) throw new Error("Wallet reload not found");

	if (walletReload.status !== "pending") throw new Error("Wallet reload already processed");

	// Update the wallet reload status
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updatedWalletReload = await (prisma as any).walletReload.update({
		where: { id },
		data: {
			status: "approved",
			reviewedAt: new Date(),
		},
	});

	// Add the amount to the user's balance
	await prisma.user.update({
		where: { id: walletReload.userId },
		data: {
			balance: {
				increment: walletReload.amount,
			},
		},
	});

	// Create a notification for the user
	await prisma.notification.create({
		data: {
			userId: walletReload.userId,
			title: "✅ Recarga aprobada",
			message: `Tu recarga de $${walletReload.amount / 100} ha sido aprobada y se ha agregado a tu saldo.`,
		},
	});

	return { success: true, walletReload: updatedWalletReload };
}

export async function rejectWalletReloadAction(id: string) {
	const isAdmin = await checkIfAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const walletReload = await (prisma as any).walletReload.findUnique({
		where: { id },
	});

	if (!walletReload) throw new Error("Wallet reload not found");

	if (walletReload.status !== "pending") throw new Error("Wallet reload already processed");

	// Update the wallet reload status
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updatedWalletReload = await (prisma as any).walletReload.update({
		where: { id },
		data: {
			status: "rejected",
			reviewedAt: new Date(),
		},
	});

	// Create a notification for the user
	await prisma.notification.create({
		data: {
			userId: walletReload.userId,
			title: "❌ Recarga rechazada",
			message: `Tu recarga de $${walletReload.amount / 100} ha sido rechazada.`,
		},
	});

	return { success: true, walletReload: updatedWalletReload };
}