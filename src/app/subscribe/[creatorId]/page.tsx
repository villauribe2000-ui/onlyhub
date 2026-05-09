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
	const subscriptionPrice3mo = (creator as any).subscriptionPrice3mo || null;
	const subscriptionPrice12mo = (creator as any).subscriptionPrice12mo || null;
	const freeTrialDays = (creator as any).freeTrialDays || 0;

	return (
		<BaseLayout>
			<SubscribePageClient
				creatorId={params.creatorId}
				creatorName={creator.name}
				subscriptionPrice={subscriptionPrice}
				subscriptionPrice3mo={subscriptionPrice3mo}
				subscriptionPrice12mo={subscriptionPrice12mo}
				freeTrialDays={freeTrialDays}
			/>
		</BaseLayout>
	);
};

export default SubscribePage;
