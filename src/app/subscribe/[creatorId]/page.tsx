import { getUserProfileAction } from "@/app/update-profile/actions";
import { notFound } from "next/navigation";
import prisma from "@/db/prisma";
import BaseLayout from "@/components/BaseLayout";
import SubscribePageClient from "./SubscribePageClient";

interface SubscribePageProps {
	params: {
		creatorId: string;
	};
}

const SubscribePage = async ({ params }: SubscribePageProps) => {
	const creator = await prisma.user.findUnique({
		where: { id: params.creatorId },
	});

	if (!creator) return notFound();

	const userProfile = await getUserProfileAction();
	const subscriptionPrice = (creator as any).subscriptionPrice || 0;

	return (
		<BaseLayout>
			<SubscribePageClient
				creatorId={params.creatorId}
				creatorName={creator.name}
				subscriptionPrice={subscriptionPrice}
			/>
		</BaseLayout>
	);
};

export default SubscribePage;
