import RotatedText from "@/components/decorators/RotatedText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamProps {
	imageUrl: string;
	name: string;
	position: string;
	description: string;
}

const teamList: TeamProps[] = [
	{
		imageUrl: "https://i.pravatar.cc/150?img=35",
		name: "Sarah Thompson",
		position: "Content Manager",
		description: "Sarah manages our creators and ensures the best content experience for all subscribers.",
	},
	{
		imageUrl: "https://i.pravatar.cc/150?img=60",
		name: "James Wilson",
		position: "Head of Creator Relations",
		description: "James works directly with creators to help them grow their audience and revenue.",
	},
	{
		imageUrl: "https://i.pravatar.cc/150?img=36",
		name: "Dr. Emily Carter",
		position: "Trust & Safety Lead",
		description: "Emily ensures our platform remains safe and trustworthy for all users and creators.",
	},
	{
		imageUrl: "https://i.pravatar.cc/150?img=17",
		name: "Michael Ramirez",
		position: "Platform Engineer",
		description: "Michael keeps the platform running smoothly and builds new features for our community.",
	},
];

const Team = () => {
	return (
		<section className='container py-24 sm:py-32'>
			<h2 className='text-2xl sm:text-3xl md:text-5xl text-center tracking-tighter font-bold'>
				Our <RotatedText>Dedicated</RotatedText> Crew
			</h2>

			<p className='mt-4 mb-10 text-md md:text-xl text-muted-foreground text-center'>
				Meet the team behind OnlyHub.
			</p>

			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10'>
				{teamList.map(({ description, imageUrl, name, position }) => (
					<Card key={name} className='bg-muted/50 relative mt-7 flex flex-col justify-center items-center'>
						<CardHeader className='my-8 flex justify-center items-center pb-2'>
							<img
								src={imageUrl}
								alt='Team member'
								className='absolute -top-12 rounded-full w-24 h-24 aspect-square object-cover'
							/>
							<CardTitle className='text-center'>{name}</CardTitle>
							<CardDescription className='text-primary'>{position}</CardDescription>
						</CardHeader>

						<CardContent className='text-center pb-4 px-2'>
							<p>{description}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
};
export default Team;
