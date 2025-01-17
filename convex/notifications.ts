import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export const get = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    
    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_id_created_at", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthorized");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== currentUserId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    messageId: v.id("messages"),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    // Create the notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      messageId: args.messageId,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      conversationId: args.conversationId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
}); 