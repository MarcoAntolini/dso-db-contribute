"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import {
	RateLimitExceededError,
	rateLimitExceededErrorMessage,
	UsernameAlreadyExistsError,
	usernameAlreadyExistsErrorMessage
} from "@/convex/mutations/usernames";
import { useMutation } from "convex/react";
import { Classes, Item, ItemSet } from "dso-database";
import { RefreshCcwIcon } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ItemForm from "./itemForm";
import SetForm from "./setForm";
import ShowcaseItem, { ShowCaseSet } from "./showcaseItem";

export default function ClassPage({ params }: { params: { className: string } }) {
	const router = useRouter();

	const className = params.className;
	if (className !== "Dwarf" && className !== "Ranger" && className !== "Warrior" && className !== "Mage") {
		router.push("/");
	}

	const classValue = (() => {
		switch (className) {
			case "Dwarf":
				return Classes.steamMechanicus;
			case "Ranger":
				return Classes.ranger;
			case "Warrior":
				return Classes.dragonknight;
			case "Mage":
				return Classes.spellweaver;
			default:
				throw new Error("Invalid class name");
		}
	})();

	const tab = useSearchParams().get("tab");
	if (tab !== "items" && tab !== "sets") {
		router.push(`/${className}?tab=items`);
	}

	const cookies = useCookies();
	const usernameCookie = cookies.get("username");
	const [username, setUsername] = useState(usernameCookie ?? "");

	const saveUsername = useMutation(api.mutations.usernames.saveUsername);

	const [set, setSet] = useState<ItemSet | null>(null);
	const [item, setItem] = useState<Item | null>(null);
	const [itemFormKey, setItemFormKey] = useState(0);
	const [setFormKey, setSetFormKey] = useState(0);

	useEffect(() => {
		setSet(null);
		setItem(null);
	}, [tab]);

	const clearItemForm = () => {
		setItemFormKey((prev) => prev + 1);
		setItem(null);
	};

	const clearSetForm = () => {
		setSetFormKey((prev) => prev + 1);
		setSet(null);
	};

	const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);

	return (
		<div className="flex flex-col items-center justify-center gap-10">
			{usernameCookie === undefined ? (
				<div className="flex items-center justify-center gap-2 max-xl:flex-col">
					<span className="text-sm text-muted-foreground text-nowrap">
						Insert a username if you want to be credited for your contribution.
					</span>
					<div className="flex items-center justify-center gap-2">
						<Input
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="px-3 py-2 h-[36px]"
						/>
						<AlertDialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Username already exists</AlertDialogTitle>
									<AlertDialogDescription>
										Please choose a different username if it&apos;s not you.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel
										onClick={() => {
											setUsernameDialogOpen(false);
											setUsername("");
										}}
									>
										Choose another
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={async () => {
											setUsernameDialogOpen(false);
											cookies.set("username", username);
											setUsername("");
											toast.success("Username saved");
										}}
									>
										It&apos;s me
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							size="default"
							variant="secondary"
							onClick={async () => {
								if (username === "") {
									toast.error("Username cannot be empty");
								} else {
									const response = await fetch("/api/save-username", {
										method: "POST",
										body: JSON.stringify({ username })
									}).then((res) => res.json());
									if (response.success) {
										try {
											await saveUsername({ username, ipAddress: response.ipAddress });
											cookies.set("username", username, {
												expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
											});
											toast.success("Username saved");
											setUsername("");
										} catch (error) {
											if ((error as RateLimitExceededError).message.includes(rateLimitExceededErrorMessage)) {
												toast.error(rateLimitExceededErrorMessage);
												setUsername("");
											} else if (
												(error as UsernameAlreadyExistsError).message.includes(usernameAlreadyExistsErrorMessage)
											) {
												setUsernameDialogOpen(true);
											} else {
												toast.error("An error occurred while saving your username.");
												setUsername("");
											}
										}
									}
								}
							}}
							className="px-3 py-2 h-fit"
						>
							Save
						</Button>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-center gap-2">
					<span className="text-sm text-muted-foreground text-nowrap">
						You are now contributing as <span className="font-bold text-foreground">{usernameCookie}</span>.
					</span>
					<Button
						variant="destructive"
						onClick={() => {
							cookies.remove("username");
							toast.success("Username removed");
							setUsername("");
						}}
						className="px-3 py-2 h-fit"
					>
						Remove username
					</Button>
				</div>
			)}
			<div className="flex justify-between gap-20 max-xl:flex-col max-xl:items-center max-xl:gap-10">
				<Tabs defaultValue={tab ?? "items"} className="w-[600px]">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="items" onClick={() => router.push(`/${className}?tab=items`)}>
							Items
						</TabsTrigger>
						<TabsTrigger value="sets" onClick={() => router.push(`/${className}?tab=sets`)}>
							Sets
						</TabsTrigger>
					</TabsList>
					<TabsContent value="items">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>Add new {className.toLowerCase()} item</CardTitle>
								<Button variant="secondary" onClick={clearItemForm} className="flex items-center gap-2">
									Clear
									<RefreshCcwIcon className="w-4 h-4" />
								</Button>
							</CardHeader>
							<ItemForm key={itemFormKey} classValue={classValue} setItem={setItem} clearItemForm={clearItemForm} />
						</Card>
					</TabsContent>
					<TabsContent value="sets">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>Add new {className.toLowerCase()} set</CardTitle>
								<Button variant="secondary" onClick={clearSetForm} className="flex items-center gap-2">
									Clear
									<RefreshCcwIcon className="w-4 h-4" />
								</Button>
							</CardHeader>
							<SetForm key={setFormKey} classValue={classValue} setSet={setSet} clearSetForm={clearSetForm} />
						</Card>
					</TabsContent>
				</Tabs>
				<div className="w-[500px]" id="preview">
					{tab === "sets" && set && <ShowCaseSet set={set} />}
					{tab === "items" && item && <ShowcaseItem item={item} />}
				</div>
			</div>
		</div>
	);
}
