import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create test user
    const userId = await ctx.db.insert("users", {
      name: "Test User",
      email: "test@example.com",
      image: "",
      tokenIdentifier: `github:${"test@example.com"}`,
      orgIds: [],
    });

    // Create test workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: "Test Workspace",
      userId,
      joinCode: "test123",
    });

    // Add user as admin
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    // Create general channel
    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    });

    // Create auth session
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: "test@example.com",
      secret: "password123", // This will be hashed by Convex
    });

    return {
      userId,
      workspaceId,
      email: "test@example.com",
      password: "password123"
    };
  },
}); 