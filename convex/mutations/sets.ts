import { ConvexError } from "convex/values";
import { mutation } from "../_generated/server";
import { getSetByName } from "../queries/sets";
import { setSchema } from "../schema";

export const createSet = mutation({
	args: setSchema,
	handler: async (ctx, args) => {
		const set = await getSetByName(ctx, { setName: args.name, class: args.class });
		if (set) {
			throw new ConvexError("Set already exists");
		}
		const newSetId = await ctx.db.insert("sets", { ...args, approved: false });
		return newSetId;
	}
});
