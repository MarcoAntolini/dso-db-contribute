"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import {
	BaseStat,
	Bonus,
	Class,
	Item,
	ItemSet,
	MythicItem,
	Rarities,
	Rarity,
	SetItem,
	Slot,
	Slots,
	StatType,
	StatTypes,
	UniqueItem,
	dwarfImages,
	mageImages,
	rangerImages,
	warriorImages
} from "dso-database";
import { Check, ChevronsUpDown, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const itemFormSchema = z.object({
	name: z.string(),
	image: z.enum([...mageImages, ...dwarfImages, ...rangerImages, ...warriorImages]),
	rarity: z.enum([Rarities.setItem, Rarities.uniqueItem, Rarities.mythicItem]),
	slot: z.union([
		z.literal(Slots.ammo),
		z.literal(Slots.amulet),
		z.literal(Slots.armor),
		z.literal(Slots.axe),
		z.literal(Slots.banner),
		z.literal(Slots.battleShield),
		z.literal(Slots.belt),
		z.literal(Slots.book),
		z.literal(Slots.boots),
		z.literal(Slots.cloak),
		z.literal(Slots.focusCrystal),
		z.literal(Slots.gloves),
		z.literal(Slots.gun),
		z.literal(Slots.heavyGun),
		z.literal(Slots.helmet),
		z.literal(Slots.longAxe),
		z.literal(Slots.longMace),
		z.literal(Slots.longStaff),
		z.literal(Slots.longSword),
		z.literal(Slots.longbow),
		z.literal(Slots.mace),
		z.literal(Slots.orb),
		z.literal(Slots.pauldrons),
		z.literal(Slots.quiver),
		z.literal(Slots.ring),
		z.literal(Slots.shield),
		z.literal(Slots.shortbow),
		z.literal(Slots.siegeBow),
		z.literal(Slots.staff),
		z.literal(Slots.sword),
		z.literal(Slots.tool),
		z.literal(Slots.trophy)
	]),
	level: z.number(),
	stats: z.array(
		z.object({
			stat: z.optional(
				z.union([
					z.literal(StatTypes.allResistance),
					z.literal(StatTypes.andermagicResistance),
					z.literal(StatTypes.armorValue),
					z.literal(StatTypes.attacksPerSecond),
					z.literal(StatTypes.blockValue),
					z.literal(StatTypes.criticalValue),
					z.literal(StatTypes.damage),
					z.literal(StatTypes.fireResistance),
					z.literal(StatTypes.healthPoints),
					z.literal(StatTypes.iceResistance),
					z.literal(StatTypes.lightningResistance),
					z.literal(StatTypes.movementSpeed),
					z.literal(StatTypes.poisonResistance)
				])
			),
			minValue: z.optional(z.number()),
			maxValue: z.optional(z.number())
		})
	),
	setName: z.optional(z.string()),
	uniqueBonus: z.optional(
		z.array(
			z.object({
				bonus: z.union([
					z.object({
						stat: z.union([
							z.literal(StatTypes.allResistance),
							z.literal(StatTypes.andermagicResistance),
							z.literal(StatTypes.armorValue),
							z.literal(StatTypes.attacksPerSecond),
							z.literal(StatTypes.blockValue),
							z.literal(StatTypes.criticalValue),
							z.literal(StatTypes.damage),
							z.literal(StatTypes.fireResistance),
							z.literal(StatTypes.healthPoints),
							z.literal(StatTypes.iceResistance),
							z.literal(StatTypes.lightningResistance),
							z.literal(StatTypes.movementSpeed),
							z.literal(StatTypes.poisonResistance)
						]),
						value: z.union([z.number(), z.string()])
					}),
					z.string()
				])
			})
		)
	)
});

export default function ItemForm({ classValue, setItem }: { classValue: Class; setItem: (item: Item) => void }) {
	const form = useForm<z.infer<typeof itemFormSchema>>({
		resolver: zodResolver(itemFormSchema),
		defaultValues: {}
	});

	const setName = form.watch("setName");
	const createItem = useMutation(api.mutations.items.createItem);
	const getSet = useQuery(api.queries.sets.getSet, { class: classValue, setName: setName ?? "" });
	const set: ItemSet | undefined = getSet
		? {
				name: getSet.name,
				items: getSet.items,
				setBonus: getSet.setBonus.map((setBonus) => ({
					requiredItems: setBonus.requiredItems,
					bonus: setBonus.bonus as Bonus
				}))
			}
		: undefined;

	const {
		fields: statsFields,
		append: statsAppend,
		remove: statsRemove
	} = useFieldArray({
		control: form.control,
		name: "stats"
	});

	const {
		fields: uniqueBonusFields,
		append: uniqueBonusAppend,
		remove: uniqueBonusRemove
	} = useFieldArray({
		control: form.control,
		name: "uniqueBonus"
	});

	const [uniqueBonusTypes, setUniqueBonusTypes] = useState<("stat" | "special bonus")[]>([]);

	const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
	const [slotPopoverOpen, setSlotPopoverOpen] = useState(false);
	const [statsPopoverOpen, setStatsPopoverOpen] = useState<boolean[]>([]);
	const [setNamePopoverOpen, setSetNamePopoverOpen] = useState(false);
	const [uniqueBonusesPopoverOpen, setUniqueBonusesPopoverOpen] = useState<boolean[]>([]);

	const sets = useQuery(api.queries.sets.getSets, { class: classValue });
	const missingItems = useQuery(
		api.queries.images[`getMissing${classValue.replace(" ", "")}Items` as keyof typeof api.queries.images]
	);

	function handleSetItem() {
		const element = document.getElementById("preview");
		element?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
		const formValues = form.getValues();
		const itemData: Partial<Item> = {
			name: formValues.name,
			class: classValue,
			image: formValues.image,
			rarity: formValues.rarity,
			slot: formValues.slot,
			level: formValues.level,
			stats: formValues.stats.filter((stat) => stat.stat !== undefined) as BaseStat[]
		};
		if (formValues.rarity === Rarities.setItem && set) {
			(itemData as SetItem).set = set as ItemSet;
		}
		if (formValues.rarity === Rarities.uniqueItem && formValues.uniqueBonus) {
			(itemData as UniqueItem).uniqueBonus = formValues.uniqueBonus.map((uniqueBonus) => ({
				bonus: (typeof uniqueBonus.bonus !== "string"
					? { stat: uniqueBonus.bonus.stat, value: uniqueBonus.bonus.value }
					: uniqueBonus.bonus) as Bonus
			}));
		}
		if (formValues.rarity === Rarities.mythicItem && set && formValues.uniqueBonus) {
			(itemData as MythicItem).set = set as ItemSet;
			(itemData as MythicItem).uniqueBonus = formValues.uniqueBonus.map((uniqueBonus) => ({
				bonus: (typeof uniqueBonus.bonus !== "string"
					? {
							stat: uniqueBonus.bonus.stat,
							value:
								typeof uniqueBonus.bonus.value === "number" ? uniqueBonus.bonus.value : `${uniqueBonus.bonus.value}`
						}
					: uniqueBonus.bonus) as Bonus
			}));
		}
		setItem(itemData as Item);
	}

	function onSubmit(values: z.infer<typeof itemFormSchema>) {
		try {
			createItem({
				name: values.name,
				class: classValue,
				image: values.image,
				rarity: values.rarity,
				slot: values.slot,
				level: values.level,
				stats: values.stats.filter((stat) => stat.stat !== undefined) as BaseStat[],
				setName: values.setName ?? undefined,
				uniqueBonus: values.uniqueBonus ?? undefined
			});
			console.log("Form submitted with values:", values);
		} catch (error) {
			console.error("Error in form submission:", error);
		}
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} placeholder="Item name" />
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-8 gap-2">
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem className="col-span-6">
										<FormControl>
											<Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
												<PopoverTrigger asChild className="w-full">
													<FormControl>
														<Button
															variant="outline"
															role="combobox"
															className={cn("justify-between px-3", !field.value && "text-muted-foreground")}
														>
															{field.value ? (
																<div className="flex items-center space-x-2">
																	<Image
																		src={`https://api.dracania-archives.com/images/${field.value}.png`}
																		alt={field.value}
																		width={25}
																		height={25}
																	/>
																	<span>{field.value}</span>
																</div>
															) : (
																"Select image"
															)}
															<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="p-0 w-[410.5px]">
													<Command>
														<CommandInput placeholder="Search image..." />
														<CommandList>
															<CommandGroup>
																{missingItems?.map((item) => (
																	<CommandItem
																		value={item.imageName}
																		key={item.imageName}
																		onSelect={() => {
																			form.setValue("image", item.imageName as Item["image"]);
																			setImagePopoverOpen(false);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				item.imageName === field.value ? "opacity-100" : "opacity-0"
																			)}
																		/>
																		<div className="flex items-center space-x-2">
																			<Image
																				src={`https://api.dracania-archives.com/images/${item.imageName}.png`}
																				alt={item.imageName}
																				width={30}
																				height={30}
																			/>
																			<span>{item.imageName}</span>
																		</div>
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="level"
								render={({ field, fieldState }) => (
									<FormItem className="col-span-2">
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												onChange={(e) => field.onChange(Number(e.target.value))}
												placeholder="Item level"
												type="number"
											/>
										</FormControl>
										{fieldState.error && <p className="text-red-500">{fieldState.error.message}</p>}
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-8 gap-2">
							<FormField
								control={form.control}
								name="rarity"
								render={({ field }) => (
									<FormItem className="col-span-3">
										<FormControl>
											<Select {...field} onValueChange={(value) => field.onChange(value as Rarity)}>
												<SelectTrigger>
													<SelectValue placeholder="Select rarity" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={Rarities.setItem}>Set Item</SelectItem>
													<SelectItem value={Rarities.uniqueItem}>Unique Item</SelectItem>
													<SelectItem value={Rarities.mythicItem}>Mythic Item</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="slot"
								render={({ field }) => (
									<FormItem className="col-span-5">
										<FormControl>
											<Popover open={slotPopoverOpen} onOpenChange={setSlotPopoverOpen}>
												<PopoverTrigger asChild className="w-full">
													<FormControl>
														<Button
															variant="outline"
															role="combobox"
															className={cn("justify-between px-3", !field.value && "text-muted-foreground")}
														>
															{field.value ? field.value : "Select slot"}
															<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="p-0 w-[340.75px]">
													<Command>
														<CommandInput placeholder="Search slot..." />
														<CommandList>
															<CommandGroup>
																{Object.values(Slots).map((slot) => (
																	<CommandItem
																		value={slot}
																		key={slot}
																		onSelect={() => {
																			form.setValue("slot", slot as Slot);
																			setSlotPopoverOpen(false);
																		}}
																	>
																		<Check
																			className={cn("mr-2 h-4 w-4", slot === field.value ? "opacity-100" : "opacity-0")}
																		/>
																		<span>{slot}</span>
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<Card className="p-3 space-y-3">
							<CardHeader className="flex flex-row justify-between items-center space-y-0 p-0">
								<CardTitle className="text-md font-medium pl-2">Item stats</CardTitle>
								<Button type="button" variant="outline" onClick={() => statsAppend({})}>
									<PlusIcon className="w-4 h-4" />
								</Button>
							</CardHeader>
							{statsFields.length > 0 && (
								<CardContent className="p-0">
									<div className="space-y-2">
										{statsFields.map((field, index) => (
											<Card key={field.id}>
												<CardHeader className="flex flex-row justify-between items-center space-y-0 p-2 pb-0">
													<CardTitle className="text-sm font-medium pl-2">Stat {index + 1}</CardTitle>
													<Button type="button" variant="destructive" size="sm" onClick={() => statsRemove(index)}>
														<TrashIcon className="w-4 h-4" />
													</Button>
												</CardHeader>
												<CardContent className="p-2 space-y-2">
													<div className="grid grid-cols-4 items-center gap-2">
														<FormField
															key={field.id}
															control={form.control}
															name={`stats.${index}.stat`}
															render={({ field }) => (
																<FormItem className="col-span-2">
																	<FormControl>
																		<Popover
																			open={statsPopoverOpen[index]}
																			onOpenChange={() =>
																				setStatsPopoverOpen((prev) => {
																					const newOpen = [...prev];
																					newOpen[index] = !newOpen[index];
																					return newOpen;
																				})
																			}
																		>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button
																						variant="outline"
																						className={cn(
																							"w-full justify-between",
																							!field.value && "text-muted-foreground"
																						)}
																					>
																						{field.value ? field.value : "Select stat"}
																						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																					</Button>
																				</FormControl>
																			</PopoverTrigger>
																			<PopoverContent className="p-0 w-[249px]">
																				<Command>
																					<CommandInput placeholder="Search stat..." />
																					<CommandList>
																						<CommandGroup>
																							{Object.values(StatTypes).map((stat) => (
																								<CommandItem
																									value={stat}
																									key={stat}
																									onSelect={() => {
																										field.onChange(stat as StatType);
																										setStatsPopoverOpen((prev) => {
																											const newOpen = [...prev];
																											newOpen[index] = false;
																											return newOpen;
																										});
																									}}
																								>
																									<Check
																										className={cn(
																											"mr-2 h-4 w-4",
																											stat === field.value ? "opacity-100" : "opacity-0"
																										)}
																									/>
																									<span>{stat}</span>
																								</CommandItem>
																							))}
																						</CommandGroup>
																					</CommandList>
																				</Command>
																			</PopoverContent>
																		</Popover>
																	</FormControl>
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name={`stats.${index}.minValue`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<Input
																			{...field}
																			value={field.value ?? ""}
																			onChange={(e) => field.onChange(Number(e.target.value))}
																			placeholder="Min value"
																			type="number"
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name={`stats.${index}.maxValue`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<Input
																			{...field}
																			value={field.value ?? ""}
																			onChange={(e) => field.onChange(Number(e.target.value))}
																			placeholder="Max value"
																			type="number"
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							)}
						</Card>
						{(form.watch("rarity") === Rarities.setItem || form.watch("rarity") === Rarities.mythicItem) && (
							<FormField
								control={form.control}
								name="setName"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Popover open={setNamePopoverOpen} onOpenChange={setSetNamePopoverOpen}>
												<PopoverTrigger asChild className="w-full">
													<Button
														variant="outline"
														className={cn("w-full justify-start text-left", !field.value && "text-muted-foreground")}
													>
														{field.value ? field.value : "Select set"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="p-0 w-[550px]">
													<Command>
														<CommandInput placeholder="Search set..." />
														<CommandList>
															{sets?.map((set) => (
																<CommandItem
																	value={set.name}
																	key={set.name}
																	onSelect={() => {
																		field.onChange(set.name);
																		setSetNamePopoverOpen(false);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			set.name === field.value ? "opacity-100" : "opacity-0"
																		)}
																	/>
																</CommandItem>
															))}
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</FormControl>
									</FormItem>
								)}
							/>
						)}
						{(form.watch("rarity") === Rarities.uniqueItem || form.watch("rarity") === Rarities.mythicItem) && (
							<Card className="p-3 space-y-3">
								<CardHeader className="flex flex-row justify-between items-center space-y-0 p-0">
									<CardTitle className="text-md font-medium pl-2">Unique bonus</CardTitle>
									<Button type="button" variant="outline" onClick={() => uniqueBonusAppend({ bonus: "" })}>
										<PlusIcon className="w-4 h-4" />
									</Button>
								</CardHeader>
								{uniqueBonusFields.length > 0 && (
									<CardContent className="p-0">
										<div className="space-y-2">
											{uniqueBonusFields.map((field, index) => (
												<Card key={field.id}>
													<CardHeader className="flex flex-row justify-between items-center space-y-0 p-2">
														<CardTitle className="text-sm font-medium pl-2">Unique bonus {index + 1}</CardTitle>
														<div className="flex items-center gap-2">
															<Select
																onValueChange={(value) =>
																	setUniqueBonusTypes((prev) => {
																		const newTypes = [...prev];
																		newTypes[index] = value as "stat" | "special bonus";
																		return newTypes;
																	})
																}
															>
																<SelectTrigger className="w-[200px] h-[36px]">
																	<SelectValue placeholder="Bonus type" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="stat">Stat</SelectItem>
																	<SelectItem value="special bonus">Special bonus</SelectItem>
																</SelectContent>
															</Select>
															<Button
																type="button"
																variant="destructive"
																size="sm"
																onClick={() => uniqueBonusRemove(index)}
															>
																<TrashIcon className="w-4 h-4" />
															</Button>
														</div>
													</CardHeader>
													{uniqueBonusTypes[index] === "stat" && (
														<CardContent className="p-2 pt-0 space-y-2">
															<div className="grid grid-cols-3 items-center gap-2">
																<FormField
																	control={form.control}
																	name={`uniqueBonus.${index}.bonus.stat`}
																	render={({ field }) => (
																		<FormItem className="col-span-2">
																			<FormControl>
																				<Popover
																					open={uniqueBonusesPopoverOpen[index]}
																					onOpenChange={() =>
																						setUniqueBonusesPopoverOpen((prev) => {
																							const newOpen = [...prev];
																							newOpen[index] = !newOpen[index];
																							return newOpen;
																						})
																					}
																				>
																					<PopoverTrigger asChild>
																						<Button
																							variant="outline"
																							className={cn(
																								"w-full justify-between",
																								!field.value && "text-muted-foreground"
																							)}
																						>
																							{field.value ? field.value : "Select stat"}
																							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																						</Button>
																					</PopoverTrigger>
																					<PopoverContent className="p-0 w-[334.66px]">
																						<Command>
																							<CommandInput placeholder="Search stat..." />
																							<CommandList>
																								{Object.values(StatTypes).map((stat) => (
																									<CommandItem
																										key={stat}
																										onSelect={() => {
																											field.onChange(stat as StatType);
																											setUniqueBonusesPopoverOpen((prev) => {
																												const newOpen = [...prev];
																												newOpen[index] = false;
																												return newOpen;
																											});
																										}}
																									>
																										<Check
																											className={cn(
																												"mr-2 h-4 w-4",
																												stat === field.value ? "opacity-100" : "opacity-0"
																											)}
																										/>
																										{stat}
																									</CommandItem>
																								))}
																							</CommandList>
																						</Command>
																					</PopoverContent>
																				</Popover>
																			</FormControl>
																		</FormItem>
																	)}
																/>
																<FormField
																	control={form.control}
																	name={`uniqueBonus.${index}.bonus.value`}
																	render={({ field }) => (
																		<FormItem>
																			<FormControl>
																				<Input
																					{...field}
																					value={field.value ?? ""}
																					onChange={(e) => field.onChange(Number(e.target.value))}
																					placeholder="Value"
																					type="number"
																				/>
																			</FormControl>
																		</FormItem>
																	)}
																/>
															</div>
														</CardContent>
													)}
													{uniqueBonusTypes[index] === "special bonus" && (
														<CardContent className="p-2 pt-0 space-y-2">
															<FormField
																control={form.control}
																name={`uniqueBonus.${index}.bonus`}
																render={({ field }) => (
																	<FormItem className="col-span-2">
																		<FormControl>
																			<Input
																				{...field}
																				placeholder="Bonus"
																				value={typeof field.value === "object" ? field.value.value : field.value}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</CardContent>
													)}
												</Card>
											))}
										</div>
									</CardContent>
								)}
							</Card>
						)}
					</CardContent>
					<CardFooter className="flex justify-between !mt-0">
						<Button variant="outline" type="button" onClick={handleSetItem}>
							Preview item
						</Button>
						<Button type="submit">Submit</Button>
					</CardFooter>
				</form>
			</Form>
		</>
	);
}
