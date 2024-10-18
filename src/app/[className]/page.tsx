"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Classes, Item, ItemSet } from "dso-database";
import { RefreshCcwIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

	return (
		<div className="flex justify-between gap-20 sm:flex-col sm:items-center sm:gap-10">
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
							<CardTitle>Add new item</CardTitle>
							<Button variant="secondary" onClick={clearItemForm} className="flex items-center gap-2">
								Clear
								<RefreshCcwIcon className="w-4 h-4" />
							</Button>
						</CardHeader>
						<ItemForm key={itemFormKey} classValue={classValue} setItem={setItem} />
					</Card>
				</TabsContent>
				<TabsContent value="sets">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Add new set</CardTitle>
							<Button variant="secondary" onClick={clearSetForm} className="flex items-center gap-2">
								Clear
								<RefreshCcwIcon className="w-4 h-4" />
							</Button>
						</CardHeader>
						<SetForm key={setFormKey} classValue={classValue} setSet={setSet} />
					</Card>
				</TabsContent>
			</Tabs>
			<div className="w-[500px]" id="preview">
				{tab === "sets" && set && <ShowCaseSet set={set} />}
				{tab === "items" && item && <ShowcaseItem item={item} />}
			</div>
		</div>
	);
}
