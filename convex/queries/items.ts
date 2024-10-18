import { query } from "../_generated/server";

export const getAllItems = query({
	handler: async (ctx) => {
		return await ctx.db.query("items").collect();
	}
});
