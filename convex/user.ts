import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get existing user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    // If user exists, update if needed
    if (existingUser) {
      const updates: { name?: string; email?: string } = {};
      if (args.name && args.name !== existingUser.name) {
        updates.name = args.name;
      }
      if (args.email && args.email !== existingUser.email) {
        updates.email = args.email;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }
      return await ctx.db.get(existingUser._id);
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      tokenIdentifier: identity.tokenIdentifier,
    });

    return await ctx.db.get(userId);
  },
});

export const store = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    initialUser: v.optional(v.object({
      name: v.string()
    }))
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    
    console.log("=== STORE MUTATION START ===", {
      input: {
        identity,
        args,
        hasInitialUser: !!args.initialUser,
        timestamp: new Date().toISOString()
      }
    });

    if (!identity) {
      console.error("No authentication present", {
        timestamp: new Date().toISOString()
      });
      throw new Error("Called store without authentication present");
    }

    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    console.log("User lookup result:", {
      found: !!user,
      currentData: user,
      timestamp: new Date().toISOString()
    });

    if (user !== null) {
      // Update existing user
      const updates: any = {};
      
      // Only update if new values are provided and different from current
      if (args.name && args.name !== user.name) {
        updates.name = args.name;
      }
      if (args.email && args.email !== user.email) {
        updates.email = args.email;
      }
      // Handle initial user data if provided
      if (args.initialUser?.name && args.initialUser.name !== user.name) {
        updates.name = args.initialUser.name;
      }
      
      console.log("Computing updates for existing user:", {
        hasUpdates: Object.keys(updates).length > 0,
        updates,
        timestamp: new Date().toISOString()
      });

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
        console.log("User updated successfully", {
          userId: user._id,
          updates,
          timestamp: new Date().toISOString()
        });
      }
      return user._id;
    }

    // Create new user with validation
    // Priority: args.name > initialUser.name > identity.name > identity.givenName > identity.familyName
    const name = args.name || 
                 args.initialUser?.name || 
                 identity.name || 
                 identity.givenName || 
                 identity.familyName || 
                 "New User"; // Provide a default name
    const email = args.email || identity.email;

    console.log("Validating new user data:", {
      hasName: !!name,
      hasEmail: !!email,
      name,
      email,
      timestamp: new Date().toISOString()
    });

    if (!email) {
      console.error("Missing email for new user", {
        args,
        identity,
        timestamp: new Date().toISOString()
      });
      throw new Error("Email is required");
    }

    // Create user with name if available
    console.log("Creating new user:", {
      data: {
        tokenIdentifier: identity.tokenIdentifier,
        name,
        email
      },
      timestamp: new Date().toISOString()
    });

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name,
      email,
    });

    console.log("=== STORE MUTATION COMPLETE ===", {
      success: true,
      newUserId: userId,
      hasName: !!name,
      finalName: name,
      timestamp: new Date().toISOString()
    });

    return userId;
  },
});

export const setUserName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    console.log("=== SET USER NAME MUTATION START ===", {
      input: {
        userId,
        name: args.name,
        timestamp: new Date().toISOString()
      }
    });

    if (!userId) {
      console.error("No authenticated user found", {
        timestamp: new Date().toISOString()
      });
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    
    console.log("Current user state:", {
      exists: !!user,
      currentData: user,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.error("User not found in database", {
        userId,
        timestamp: new Date().toISOString()
      });
      throw new Error("User not found");
    }

    console.log("Updating user name:", {
      userId,
      oldName: user.name,
      newName: args.name,
      timestamp: new Date().toISOString()
    });

    await ctx.db.patch(userId, {
      name: args.name,
    });

    const updatedUser = await ctx.db.get(userId);
    
    console.log("=== SET USER NAME MUTATION COMPLETE ===", {
      success: true,
      finalState: {
        id: userId,
        name: updatedUser?.name,
        email: updatedUser?.email
      },
      timestamp: new Date().toISOString()
    });

    return updatedUser;
  },
});
