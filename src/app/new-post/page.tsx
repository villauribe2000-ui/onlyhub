import BaseLayout from "@/components/BaseLayout";
import NewPostForm from "./NewPostForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const NewPostPage = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<NewPostForm />
		</BaseLayout>
	);
};
export default NewPostPage;
