import prisma from "@/db/prisma";
import SuggestedProduct from "./SuggestedProduct";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const SuggestedProducts = async () => {
	const products = await prisma.product.findMany({
		where: { isArchived: false },
		take: 4,
	});

	return (
		<div className='lg:w-[350px] hidden lg:flex flex-col gap-4 px-4 sticky top-0 right-0 h-screen pt-6'>
			<div className='rounded-xl border bg-card p-4'>
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-2'>
						<ShoppingBag className='w-4 h-4 text-primary' />
						<p className='font-semibold text-sm'>Merch Store</p>
					</div>
					<Link href='/merch' className='text-xs text-primary hover:underline'>
						See all
					</Link>
				</div>

				{products.length === 0 ? (
					<p className='text-sm text-muted-foreground text-center py-4'>No products yet</p>
				) : (
					<div className='grid grid-cols-2 gap-3'>
						{products.map((product) => (
							<SuggestedProduct key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};
export default SuggestedProducts;
