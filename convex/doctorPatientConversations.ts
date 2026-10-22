import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get conversation between doctor and patient
export const createOrGetConversation = mutation({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    doctorUserId: v.id("users"),
    patientUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("doctorPatientConversations")
      .withIndex("by_doctor_patient", (q) =>
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("doctorPatientConversations", {
      doctorId: args.doctorId,
      patientId: args.patientId,
      doctorUserId: args.doctorUserId,
      patientUserId: args.patientUserId,
      lastMessageAt: Date.now(),
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

// Get conversation between doctor and patient
export const getConversation = query({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("doctorPatientConversations")
      .withIndex("by_doctor_patient", (q) =>
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return conversation;
  },
});

// Get all conversations for a doctor
export const getDoctorConversations = query({
  args: {
    doctorId: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("doctorPatientConversations")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Get patient details for each conversation
    const conversationsWithPatients = await Promise.all(
      conversations.map(async (conversation) => {
        const patient = await ctx.db.get(conversation.patientId);
        return {
          ...conversation,
          patient,
        };
      })
    );

    return conversationsWithPatients;
  },
});

// Get all conversations for a patient
export const getPatientConversations = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("doctorPatientConversations")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Get doctor details for each conversation
    const conversationsWithDoctors = await Promise.all(
      conversations.map(async (conversation) => {
        const doctor = await ctx.db.get(conversation.doctorId);
        return {
          ...conversation,
          doctor,
        };
      })
    );

    return conversationsWithDoctors;
  },
});

// Send message in conversation
export const sendMessage = mutation({
  args: {
    conversationId: v.id("doctorPatientConversations"),
    senderId: v.id("users"),
    senderType: v.union(v.literal("doctor"), v.literal("patient")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("doctorPatientMessages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      senderType: args.senderType,
      content: args.content,
      isRead: false,
      createdAt: now,
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("doctorPatientConversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("doctorPatientMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return messages;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("doctorPatientConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get unread messages for this user
    const unreadMessages = await ctx.db
      .query("doctorPatientMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isRead"), false),
          q.neq(q.field("senderId"), args.userId)
        )
      )
      .collect();

    // Mark them as read
    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        isRead: true,
        readAt: now,
      });
    }

    return unreadMessages.length;
  },
});

// Get unread message count for a conversation
export const getUnreadCount = query({
  args: {
    conversationId: v.id("doctorPatientConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("doctorPatientMessages")
      .withIndex("by_unread", (q) =>
        q.eq("conversationId", args.conversationId).eq("isRead", false)
      )
      .filter((q) => q.neq(q.field("senderId"), args.userId))
      .collect();

    return unreadMessages.length;
  },
});
