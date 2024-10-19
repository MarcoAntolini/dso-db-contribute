import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";

export const rateLimitExceededErrorMessage = "Rate limit exceeded. You cannot change your username too often.";
export const usernameAlreadyExistsErrorMessage = "Username already exists.";

export class RateLimitExceededError extends ConvexError<typeof rateLimitExceededErrorMessage> {}
export class UsernameAlreadyExistsError extends ConvexError<typeof usernameAlreadyExistsErrorMessage> {}

export const saveUsername = mutation({
	args: {
		username: v.string(),
		ipAddress: v.string()
	},
	handler: async (ctx, args) => {
		const oneHourAgo = new Date(new Date().getTime() - 3600000).toISOString();
		const recentChanges = await ctx.db
			.query("usernames")
			.filter((q) => q.and(q.eq(q.field("ipAddress"), args.ipAddress), q.gt(q.field("timestamp"), oneHourAgo)))
			.collect();
		if (recentChanges.length >= 2) {
			throw new RateLimitExceededError(rateLimitExceededErrorMessage);
		}
		const existingUsername = await ctx.db
			.query("usernames")
			.filter((q) => q.eq(q.field("username"), args.username))
			.collect();
		if (existingUsername.length > 0) {
			throw new UsernameAlreadyExistsError(usernameAlreadyExistsErrorMessage);
		}
		await ctx.db.insert("usernames", {
			username: args.username,
			ipAddress: args.ipAddress,
			timestamp: new Date().toISOString()
		});
	}
});
