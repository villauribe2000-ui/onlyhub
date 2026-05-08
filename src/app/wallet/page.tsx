import BaseLayout from "@/components/BaseLayout";
import WalletContent from "./WalletContent";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";

const WalletPage = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-10'>
					<BackButton ariaLabel='Volver a la página anterior'>
						<ArrowLeft className='w-5 h-5' />
					</BackButton>
					<h1 className='font-black text-lg uppercase tracking-wide'>Billetera</h1>
				</div>
				<WalletContent />
			</div>
		</BaseLayout>
	);
};
export default WalletPage;
