import BaseLayout from "@/components/BaseLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentTab from "./content/ContentTab";
import StoreTab from "./store/StoreTab";
import AnalyticsTab from "./analytics/AnalyticsTab";
import UsersTab from "./users/UsersTab";
import CreatorsTab from "./creators/CreatorsTab";
import EarningsTab from "./earnings/EarningsTab";
import FollowersTab from "./followers/FollowersTab";
import SubscriptionsTab from "./subscriptions/SubscriptionsTab";
import LikesTab from "./likes/LikesTab";
import SubscriptionTab from "./subscription/SubscriptionTab";
import WalletReloadsTab from "./wallet-reloads/WalletReloadsTab";
import RequestsTab from "./requests/RequestsTab";
import ViewsTab from "./views/ViewsTab";

const Page = () => {
	return (
		<BaseLayout renderRightPanel={false}>
			<Tabs defaultValue='content' className='w-full mx-auto my-10 px-2 md:px-10'>
				<TabsList className='flex flex-col md:flex-row w-full md:w-auto h-auto gap-1'>
					<TabsTrigger value='content' className='w-full md:w-auto'>Content</TabsTrigger>
					<TabsTrigger value='store' className='w-full md:w-auto'>Store</TabsTrigger>
					<TabsTrigger value='analytics' className='w-full md:w-auto'>Analytics</TabsTrigger>
					<TabsTrigger value='users' className='w-full md:w-auto'>Users</TabsTrigger>
					<TabsTrigger value='earnings' className='w-full md:w-auto'>Ingresos</TabsTrigger>
					<TabsTrigger value='followers' className='w-full md:w-auto'>Seguidores</TabsTrigger>
					<TabsTrigger value='subscriptions' className='w-full md:w-auto'>Suscripciones</TabsTrigger>
					<TabsTrigger value='likes' className='w-full md:w-auto'>Likes</TabsTrigger>
					<TabsTrigger value='creators' className='w-full md:w-auto'>Creadores</TabsTrigger>
					<TabsTrigger value='subscription-prices' className='w-full md:w-auto'>Precios Suscripción</TabsTrigger>
					<TabsTrigger value='wallet-reloads' className='w-full md:w-auto'>Recargas</TabsTrigger>
					<TabsTrigger value='requests' className='w-full md:w-auto'>Solicitudes</TabsTrigger>
					<TabsTrigger value='views' className='w-full md:w-auto'>Reproducciones</TabsTrigger>
				</TabsList>

				<TabsContent value='content'><ContentTab /></TabsContent>
				<TabsContent value='store'><StoreTab /></TabsContent>
				<TabsContent value='analytics'><AnalyticsTab /></TabsContent>
				<TabsContent value='users'><UsersTab /></TabsContent>
				<TabsContent value='earnings'><EarningsTab /></TabsContent>
				<TabsContent value='followers'><FollowersTab /></TabsContent>
				<TabsContent value='subscriptions'><SubscriptionsTab /></TabsContent>
				<TabsContent value='likes'><LikesTab /></TabsContent>
				<TabsContent value='creators'><CreatorsTab /></TabsContent>
				<TabsContent value='subscription-prices'><SubscriptionTab /></TabsContent>
				<TabsContent value='wallet-reloads'><WalletReloadsTab /></TabsContent>
				<TabsContent value='requests'><RequestsTab /></TabsContent>
				<TabsContent value='views'><ViewsTab /></TabsContent>
			</Tabs>
		</BaseLayout>
	);
};
export default Page;
