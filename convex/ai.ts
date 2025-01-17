import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import OpenAI from "openai";
import { DatabaseReader, DatabaseWriter } from "./_generated/server";

// Function to get user's last messages
export const getUserLastMessages = query({
  args: {
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .unique();

    if (!member) {
      throw new Error("Member not found");
    }

    // Get last 10 messages (or specified limit) from this user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(args.limit ?? 10);

    return messages;
  },
});

// Function to generate AI response
export const generateAIResponse = action({
  args: {
    messageId: v.id("messages"),
    mentionedUserId: v.id("users"),
    workspaceId: v.id("workspaces"),
    originalMessage: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"messages"> | null> => {
    console.log("Starting AI response generation for message:", args.messageId);
    console.log("Mentioned user ID:", args.mentionedUserId);
    console.log("Workspace ID:", args.workspaceId);

    // Get all members in the workspace
    console.log("Fetching workspace members...");
    const members = await ctx.runQuery(internal.members.getForAI, { workspaceId: args.workspaceId });
    console.log("Found workspace members count:", members.length);
    
    const mentionedMember = members.find(member => member.user._id === args.mentionedUserId);
    console.log("Found mentioned member:", mentionedMember ? {
      memberId: mentionedMember._id,
      userId: mentionedMember.user._id,
      name: mentionedMember.user.name,
      aiEnabled: mentionedMember.user.aiEnabled
    } : null);
    
    if (!mentionedMember) {
      console.log("AI response skipped - mentioned user not found in workspace");
      return null;
    }

    // Check if AI is explicitly enabled for this user
    console.log("Checking AI enabled status for user:", mentionedMember.user.name);
    if (mentionedMember.user.aiEnabled !== true) {
      console.log("AI response skipped - AI not enabled for user:", mentionedMember.user.name);
      return null;
    }

    // Then get the last messages
    console.log("Fetching last messages for user:", mentionedMember.user.name);
    const lastMessages: Doc<"messages">[] = await ctx.runQuery(api.ai.getUserLastMessages, {
      userId: args.mentionedUserId,
      workspaceId: args.workspaceId,
      limit: 10,
    });

    console.log("Retrieved last messages count:", lastMessages.length);

    // Initialize OpenAI
    console.log("Initializing OpenAI client...");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI client initialized");

    // Prepare the context from last messages
    console.log("Preparing message context...");
    const messageContext: string = lastMessages
      .map((msg: Doc<"messages">) => {
        try {
          const content = JSON.parse(msg.body);
          const text = content.ops?.map((op: any) => op.insert).join('') || '';
          return `${mentionedMember.user.name}: ${text}`;
        } catch (e) {
          console.log("Failed to parse message body:", e);
          return `${mentionedMember.user.name}: ${msg.body}`;
        }
      })
      .join("\n");

    console.log("Prepared message context length:", messageContext.length);
    console.log("Message context sample (first 200 chars):", messageContext.substring(0, 200));

    try {
      // Parse the original message
      console.log("Parsing original message...");
      let questionText: string;
      try {
        const content = JSON.parse(args.originalMessage);
        questionText = content.ops?.map((op: any) => op.insert).join('') || '';
        console.log("Parsed question text:", questionText);
      } catch (e) {
        console.log("Failed to parse original message, using as is");
        questionText = args.originalMessage;
      }

      // Generate response using GPT
      console.log("Calling OpenAI API...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are ${mentionedMember.user.name}. Based on their message history below, respond to the question/mention in their style. Keep the response concise and natural.

Previous messages:
${messageContext}`,
          },
          {
            role: "user",
            content: questionText,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      console.log("Received OpenAI response");
      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        console.log("AI response skipped - no content generated");
        return null;
      }
      console.log("Generated AI response:", aiResponse);

      // Get the original message to get channel/conversation context
      console.log("Fetching original message context...");
      const originalMessage = await ctx.runQuery(api.messages.getByIdInternal, { id: args.messageId });
      if (!originalMessage) {
        console.log("AI response skipped - original message not found");
        return null;
      }

      const channelId = originalMessage.channelId ?? undefined;
      const conversationId = originalMessage.conversationId ?? undefined;
      console.log("Message context:", { channelId, conversationId });

      console.log("Creating AI response message...");
      // Create the AI response message using the messages.create mutation with system flag
      const messageId = await ctx.runMutation(api.messages.create, {
        body: JSON.stringify({
          ops: [{ insert: `[AI Response] ${aiResponse}\n` }]
        }),
        workspaceId: args.workspaceId,
        channelId,
        conversationId,
        isSystemMessage: true,
        memberId: mentionedMember._id, // Use the mentioned member's ID
      });

      console.log("AI response message created:", messageId);
      return messageId;
    } catch (error) {
      console.error("Error generating AI response:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
        cause: (error as Error).cause
      });
      return null;
    }
  }
}); 