"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SubscriptionSettings from "./SubscriptionSettings";
import PayPalSettings from "./PayPalSettings";
import { getUserProfileAction } from "@/app/update-profile/actions";

const SubscriptionSettingsWrapper = async () => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
					},
				},
			})
	);

	const userProfile = await getUserProfileAction();
	const paypalLink = (userProfile as any)?.paypalLink || "";

	return (
		<QueryClientProvider client={queryClient}>
			<SubscriptionSettings />
			<PayPalSettings paypalLink={paypalLink} />
		</QueryClientProvider>
	);
};

export default SubscriptionSettingsWrapper;
