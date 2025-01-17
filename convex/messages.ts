import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { api } from "./_generated/api";

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessage = messages.at(-1)!;
  const lastMessageMember = await populateMember(ctx, lastMessage?.memberId);

  if (!lastMessageMember) {
    return {
      count: messages.length,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timeStamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
};

// Utility function to detect mentions in message text
const detectMentions = async (
  ctx: QueryCtx,
  body: string,
  workspaceId: Id<"workspaces">
): Promise<Id<"users">[]> => {
  try {
    console.log("Original body:", body);
    const quillContent = JSON.parse(body);
    
    // Extract mentions from Quill ops
    const mentions: string[] = [];
    if (quillContent.ops) {
      const text = quillContent.ops.map((op: any) => op.insert).join('');
      console.log("Full text:", text);
      
      // Use regex to find @mentions followed by word characters and spaces until a special character or double space
      const mentionMatches = text.match(/@(\w+(?:\s+\w+)*?)(?=\s{2}|\n|[.,!?]|$)/g) || [];
      console.log("Mention matches:", mentionMatches);
      
      // Clean up the mentions (remove @ and trim)
      mentions.push(...mentionMatches.map((match: string) => match.slice(1).trim()));
    }
    
    console.log("Cleaned mentions:", mentions);
    
    if (mentions.length === 0) return [];

    // Find all users with matching names
    const users = await Promise.all(
      mentions.map(async (username) => {
        console.log("Searching for user with name:", username);
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("name"), username))
          .first();
        console.log("Found user:", user);
        return user;
      })
    );

    console.log("All found users:", users);

    // Filter out any undefined values and return unique user IDs
    const mentionUserIds = Array.from(new Set(users
      .filter((user): user is Doc<"users"> => user !== null && user !== undefined)
      .map(user => user._id)));
    console.log("Final mentionUserIds:", mentionUserIds);

    return mentionUserIds;
  } catch (e) {
    console.log("Error parsing message:", e);
    return [];
  }
};

export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      _conversationId = parentMessage.conversationId;
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,

      page: (
        await Promise.all(
          result.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!member || !user) {
              return null;
            }

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThread(ctx, message._id);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWithCounts = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length,
              };
            });

            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );

                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            const reactionsWithoutMemberId = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberId,
              threadCount: thread.count,
              threadImage: thread.image,
              threadTimestamp: thread.timeStamp,
              threadName: thread.name,
            };
          })
        )
      ).filter((message) => message !== null),
    };
  },
});

export const getById = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const message = await ctx.db.get(args.id);

    if (!message) return null;

    const currentMember = await getMember(ctx, message.workspaceId, userId);

    if (!currentMember) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);

    if (!member) return null;

    const user = await populateUser(ctx, member.userId);

    if (!user) return null;

    const reactions = await populateReactions(ctx, args.id);

    const reactionsWithCounts = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });

    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );

    const reactionsWithoutMemberId = dedupedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberId,
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    workspaceId: v.id("workspaces"),
    parentMessageId: v.optional(v.id("messages")),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    }

    // Debug logging
    console.log("Creating message with body:", args.body);
    
    // Detect mentions in the message body
    const mentionUserIds = await detectMentions(ctx, args.body, args.workspaceId);
    
    // Debug logging
    console.log("Detected mention user IDs:", mentionUserIds);

    // Create the message with mentions
    const messageId = await ctx.db.insert("messages", {
      body: args.body,
      channelId: args.channelId,
      conversationId: args.conversationId,
      memberId: member._id,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
      image: args.image,
      mentionUserIds: mentionUserIds.length > 0 ? mentionUserIds : undefined,
    });

    // Debug logging
    console.log("Created message with ID:", messageId);

    return messageId;
  },
});
