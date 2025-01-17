"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Pinecone } from "@pinecone-database/pinecone";

// Use node: directive to run in Node.js environment
export const insertMessageToPinecone = action({
  args: {
    messageId: v.id("messages"),
    messageBody: v.string(),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
    username: v.string(),
    creationTime: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Starting insertMessageToPinecone action...");
      
      // Dynamic imports inside the handler to work with Node.js environment
      console.log("Importing dependencies...");
      const { OpenAI } = await import("openai");
      console.log("Dependencies imported successfully");

      // Initialize OpenAI client
      console.log("Initializing OpenAI client...");
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY ?? "",
      });
      console.log("OpenAI client initialized");

      // Log all Pinecone configuration
      console.log("Pinecone Configuration:");
      console.log("API Key length:", process.env.PINECONE_API_KEY?.length ?? 0);
      console.log("API Key format valid:", process.env.PINECONE_API_KEY?.startsWith("pcsk_") ?? false);
      console.log("Environment:", process.env.PINECONE_ENVIRONMENT);
      console.log("Host:", process.env.PINECONE_HOST);
      console.log("Index:", process.env.PINECONE_INDEX);

      // Initialize Pinecone client
      console.log("Initializing Pinecone client...");
      if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY is not set");
      }
      if (!process.env.PINECONE_INDEX) {
        throw new Error("PINECONE_INDEX is not set");
      }

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });
      console.log("Pinecone client initialized");

      // Test Pinecone connection with more detailed error handling
      try {
        console.log("Testing Pinecone connection...");
        const indexName = process.env.PINECONE_INDEX;
        const index = pinecone.index(indexName);
        
        // Add more detailed error logging
        console.log("Index object created, attempting to describe index...");
        console.log("Index configuration:", {
          name: indexName,
          apiKeyValid: true
        });
        
        const description = await pinecone.describeIndex(indexName);
        console.log("Connection test successful. Index description:", JSON.stringify(description, null, 2));

        // Get embeddings from OpenAI
        console.log("Getting embeddings from OpenAI...");
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-large",  // This model outputs 3072 dimensions
          input: args.messageBody,
        });
        console.log("Got embeddings from OpenAI");

        const embedding = embeddingResponse.data[0].embedding;

        // Parse the rich text JSON to extract plain text
        let plainText = args.messageBody;
        try {
          const richText = JSON.parse(args.messageBody);
          plainText = richText.ops?.map((op: any) => op.insert).join('') || args.messageBody;
        } catch (e) {
          // If parsing fails, use the original text
          console.log("Failed to parse rich text, using original:", e);
        }

        // Convert IDs to strings for Pinecone metadata
        const metadata = {
          text: plainText,
          channelId: args.channelId?.toString() || "",
          conversationId: args.conversationId?.toString() || "",
          workspaceId: args.workspaceId.toString(),
          memberId: args.memberId.toString(),
          username: args.username,
          creationTime: args.creationTime,
        };

        // Upsert the vector to Pinecone
        console.log("Upserting vector to Pinecone...");
        console.log("Vector details:", {
          id: args.messageId,
          dimensions: embedding.length,
          metadata
        });
        
        await index.upsert([{
          id: args.messageId.toString(),
          values: embedding,
          metadata
        }]);
        console.log("Vector upserted successfully");

        return { success: true };
      } catch (e) {
        const error = e as Error & {
          cause?: Error & {
            cause?: Error;
          };
        };
        console.error("Pinecone operation failed with error type:", error.constructor.name);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if (error.cause) {
          console.error("Cause:", error.cause);
          if (error.cause.cause) {
            console.error("Root cause:", error.cause.cause);
          }
        }
        throw error;
      }
    } catch (error) {
      // Log detailed error information
      console.error("Error in insertMessageToPinecone:");
      console.error("Error message:", (error as Error).message);
      console.error("Error stack:", (error as Error).stack);
      console.error("Error details:", error);
      
      // Check environment variables
      console.log("Environment variables check:");
      console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
      console.log("PINECONE_API_KEY exists:", !!process.env.PINECONE_API_KEY);
      console.log("PINECONE_INDEX exists:", !!process.env.PINECONE_INDEX);
      console.log("PINECONE_ENVIRONMENT exists:", !!process.env.PINECONE_ENVIRONMENT);
      
      return { 
        success: false, 
        error: (error as Error).message,
        stack: (error as Error).stack,
      };
    }
  },
}); 