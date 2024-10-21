"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "convex/react";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function HomePage({
	searchParams
}: {
	searchParams: { status: "success" | "canceled"; sessionId: string };
}) {
	const totalItems = useQuery(api.queries.images.getTotalItems)?.length ?? 0;
	const missingItems = useQuery(api.queries.images.getAllMissingItems)?.length ?? 0;
	const addedItems = totalItems - missingItems;

	const cookies = useCookies();
	const router = useRouter();

	const paymentStatus = searchParams.status;
	const sessionId = searchParams.sessionId;

	useEffect(() => {
		const verifyPayment = async () => {
			const emailSent = cookies.get(`emailSent_${sessionId}`);
			if (paymentStatus !== undefined && sessionId !== undefined && emailSent !== "true") {
				await fetch("/api/verify-payment", {
					method: "POST",
					body: JSON.stringify({ sessionId })
				})
					.then((res) => res.json())
					.then(async (session) => {
						if (session.payment_status === "paid" && paymentStatus === "success") {
							await fetch("/api/send-payment-email", {
								method: "POST"
							});
							await fetch("/api/send-confirmation-email", {
								method: "POST",
								body: JSON.stringify({
									receipt_email: session.receipt_email,
									amount: session.amount / 100,
									currency: session.currency
								})
							});
							cookies.set(`emailSent_${sessionId}`, "true", {
								expires: new Date(Date.now() + 1000 * 60 * 60),
								path: "/"
							});
							toast.success(`Payment successful!\nThank you for your contribution! 💖`);
						} else {
							toast.error("Payment failed. Please try again.");
						}
					});
			}
		};
		verifyPayment();
	}, [paymentStatus, sessionId]);

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
							className="underline transition-all text-nowrap text-teal-600 hover:text-teal-400"
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
						className="underline transition-all text-nowrap text-teal-600 hover:text-teal-400 font-semibold"
					>
						Discord server
					</Link>{" "}
					💬 to discuss the project and give feedback.
				</p>
				<p className="mt-6">Thank you for being part of this project! 🙏</p>
			</div>
			{totalItems && missingItems ? (
				<div className="flex flex-col gap-4 items-center text-center w-full mt-10">
					<Progress
						value={(addedItems / totalItems) * 100}
						className="[&>*]:bg-teal-600 w-1/2 min-w-[500px]"
						max={100}
					/>
					<p className="text-xl font-bold">
						Missing {missingItems} items out of {totalItems} 🗃️
					</p>
					<p className="text-lg font-semibold">
						Items already added:{" "}
						<span className="font-semibold text-slate-400">{((addedItems / totalItems) * 100).toFixed(2)}%</span>
					</p>
				</div>
			) : (
				<MoonLoader color="#3caea7" className="mt-10" />
			)}
			<Card className="mt-10 flex flex-col gap-4 items-center text-center p-4">
				<CardHeader className="text-2xl font-semibold text-slate-400">✨ Support Our Journey! ✨</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<p>Your contributions help keep the Dracania Archives alive!</p>
					<p>
						Every donation goes directly towards covering hosting and development costs, ensuring we can keep bringing
						you the best tools and data.
					</p>
					<p>
						<span className="font-semibold">No amount is too small, </span>
						and every bit helps us continue to grow and improve! 🙌
					</p>
				</CardContent>
				<CardFooter>
					<Button
						className="font-semibold text-lg"
						size="lg"
						variant="secondary"
						onClick={async () => {
							await fetch("/api/checkout-session", {
								method: "POST",
								body: JSON.stringify({ username: cookies.get("username") })
							})
								.then((res) => res.json())
								.then(async (response) => {
									if (response.url) {
										router.push(response.url);
									} else {
										toast.error("Something went wrong. Please try again later.");
									}
								});
						}}
					>
						Donate now 💖
					</Button>
				</CardFooter>
			</Card>
		</>
	);
}
