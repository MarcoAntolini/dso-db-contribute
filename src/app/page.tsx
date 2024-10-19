"use client";

import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { MoonLoader } from "react-spinners";

export default function Home() {
	const totalItems = useQuery(api.queries.images.getTotalItems)?.length ?? 0;
	const missingItems = useQuery(api.queries.images.getAllMissingItems)?.length ?? 0;
	const addedItems = totalItems - missingItems;

	return (
		<>
			<div className="text-center flex flex-col gap-4">
				<h1 className="text-4xl font-bold mb-10 flex items-center justify-center gap-2">
					<Image src="/images/website-logo.png" alt="Dracania Archives" width={40} height={40} />
					<span>
						Welcome to the contributor page for{" "}
						<Link
							href="https://www.dracania-archives.com/"
							target="_blank"
							className="underline hover:text-teal-600 transition-all text-nowrap"
						>
							Dracania Archives
						</Link>{" "}
					</span>
					<Image src="/images/website-logo.png" alt="Dracania Archives" width={40} height={40} />
				</h1>
				<p className="">
					Your input plays a crucial role 🛠️ in helping us complete the database that will help every player find all
					the data they need about any item.
				</p>
				<p className="mt-6 font-semibold text-slate-400">
					🤫 Little spoiler:{" "}
					<span className="font-normal text-primary">
						a <span className="font-semibold italic">build calculator tool</span> is already being developed... and the
						items we add will be used in it!
					</span>
				</p>
				<p className="mt-6">
					By helping us submit items and providing feedback, you&apos;re not only contributing to the database, but also
					to the community!{" "}
					<span className="font-semibold text-slate-400">And you&apos;ll be credited in the main website. 💖</span>
				</p>
				<p className="">
					You can join the{" "}
					<Link
						href="https://discord.com/invite/cRc47h7Drh"
						target="_blank"
						className="underline hover:text-teal-600 transition-all"
					>
						Discord server
					</Link>{" "}
					💬 to discuss the project and give feedback.
				</p>
				<p className="mt-6">Thank you for being part of this project! 🙏</p>
			</div>
			{totalItems && missingItems ? (
				<>
					<Progress
						value={(addedItems / totalItems) * 100}
						className="[&>*]:bg-teal-600 w-1/2 mt-10 min-w-[500px]"
						max={100}
					/>
					<p className="text-2xl font-bold">
						Missing {missingItems} items out of {totalItems} 🗃️
					</p>
					<p className="text-xl font-semibold">
						Items already added:{" "}
						<span className="font-semibold text-slate-400">{((addedItems / totalItems) * 100).toFixed(2)}%</span>
					</p>
				</>
			) : (
				<MoonLoader color="#3caea7" />
			)}
		</>
	);
}
