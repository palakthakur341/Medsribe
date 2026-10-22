import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Add a message to a chat session
export const addMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("assistant")),
    contextUsed: v.optional(v.boolean()),
    relevantDocuments: v.optional(v.array(v.object({
      id: v.string(),
      event_type: v.string(),
      content_preview: v.string(),
      similarity_score: v.number(),
      created_at: v.string(),
      metadata: v.any(),
    }))),
    relevantDocumentsCount: v.optional(v.number()),
    processingTime: v.optional(v.number()),
    // Enhanced RAG fields
    ragResponseData: v.optional(v.object({
      role_type: v.optional(v.string()),
      role_id: v.optional(v.string()),
      query: v.optional(v.string()),
      response: v.optional(v.string()),
      similarity_threshold: v.optional(v.number()),
      max_results: v.optional(v.number()),
      generated_at: v.optional(v.string()),
    })),
    structuredResponse: v.optional(v.object({
      type: v.string(),
      summary: v.string(),
      data: v.any(),
      timestamp: v.string(),
    })),
    enhancedRelevantDocuments: v.optional(v.array(v.object({
      id: v.string(),
      role_type: v.string(),
      role_id: v.string(),
      event_type: v.string(),
      content: v.string(),
      content_chunk: v.optional(v.string()),
      metadata: v.any(),
      created_at: v.string(),
      similarity_score: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      userId: args.userId,
      content: args.content,
      sender: args.sender,
      contextUsed: args.contextUsed,
      relevantDocuments: args.relevantDocuments,
      relevantDocumentsCount: args.relevantDocumentsCount,
      processingTime: args.processingTime,
      // Enhanced RAG fields
      ragResponseData: args.ragResponseData,
      structuredResponse: args.structuredResponse,
      enhancedRelevantDocuments: args.enhancedRelevantDocuments,
      createdAt: Date.now(),
    });

    // Update session metadata
    const session = await ctx.db.get(args.sessionId);
    if (session) {
      await ctx.db.patch(args.sessionId, {
        messageCount: session.messageCount + 1,
        lastMessageAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return messageId;
  },
});

// Get all messages for a chat session
export const getSessionMessages = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_created", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();

    return messages;
  },
});

// Get recent messages for a session
export const getRecentMessages = query({
  args: {
    sessionId: v.id("chatSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_created", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);

    return messages.reverse(); // Return in chronological order
  },
});

// Delete a specific message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.delete(args.messageId);

    // Update session message count
    const session = await ctx.db.get(message.sessionId);
    if (session && session.messageCount > 0) {
      await ctx.db.patch(message.sessionId, {
        messageCount: session.messageCount - 1,
        updatedAt: Date.now(),
      });
    }

    return args.messageId;
  },
});

// Get message statistics for a session
export const getSessionStats = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const userMessages = messages.filter(m => m.sender === "user").length;
    const assistantMessages = messages.filter(m => m.sender === "assistant").length;
    const messagesWithContext = messages.filter(m => m.contextUsed).length;

    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      messagesWithContext,
      averageProcessingTime: messages
        .filter(m => m.processingTime)
        .reduce((acc, m) => acc + (m.processingTime || 0), 0) / 
        messages.filter(m => m.processingTime).length || 0,
    };
  },
});
