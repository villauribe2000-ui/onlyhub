import BaseLayout from "@/components/BaseLayout";
import BecomeCreatorForm from "./BecomeCreatorForm";
import { getUserProfileAction } from "../update-profile/actions";
import { redirect } from "next/navigation";

const Page = async () => {
	const me = await getUserProfileAction();
	if (me && ((me as any).isVerified || (me as any).isCreator)) {
		return redirect("/creator-dashboard");
	}

	return (
		<BaseLayout renderRightPanel={false}>
			<BecomeCreatorForm />
		</BaseLayout>
	);
};
export default Page;
