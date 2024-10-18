import { v } from "convex/values";
import { dwarfImages, mageImages, rangerImages, warriorImages } from "dso-database";
import { mutation, query } from "./_generated/server";

const populateImageTable = mutation({
	args: {
		tableName: v.union(
			v.literal("dwarfImages"),
			v.literal("mageImages"),
			v.literal("warriorImages"),
			v.literal("rangerImages")
		),
		images: v.array(v.string())
	},
	handler: async (ctx, args) => {
		const { tableName, images } = args;
		for (const imageName of images) {
			await ctx.db.insert(tableName, {
				imageName,
				isMissing: true
			});
		}
	}
});

export const populateAllImageTables = mutation({
	handler: async (ctx) => {
		await populateImageTable(ctx, { tableName: "dwarfImages", images: [...dwarfImages] });
		await populateImageTable(ctx, { tableName: "mageImages", images: [...mageImages] });
		await populateImageTable(ctx, { tableName: "warriorImages", images: [...warriorImages] });
		await populateImageTable(ctx, { tableName: "rangerImages", images: [...rangerImages] });
	}
});

export const checkForPopulatedImageTables = query({
	handler: async (ctx) => {
		const dwarfImages = await ctx.db.query("dwarfImages").collect();
		const mageImages = await ctx.db.query("mageImages").collect();
		const warriorImages = await ctx.db.query("warriorImages").collect();
		const rangerImages = await ctx.db.query("rangerImages").collect();
		return { dwarfImages, mageImages, warriorImages, rangerImages };
	}
});
