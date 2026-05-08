import BaseLayout from "@/components/BaseLayout";
import SearchContent from "./SearchContent";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";

const SearchPage = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<div className='flex flex-col h-full'>
				{/* Header */}
				<div className='flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<BackButton>
						<ArrowLeft className='w-5 h-5' />
					</BackButton>
					<h1 className='font-black text-lg uppercase tracking-wide'>Búsqueda</h1>
				</div>

				<SearchContent />
			</div>
		</BaseLayout>
	);
};

export default SearchPage;
