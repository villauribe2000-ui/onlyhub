"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchButton = () => {
	const router = useRouter();

	return (
		<button onClick={() => router.push("/search")} className='flex items-center gap-3'>
			<Search className='w-5 h-5 text-muted-foreground cursor-pointer' />
		</button>
	);
};

export default SearchButton;
