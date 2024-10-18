import { mutation } from "../_generated/server";
import { setSchema } from "../schema";

export const createSet = mutation({
	args: setSchema,
	handler: async (ctx, args) => {
		const newSetId = await ctx.db.insert("sets", args);
		return newSetId;
	}
});
