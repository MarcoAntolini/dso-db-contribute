import { v } from "convex/values";
import { Classes } from "dso-database";
import { query } from "../_generated/server";

export const getAllSets = query({
	handler: async (ctx) => {
		return await ctx.db.query("sets").collect();
	}
});

export const getSets = query({
	args: v.object({
		class: v.union(
			v.literal(Classes.dragonknight),
			v.literal(Classes.ranger),
			v.literal(Classes.spellweaver),
			v.literal(Classes.steamMechanicus)
		)
	}),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("sets")
			.filter((q) => q.eq(q.field("class"), args.class))
			.collect();
	}
});

export const getSet = query({
	args: v.object({
		setName: v.string(),
		class: v.union(
			v.literal(Classes.dragonknight),
			v.literal(Classes.ranger),
			v.literal(Classes.spellweaver),
			v.literal(Classes.steamMechanicus)
		)
	}),
	handler: async (ctx, args) => {
		const set = await ctx.db
			.query("sets")
			.filter((q) => q.eq(q.field("name"), args.setName))
			.filter((q) => q.eq(q.field("class"), args.class))
			.first();
		return set
			? {
					class: set.class,
					name: set.name,
					items: set.items,
					setBonus: set.setBonus
				}
			: undefined;
	}
});
