import { ConvexError, v } from "convex/values";
import { Classes } from "dso-database";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { getImage } from "../queries/images";
import { getItemByName } from "../queries/items";
import { getSetByName } from "../queries/sets";
import { itemSchema } from "../schema";
import { setImageNotMissing } from "./images";

export const createItem = mutation({
	args: { ...itemSchema, setName: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const item = await getItemByName(ctx, { name: args.name, class: args.class });
		if (item !== null) {
			throw new ConvexError("Item already exists");
		}
		const set = args.setName ? await getSetByName(ctx, { setName: args.setName, class: args.class }) : undefined;
		const newItemId = await ctx.db.insert("items", {
			...args,
			set: set || undefined,
			approved: false
		});
		const commonClassName =
			args.class === Classes.dragonknight
				? "warrior"
				: args.class === Classes.ranger
					? "ranger"
					: args.class === Classes.spellweaver
						? "mage"
						: "dwarf";
		const image = await getImage(ctx, {
			class: commonClassName,
			imageName: args.image
		});
		await setImageNotMissing(ctx, {
			imageId: image?._id as Id<"dwarfImages"> | Id<"mageImages"> | Id<"warriorImages"> | Id<"rangerImages">,
			class: commonClassName
		});
		return newItemId;
	}
});
