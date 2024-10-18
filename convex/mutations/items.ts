import { ConvexError, v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { getImage } from "../queries/images";
import { getItemByName } from "../queries/items";
import { itemSchema } from "../schema";
import { setImageNotMissing } from "./images";

export const createItem = mutation({
	args: { ...itemSchema, setName: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const item = await getItemByName(ctx, { name: args.name, class: args.class });
		if (item !== null) {
			throw new ConvexError("Item already exists");
		}
		const set = await ctx.db
			.query("sets")
			.filter((q) => q.eq(q.field("name"), args.setName))
			.first();
		const newItemId = await ctx.db.insert("items", { ...args, set: set || undefined, approved: false });
		const commonClassName =
			args.class === "Dragonknight"
				? "warrior"
				: args.class === "Ranger"
					? "ranger"
					: args.class === "Spellweaver"
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
