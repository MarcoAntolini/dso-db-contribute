import { v } from "convex/values";

import { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";

export const setImageNotMissing = internalMutation({
	args: {
		imageId: v.string(),
		class: v.union(v.literal("dwarf"), v.literal("mage"), v.literal("ranger"), v.literal("warrior"))
	},
	handler: async (ctx, args) => {
		switch (args.class) {
			case "dwarf":
				await setDwarfImageNotMissing(ctx, {
					imageId: args.imageId as Id<"dwarfImages">
				});
				break;
			case "mage":
				await setMageImageNotMissing(ctx, {
					imageId: args.imageId as Id<"mageImages">
				});
				break;
			case "ranger":
				await setRangerImageNotMissing(ctx, {
					imageId: args.imageId as Id<"rangerImages">
				});
				break;
			case "warrior":
				await setWarriorImageNotMissing(ctx, {
					imageId: args.imageId as Id<"warriorImages">
				});
				break;
			default:
				throw new Error("Invalid class");
		}
	}
});

export const setDwarfImageNotMissing = internalMutation({
	args: {
		imageId: v.id("dwarfImages")
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.imageId, {
			isMissing: false
		});
	}
});

export const setMageImageNotMissing = internalMutation({
	args: {
		imageId: v.id("mageImages")
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.imageId, {
			isMissing: false
		});
	}
});

export const setRangerImageNotMissing = internalMutation({
	args: {
		imageId: v.id("rangerImages")
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.imageId, {
			isMissing: false
		});
	}
});

export const setWarriorImageNotMissing = internalMutation({
	args: {
		imageId: v.id("warriorImages")
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.imageId, {
			isMissing: false
		});
	}
});
