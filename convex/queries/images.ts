import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";

export const getAllMissingItems = query({
	handler: async (ctx) => {
		const missingDwarfImages = await getMissingSteamMechanicusItems(ctx, {});
		const missingMageImages = await getMissingSpellweaverItems(ctx, {});
		const missingRangerImages = await getMissingRangerItems(ctx, {});
		const missingWarriorImages = await getMissingDragonknightItems(ctx, {});
		return [...missingDwarfImages, ...missingMageImages, ...missingRangerImages, ...missingWarriorImages];
	}
});

export const getMissingSteamMechanicusItems = query({
	handler: async (ctx) => {
		const missingDwarfImages = await ctx.db
			.query("dwarfImages")
			.filter((q) => q.eq(q.field("isMissing"), true))
			.collect();
		return missingDwarfImages;
	}
});

export const getMissingSpellweaverItems = query({
	handler: async (ctx) => {
		const missingMageImages = await ctx.db
			.query("mageImages")
			.filter((q) => q.eq(q.field("isMissing"), true))
			.collect();
		return missingMageImages;
	}
});

export const getMissingRangerItems = query({
	handler: async (ctx) => {
		const missingRangerImages = await ctx.db
			.query("rangerImages")
			.filter((q) => q.eq(q.field("isMissing"), true))
			.collect();
		return missingRangerImages;
	}
});

export const getMissingDragonknightItems = query({
	handler: async (ctx) => {
		const missingWarriorImages = await ctx.db
			.query("warriorImages")
			.filter((q) => q.eq(q.field("isMissing"), true))
			.collect();
		return missingWarriorImages;
	}
});

export const getTotalItems = query({
	handler: async (ctx) => {
		const allDwarfImages = await ctx.db.query("dwarfImages").collect();
		const allMageImages = await ctx.db.query("mageImages").collect();
		const allRangerImages = await ctx.db.query("rangerImages").collect();
		const allWarriorImages = await ctx.db.query("warriorImages").collect();
		return [...allDwarfImages, ...allMageImages, ...allRangerImages, ...allWarriorImages];
	}
});

export const getImage = internalQuery({
	args: {
		class: v.union(v.literal("dwarf"), v.literal("mage"), v.literal("ranger"), v.literal("warrior")),
		imageName: v.string()
	},
	handler: async (ctx, args) => {
		const image = await ctx.db
			.query(`${args.class}Images`)
			.filter((q) => q.eq(q.field("imageName"), args.imageName))
			.first();
		return image;
	}
});

// export const removeDuplicateImageNames = mutation({
// 	handler: async (ctx) => {
// 		const dwarfImages = await ctx.db.query("dwarfImages").collect();
// 		const duplicateDwarfImages = new Set();
// 		const uniqueDwarfImages = new Set();
// 		for (const image of dwarfImages) {
// 			if (uniqueDwarfImages.has(image.imageName)) {
// 				duplicateDwarfImages.add(image._id);
// 			} else {
// 				uniqueDwarfImages.add(image.imageName);
// 			}
// 		}
// 		for (const imageId of duplicateDwarfImages) {
// 			await ctx.db.delete(imageId as Id<"dwarfImages">);
// 		}
// 		const mageImages = await ctx.db.query("mageImages").collect();
// 		const duplicateMageImages = new Set();
// 		const uniqueMageImages = new Set();
// 		for (const image of mageImages) {
// 			if (uniqueMageImages.has(image.imageName)) {
// 				duplicateMageImages.add(image._id);
// 			} else {
// 				uniqueMageImages.add(image.imageName);
// 			}
// 		}
// 		for (const imageId of duplicateMageImages) {
// 			await ctx.db.delete(imageId as Id<"mageImages">);
// 		}
// 		const rangerImages = await ctx.db.query("rangerImages").collect();
// 		const duplicateRangerImages = new Set();
// 		const uniqueRangerImages = new Set();
// 		for (const image of rangerImages) {
// 			if (uniqueRangerImages.has(image.imageName)) {
// 				duplicateRangerImages.add(image._id);
// 			} else {
// 				uniqueRangerImages.add(image.imageName);
// 			}
// 		}
// 		for (const imageId of duplicateRangerImages) {
// 			await ctx.db.delete(imageId as Id<"rangerImages">);
// 		}
// 		const warriorImages = await ctx.db.query("warriorImages").collect();
// 		const duplicateWarriorImages = new Set();
// 		const uniqueWarriorImages = new Set();
// 		for (const image of warriorImages) {
// 			if (uniqueWarriorImages.has(image.imageName)) {
// 				duplicateWarriorImages.add(image._id);
// 			} else {
// 				uniqueWarriorImages.add(image.imageName);
// 			}
// 		}
// 		for (const imageId of duplicateWarriorImages) {
// 			await ctx.db.delete(imageId as Id<"warriorImages">);
// 		}
// 	}
// });
