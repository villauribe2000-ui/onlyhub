import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import SuggestedProducts from "./SuggestedProducts";
import BottomNav from "./BottomNav";
import { getUserProfileAction } from "@/app/update-profile/actions";

const BaseLayout = async ({
	children,
	renderRightPanel = true,
}: {
	children: ReactNode;
	renderRightPanel?: boolean;
}) => {
	const { isAuthenticated, getUser } = getKindeServerSession();
	if (!(await isAuthenticated())) {
		return redirect("/");
	}

	const kindeUser = await getUser();
	const userProfile = await getUserProfileAction();
	const isAdmin = kindeUser?.email === process.env.ADMIN_EMAIL;
	const billingUrl = (process.env.STRIPE_BILLING_PORTAL_LINK_DEV || "") + "?prefilled_email=" + kindeUser?.email;

	return (
		<div className='flex max-w-[1400px] mx-auto relative w-full'>
			{/* Sidebar — hidden on mobile */}
			<div className='hidden lg:flex lg:w-[240px] xl:w-[280px]'>
				<Sidebar />
			</div>

			<div className='flex-1 flex flex-col border-r min-w-0 pb-16 md:pb-0 max-w-[600px] mx-auto lg:mx-0 lg:max-w-none'>{children}</div>
			{renderRightPanel && (
				<div className='hidden lg:block lg:w-[320px] xl:w-[360px]'>
					<SuggestedProducts />
				</div>
			)}

			{/* Bottom nav — only on mobile */}
			<BottomNav
				image={userProfile?.image}
				name={userProfile?.name}
				username={(userProfile as any)?.username}
				isAdmin={isAdmin}
				billingUrl={billingUrl}
				isCreator={(userProfile as any)?.isCreator}
				isVerified={(userProfile as any)?.isVerified}
				balance={(userProfile as any)?.balance}
			/>
		</div>
	);
};
export default BaseLayout;
