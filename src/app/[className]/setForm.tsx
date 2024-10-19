"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Class, ItemSet, StatType, StatTypes } from "dso-database";
import { Check, ChevronsUpDown, PlusIcon, TrashIcon } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const setFormSchema = z.object({
	name: z.string(),
	items: z.array(
		z.object({
			name: z.string()
		})
	),
	setBonus: z.array(
		z.object({
			requiredItems: z.number().min(1),
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
});

export default function SetForm({
	classValue,
	setSet,
	clearSetForm
}: {
	classValue: Class;
	setSet: (set: ItemSet) => void;
	clearSetForm: () => void;
}) {
	const form = useForm<z.infer<typeof setFormSchema>>({
		resolver: zodResolver(setFormSchema),
		defaultValues: {}
	});

	const {
		fields: itemsFields,
		append: itemsAppend,
		remove: itemsRemove
	} = useFieldArray({
		control: form.control,
		name: "items"
	});

	const {
		fields: setBonusFields,
		append: setBonusAppend,
		remove: setBonusRemove
	} = useFieldArray({
		control: form.control,
		name: "setBonus"
	});

	const [setBonusTypes, setSetBonusTypes] = useState<("stat" | "special bonus")[]>([]);

	const [statsPopoverOpen, setStatsPopoverOpen] = useState<boolean[]>([]);

	const createSet = useMutation(api.mutations.sets.createSet);

	const name = form.watch("name");
	const set = useQuery(api.queries.sets.getSetByName, { setName: name ?? "", class: classValue });

	const cookies = useCookies();

	function handleSetSet() {
		setSet({
			name: form.getValues("name"),
			items: form.getValues("items").map((item) => item.name),
			setBonus: form.getValues("setBonus").map((bonus) => ({
				requiredItems: bonus.requiredItems,
				bonus:
					typeof bonus.bonus === "string"
						? bonus.bonus
						: {
								stat: bonus.bonus.stat as StatType,
								value: Number(bonus.bonus.value)
							}
			}))
		});
		document.getElementById("preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	function checkForm() {
		const values = form.getValues();
		if (!values.name || !values.items || !values.setBonus) {
			toast.error("Please fill in all the fields");
			return;
		}
	}

	function onSubmit(values: z.infer<typeof setFormSchema>) {
		if (set) {
			toast.warning("Set already exists");
			return;
		}
		try {
			createSet({
				name: values.name,
				class: classValue,
				items: values.items.map((item) => item.name),
				setBonus: values.setBonus,
				contributorUsername: cookies.get("username") ?? undefined
			});
			clearSetForm();
			toast.success("Set created successfully");
			fetch("/api/send-email", {
				method: "POST",
				body: JSON.stringify({ type: "set", class: classValue, name: values.name })
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
										<Input placeholder="Set name" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<Card className="p-3 space-y-3">
							<CardHeader className="flex flex-row justify-between items-center space-y-0 p-0">
								<CardTitle className="text-md font-medium pl-2">Set items</CardTitle>
								<Button type="button" variant="outline" onClick={() => itemsAppend({ name: "" })}>
									<PlusIcon className="w-4 h-4" />
								</Button>
							</CardHeader>
							{itemsFields.length > 0 && (
								<CardContent className="p-0">
									<div className="space-y-2">
										{itemsFields.map((field, index) => (
											<div key={field.id} className="flex items-center space-x-2">
												<FormField
													control={form.control}
													name={`items.${index}.name`}
													render={({ field }) => (
														<FormItem className="w-full">
															<FormControl>
																<Input {...field} placeholder={`Item name ${index + 1}`} />
															</FormControl>
														</FormItem>
													)}
												/>
												<Button type="button" variant="destructive" onClick={() => itemsRemove(index)}>
													<TrashIcon className="w-4 h-4" />
												</Button>
											</div>
										))}
									</div>
								</CardContent>
							)}
						</Card>
						<Card className="p-3 space-y-3">
							<CardHeader className="flex flex-row justify-between items-center space-y-0 p-0">
								<CardTitle className="text-md font-medium pl-2">Set bonus</CardTitle>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setBonusAppend({ requiredItems: 0, bonus: "" });
										setStatsPopoverOpen((prev) => [...prev, false]);
									}}
								>
									<PlusIcon className="w-4 h-4" />
								</Button>
							</CardHeader>
							{setBonusFields.length > 0 && (
								<CardContent className="p-0">
									<div className="space-y-2">
										{setBonusFields.map((field, index) => (
											<Card key={field.id}>
												<CardHeader className="flex flex-row justify-between items-center space-y-0 p-2 pb-0">
													<CardTitle className="text-sm font-medium pl-2">Set bonus {index + 1}</CardTitle>
													<Button type="button" variant="destructive" size="sm" onClick={() => setBonusRemove(index)}>
														<TrashIcon className="w-4 h-4" />
													</Button>
												</CardHeader>
												<CardContent className="p-2 space-y-2">
													<div className="grid grid-cols-2 items-center gap-2">
														<FormField
															control={form.control}
															name={`setBonus.${index}.requiredItems`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<div className="flex items-center space-x-2">
																			<Select
																				{...field}
																				onValueChange={(value) => field.onChange(Number(value))}
																				value={field.value === 0 ? undefined : field.value?.toString()}
																			>
																				<SelectTrigger>
																					<SelectValue placeholder="Required items" />
																				</SelectTrigger>
																				<SelectContent>
																					{Array.from({ length: itemsFields.length }, (_, i) => (
																						<SelectItem key={i} value={(i + 1).toString()}>
																							{i + 1}
																						</SelectItem>
																					))}
																				</SelectContent>
																			</Select>
																		</div>
																	</FormControl>
																</FormItem>
															)}
														/>
														<Select
															onValueChange={(value) =>
																setSetBonusTypes((prev) => {
																	const newTypes = [...prev];
																	newTypes[index] = value as "stat" | "special bonus";
																	return newTypes;
																})
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Bonus type" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="stat">Stat</SelectItem>
																<SelectItem value="special bonus">Special bonus</SelectItem>
															</SelectContent>
														</Select>
													</div>
													{setBonusTypes[index] === "stat" && (
														<div className="grid grid-cols-2 items-center gap-2">
															<FormField
																control={form.control}
																name={`setBonus.${index}.bonus.stat`}
																render={({ field }) => (
																	<FormItem>
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
																					<Button
																						variant="outline"
																						className={cn(
																							"w-full justify-between",
																							!field.value && "text-muted-foreground"
																						)}
																					>
																						{field.value || "Select stat"}
																						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																					</Button>
																				</PopoverTrigger>
																				<PopoverContent className="p-0 w-[249px]">
																					<Command>
																						<CommandInput placeholder="Search stat..." />
																						<CommandList>
																							{Object.values(StatTypes).map((stat) => (
																								<CommandItem
																									key={stat}
																									onSelect={() => {
																										field.onChange(stat);
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
																name={`setBonus.${index}.bonus.value`}
																render={({ field }) => (
																	<FormItem>
																		<FormControl>
																			<Input placeholder="Value" {...field} type="number" />
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
													)}
													{setBonusTypes[index] === "special bonus" && (
														<FormField
															control={form.control}
															name={`setBonus.${index}.bonus`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<Input
																			placeholder="Special bonus"
																			{...field}
																			value={typeof field.value === "string" ? field.value : ""}
																			onChange={(e) => field.onChange(e.target.value)}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
													)}
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							)}
						</Card>
					</CardContent>
					<CardFooter className="flex justify-between !mt-0">
						<Button variant="outline" type="button" onClick={handleSetSet}>
							Preview set
						</Button>
						<Button type="submit" onClick={checkForm}>
							Submit
						</Button>
					</CardFooter>
				</form>
			</Form>
		</>
	);
}
