import { getUserProfileAction } from "@/app/update-profile/actions";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
	const currentUser = await getUserProfileAction();

	if (!currentUser) {
		return redirect("/");
	}

	return redirect(`/profile/${currentUser.id}`);
};
export default ProfilePage;
