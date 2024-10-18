import { v } from "convex/values";
import { Classes } from "dso-database";
import { query } from "../_generated/server";

export const getAllItems = query({
	handler: async (ctx) => {
		return await ctx.db.query("items").collect();
	}
});

export const getItemByName = query({
	args: {
		name: v.string(),
		class: v.union(
			v.literal(Classes.dragonknight),
			v.literal(Classes.ranger),
			v.literal(Classes.spellweaver),
			v.literal(Classes.steamMechanicus)
		)
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("items")
			.filter((q) => q.eq(q.field("class"), args.class))
			.filter((q) => q.eq(q.field("name"), args.name))
			.first();
	}
});
