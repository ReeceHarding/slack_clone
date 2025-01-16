import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logToFile = mutation({
  args: {
    message: v.string(),
    level: v.string(),
    source: v.string(),
  },
  async handler(ctx, args) {
    console.log(`[${new Date().toISOString()}] [${args.level}] [${args.source}] ${args.message}`);
  },
}); 