"use client";

import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { MoonLoader } from "react-spinners";

export default function Home() {
	const totalItems = useQuery(api.queries.images.getTotalItems)?.length ?? 0;
	const missingItems = useQuery(api.queries.images.getAllMissingItems)?.length ?? 0;
	const addedItems = totalItems - missingItems;

	return (
		<>
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-6">
					Welcome to the contributor page for{" "}
					<Link href="https://www.dracania-archives.com/" target="_blank" className="underline">
						Dracania Archives
					</Link>
				</h1>
				<p className="">
					Your input plays a crucial role in helping us complete the database that will help every player find all the
					data they need about any item.
				</p>
				<p className="italic mt-2">
					Little spoiler: a build calculator tool is already being developed and the items we add will be used in it!
				</p>
				<p className="mt-6">
					By helping us submit items and providing feedback, you&apos;re not only contributing to the database, but also
					to the community! And you&apos;ll be credited in the main website.
				</p>
				<p className="mt-2">
					You can join the{" "}
					<Link href="https://discord.com/invite/cRc47h7Drh" target="_blank" className="underline">
						Discord server
					</Link>{" "}
					to discuss the project and give feedback.
				</p>
				<p className="mt-6">Thank you for being part of this project!</p>
			</div>
			{totalItems && missingItems ? (
				<>
					<Progress value={(addedItems / totalItems) * 100} max={100} className="w-1/2 mt-10" />
					<p className="text-2xl font-bold">
						Missing {missingItems} items out of {totalItems}
					</p>
					<p className="text-xl font-semibold">Items already added: {((addedItems / totalItems) * 100).toFixed(0)}%</p>
				</>
			) : (
				<MoonLoader color="#3caea7" />
			)}
		</>
	);
}
