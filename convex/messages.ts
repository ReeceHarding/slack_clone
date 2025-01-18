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
    
    // Extract mentions from Quill ops that have mention attributes
    const mentions: string[] = [];
    if (quillContent.ops) {
      quillContent.ops.forEach((op: any) => {
        if (op.attributes?.mention) {
          mentions.push(op.attributes.mention.trim());
        }
      });
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

// Function to check if text contains a question
const containsQuestion = (text: string): boolean => {
  // Parse the Quill content
  try {
    const quillContent = JSON.parse(text);
    const fullText = quillContent.ops.map((op: any) => op.insert).join('');
    
    // Check for question marks or question words
    return fullText.includes('?') || 
           /\b(what|who|when|where|why|how|can|could|would|will|should)\b/i.test(fullText);
  } catch (e) {
    console.log("Error parsing message for question detection:", e);
    return false;
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

// Internal version of getById that doesn't require auth - for system operations
export const getByIdInternal = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) return null;
    return message;
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
    isSystemMessage: v.optional(v.boolean()),
    memberId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    // If it's a system message (like AI response), skip auth check and use provided memberId
    if (args.isSystemMessage && args.memberId) {
      // Debug logging
      console.log("Creating system message with body:", args.body);
      
      // Parse the message body to get plain text for better logging
      let plainTextBody = args.body;
      try {
        const content = JSON.parse(args.body);
        plainTextBody = content.ops?.map((op: any) => op.insert).join('') || args.body;
        console.log("Parsed plain text body:", plainTextBody);
      } catch (e) {
        console.log("Failed to parse message body as JSON, using as is");
      }

      // Create the message with the provided memberId
      const messageId = await ctx.db.insert("messages", {
        body: args.body,
        channelId: args.channelId,
        conversationId: args.conversationId,
        memberId: args.memberId,
        workspaceId: args.workspaceId,
        parentMessageId: args.parentMessageId,
        image: args.image,
      });

      return messageId;
    }

    // Regular user message flow
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
    
    // Parse the message body to get plain text for better logging
    let plainTextBody = args.body;
    try {
      const content = JSON.parse(args.body);
      plainTextBody = content.ops?.map((op: any) => op.insert).join('') || args.body;
      console.log("Parsed plain text body:", plainTextBody);
    } catch (e) {
      console.log("Failed to parse message body as JSON, using as is");
    }
    
    // Detect mentions in the message body
    console.log("Starting mention detection...");
    const mentionUserIds = await detectMentions(ctx, args.body, args.workspaceId);
    
    // Debug logging
    console.log("Detected mention user IDs:", mentionUserIds);

    // Get user details for better logging
    const allFoundUsers = await Promise.all(
      mentionUserIds.map(id => ctx.db.get(id))
    );
    console.log("All found users:", allFoundUsers);

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

    // Create notifications for mentioned users
    if (mentionUserIds.length > 0) {
      console.log("Creating notifications for mentioned users");
      
      // Skip notification if user mentions themselves
      const mentionedUsersExceptSelf = mentionUserIds.filter(mentionedUserId => mentionedUserId !== userId);
      console.log("Mentioned users except self:", mentionedUsersExceptSelf);
      
      for (const mentionedUserId of mentionedUsersExceptSelf) {
        // Get user details for logging
        const mentionedUser = await ctx.db.get(mentionedUserId);
        console.log("Processing notification for user:", mentionedUser);

        // Create notification
        const notificationId = await ctx.db.insert("notifications", {
          userId: mentionedUserId,
          messageId,
          workspaceId: args.workspaceId,
          channelId: args.channelId,
          conversationId: args.conversationId,
          isRead: false,
          createdAt: Date.now(),
        });
        console.log("Created notification with ID:", notificationId);

        // Check if message contains a question before generating AI response
        const hasQuestion = containsQuestion(args.body);
        console.log("Message question check:", { hasQuestion, plainTextBody });
        
        if (hasQuestion) {
          console.log("Message contains question, generating AI response for user:", mentionedUser?.name);
          // Generate AI response if enabled
          await ctx.scheduler.runAfter(0, api.ai.generateAIResponse, {
            messageId,
            mentionedUserId,
            workspaceId: args.workspaceId,
            originalMessage: args.body,
          });
        } else {
          console.log("Message does not contain a question, skipping AI response for user:", mentionedUser?.name);
        }
      }
    }

    // Debug logging
    console.log("Created message with ID:", messageId);

    // Send message to Pinecone for vector search
    await ctx.scheduler.runAfter(0, api.embeddings.insertMessageToPinecone, {
      messageId,
      messageBody: args.body,
      channelId: args.channelId,
      conversationId: args.conversationId,
      workspaceId: args.workspaceId,
      memberId: member._id,
      username: (await ctx.db.get(userId))?.name || "Unknown User",
      creationTime: Date.now(),
      formattedCreationTime: new Date().toISOString(),
    });

    return messageId;
  }
});
