import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create or update user
    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
    });

    return userId;
  },
});
