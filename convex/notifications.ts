import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Notification types for different events
export const NOTIFICATION_TYPES = {
  // Clinical notifications
  SOAP_NOTE_SHARED: "soap_note_shared",
  SOAP_NOTE_RECEIVED: "soap_note_received",
  REFERRAL_RECEIVED: "referral_received",
  REFERRAL_ACCEPTED: "referral_accepted",
  REFERRAL_DECLINED: "referral_declined",
  CARE_EPISODE_CREATED: "care_episode_created",
  CARE_EPISODE_UPDATED: "care_episode_updated",

  // Administrative notifications
  APPOINTMENT_SCHEDULED: "appointment_scheduled",
  APPOINTMENT_CONFIRMED: "appointment_confirmed",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_RESCHEDULED: "appointment_rescheduled",
  APPOINTMENT_REMINDER: "appointment_reminder",

  // System notifications
  PROFILE_INCOMPLETE: "profile_incomplete",
  VERIFICATION_REQUIRED: "verification_required",
  SYSTEM_MAINTENANCE: "system_maintenance",

  // Alert notifications
  URGENT_REFERRAL: "urgent_referral",
  CRITICAL_RESULT: "critical_result",
  EMERGENCY_CONTACT: "emergency_contact",
} as const;

// Get notifications for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.userId))
      .order("desc")
      .collect();

    // Get related data
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        let relatedData: any = {};

        if (notification.relatedRecords) {
          const { relatedRecords } = notification;

          if (relatedRecords.patientId) {
            relatedData.patient = await ctx.db.get(relatedRecords.patientId);
          }
          if (relatedRecords.doctorId) {
            relatedData.doctor = await ctx.db.get(relatedRecords.doctorId);
          }
          if (relatedRecords.appointmentId) {
            relatedData.appointment = await ctx.db.get(relatedRecords.appointmentId);
          }
          if (relatedRecords.referralId) {
            relatedData.referral = await ctx.db.get(relatedRecords.referralId);
          }
          if (relatedRecords.soapNoteId) {
            relatedData.soapNote = await ctx.db.get(relatedRecords.soapNoteId);
          }
          // Note: careEpisodes table not yet implemented
          // if (relatedRecords.careEpisodeId) {
          //   relatedData.careEpisode = await ctx.db.get(relatedRecords.careEpisodeId);
          // }
        }

        return {
          ...notification,
          ...relatedData,
        };
      })
    );

    return notificationsWithDetails;
  },
});

// Get unread notifications count
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_unread", (q) => q.eq("recipientId", args.userId).eq("isRead", false))
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: now,
    });
    return args.notificationId;
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_unread", (q) => q.eq("recipientId", args.userId).eq("isRead", false))
      .collect();

    const now = Date.now();
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: now
        })
      )
    );

    return unreadNotifications.length;
  },
});

// Create a comprehensive notification
export const createNotification = mutation({
  args: {
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("doctor"), v.literal("patient")),
    category: v.union(
      v.literal("clinical"),
      v.literal("administrative"),
      v.literal("system"),
      v.literal("alert"),
      v.literal("reminder")
    ),
    type: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    relatedRecords: v.optional(v.object({
      patientId: v.optional(v.id("patients")),
      doctorId: v.optional(v.id("doctors")),
      appointmentId: v.optional(v.id("appointments")),
      referralId: v.optional(v.id("referrals")),
      soapNoteId: v.optional(v.id("soapNotes")),
      careEpisodeId: v.optional(v.id("careEpisodes"))
    })),
    channels: v.optional(v.array(v.union(v.literal("in_app"), v.literal("email"), v.literal("sms"), v.literal("push")))),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      category: args.category,
      type: args.type,
      priority: args.priority,
      title: args.title,
      message: args.message,
      actionUrl: args.actionUrl,
      relatedRecords: args.relatedRecords,
      channels: args.channels || ["in_app"],
      isRead: false,
      createdAt: now,
      expiresAt: args.expiresAt,
    });

    return notificationId;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

// Create a test notification for debugging
export const createTestNotification = mutation({
  args: {
    userId: v.id("users"),
    userRole: v.union(v.literal("doctor"), v.literal("patient"))
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      recipientId: args.userId,
      recipientType: args.userRole,
      category: "system",
      type: "test_notification",
      priority: "medium",
      title: "Test Notification",
      message: "This is a test notification to verify the notification system is working correctly.",
      actionUrl: args.userRole === "patient" ? "/patient/notifications" : "/doctor/notifications",
      channels: ["in_app"],
      isRead: false,
      createdAt: now,
    });

    return notificationId;
  },
});

// Get notifications by category
export const getByCategory = query({
  args: {
    userId: v.id("users"),
    category: v.union(
      v.literal("clinical"),
      v.literal("administrative"),
      v.literal("system"),
      v.literal("alert"),
      v.literal("reminder")
    ),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Get notifications by priority
export const getByPriority = query({
  args: {
    userId: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Get notifications by type
export const getByType = query({
  args: {
    userId: v.id("users"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Helper functions for creating specific notification types

// SOAP Note Notifications
export const notifySOAPShared = mutation({
  args: {
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("doctor"), v.literal("patient")),
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    fromDoctorId: v.id("doctors"),
    patientName: v.string(),
    doctorName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      category: "clinical",
      type: NOTIFICATION_TYPES.SOAP_NOTE_SHARED,
      priority: "medium",
      title: "SOAP Note Shared",
      message: `Dr. ${args.doctorName} shared a SOAP note for ${args.patientName}`,
      actionUrl: args.recipientType === "doctor" ? `/doctor/shared-soap` : `/patient/soap-notes`,
      relatedRecords: {
        soapNoteId: args.soapNoteId,
        patientId: args.patientId,
        doctorId: args.fromDoctorId,
      },
      channels: ["in_app", "email"],
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Referral Notifications
export const notifyReferralReceived = mutation({
  args: {
    recipientId: v.id("users"),
    referralId: v.id("referrals"),
    patientId: v.id("patients"),
    fromDoctorId: v.id("doctors"),
    toDoctorId: v.optional(v.id("doctors")),
    patientName: v.string(),
    fromDoctorName: v.string(),
    specialtyRequired: v.string(),
    isUrgent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const priority = args.isUrgent ? "urgent" : "high";
    const title = args.isUrgent ? "Urgent Referral Received" : "New Referral Received";

    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: "doctor",
      category: "clinical",
      type: args.isUrgent ? NOTIFICATION_TYPES.URGENT_REFERRAL : NOTIFICATION_TYPES.REFERRAL_RECEIVED,
      priority,
      title,
      message: `Dr. ${args.fromDoctorName} referred ${args.patientName} for ${args.specialtyRequired} consultation`,
      actionUrl: `/doctor/referrals`,
      relatedRecords: {
        referralId: args.referralId,
        patientId: args.patientId,
        doctorId: args.fromDoctorId,
      },
      channels: args.isUrgent ? ["in_app", "email", "sms"] : ["in_app", "email"],
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Appointment Notifications
export const notifyAppointmentScheduled = mutation({
  args: {
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("doctor"), v.literal("patient")),
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    patientName: v.optional(v.string()),
    doctorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isForPatient = args.recipientType === "patient";
    const title = "Appointment Scheduled";
    const message = isForPatient
      ? `Your appointment with Dr. ${args.doctorName} is scheduled for ${args.appointmentDate} at ${args.appointmentTime}`
      : `Appointment scheduled with ${args.patientName} on ${args.appointmentDate} at ${args.appointmentTime}`;

    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      category: "administrative",
      type: NOTIFICATION_TYPES.APPOINTMENT_SCHEDULED,
      priority: "medium",
      title,
      message,
      actionUrl: isForPatient ? `/patient/appointments` : `/doctor/appointments`,
      relatedRecords: {
        appointmentId: args.appointmentId,
        patientId: args.patientId,
        doctorId: args.doctorId,
      },
      channels: ["in_app", "email"],
      isRead: false,
      createdAt: Date.now(),
    });
  },
});


