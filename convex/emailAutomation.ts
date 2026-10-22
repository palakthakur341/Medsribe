import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateEmailContent, sendEmail } from "./emailService";

// Create email automation entry
export const scheduleEmail = mutation({
  args: {
    userId: v.id("users"),
    emailType: v.union(
      v.literal("welcome"),
      v.literal("profile_completion_reminder"),
      v.literal("appointment_reminder_24h"),
      v.literal("appointment_reminder_1h"),
      v.literal("appointment_followup"),
      v.literal("treatment_reminder"),

      v.literal("inactive_user_reengagement"),
      v.literal("security_alert"),
      v.literal("system_maintenance")
    ),
    scheduledFor: v.number(),
    relatedRecordId: v.optional(v.string()),
    relatedRecordType: v.optional(v.string()),
    emailData: v.object({
      to: v.string(),
      subject: v.string(),
      templateData: v.any(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user has email preferences
    const preferences = await ctx.db
      .query("emailPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    // Check if this email type is enabled for the user
    if (preferences) {
      const isEnabled = getEmailTypePreference(preferences, args.emailType);
      if (!isEnabled) {
        console.log(`Email type ${args.emailType} is disabled for user ${args.userId}`);
        return null;
      }
    }

    // Schedule email for delivery

    const emailId = await ctx.db.insert("emailAutomation", {
      userId: args.userId,
      emailType: args.emailType,
      status: "scheduled",
      scheduledFor: args.scheduledFor,
      relatedRecordId: args.relatedRecordId,
      relatedRecordType: args.relatedRecordType,
      emailData: args.emailData,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Schedule the email to be sent
    await ctx.scheduler.runAt(args.scheduledFor, api.emailAutomation.sendScheduledEmail, {
      emailId,
    });

    return emailId;
  },
});

// Helper function to check email preferences
function getEmailTypePreference(preferences: any, emailType: string): boolean {
  switch (emailType) {
    case "welcome":
      return preferences.welcomeEmails;
    case "profile_completion_reminder":
      return preferences.profileReminders;
    case "appointment_reminder_24h":
    case "appointment_reminder_1h":
      return preferences.appointmentReminders;
    case "appointment_followup":
      return preferences.appointmentConfirmations;
    case "treatment_reminder":
      return preferences.treatmentReminders;
    case "medication_reminder":
      return preferences.medicationReminders;
    case "security_alert":
      return preferences.securityAlerts;
    case "system_maintenance":
      return preferences.systemNotifications;
    case "inactive_user_reengagement":
      return preferences.reengagementEmails;
    default:
      return true; // Default to enabled for unknown types
  }
}

// Send scheduled email
export const sendScheduledEmail = action({
  args: {
    emailId: v.id("emailAutomation"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(api.emailAutomation.getEmailById, {
      emailId: args.emailId,
    });

    if (!email || email.status !== "scheduled") {
      console.log(`Email ${args.emailId} not found or not scheduled`);
      return;
    }

    try {
      // Generate email content using our email service
      const emailOptions = generateEmailContent(
        email.emailType,
        {
          email: email.emailData.to,
          ...email.emailData.templateData
        }
      );

      // Send email directly via Gmail API
      const success = await sendEmail(emailOptions);

      if (success) {
        // Mark email as sent
        await ctx.runMutation(api.emailAutomation.markEmailAsSent, {
          emailId: args.emailId,
        });
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      await ctx.runMutation(api.emailAutomation.markEmailAsFailed, {
        emailId: args.emailId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// Get email by ID
export const getEmailById = query({
  args: { emailId: v.id("emailAutomation") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.emailId);
  },
});

// Mark email as sent
export const markEmailAsSent = mutation({
  args: { emailId: v.id("emailAutomation") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.emailId, {
      status: "sent",
      sentAt: now,
      updatedAt: now,
    });
  },
});

// Mark email as failed
export const markEmailAsFailed = mutation({
  args: {
    emailId: v.id("emailAutomation"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = await ctx.db.get(args.emailId);
    
    if (!email) return;

    const newRetryCount = email.retryCount + 1;
    const maxRetries = 3;

    if (newRetryCount < maxRetries) {
      // Schedule retry (exponential backoff: 5min, 30min, 2hours)
      const retryDelays = [5 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000];
      const retryDelay = retryDelays[newRetryCount - 1] || retryDelays[retryDelays.length - 1];
      const retryTime = now + retryDelay;

      await ctx.db.patch(args.emailId, {
        status: "scheduled",
        retryCount: newRetryCount,
        lastRetryAt: now,
        errorMessage: args.errorMessage,
        scheduledFor: retryTime,
        updatedAt: now,
      });

      // Schedule retry
      await ctx.scheduler.runAt(retryTime, api.emailAutomation.sendScheduledEmail, {
        emailId: args.emailId,
      });
    } else {
      // Max retries reached, mark as permanently failed
      await ctx.db.patch(args.emailId, {
        status: "failed",
        retryCount: newRetryCount,
        lastRetryAt: now,
        errorMessage: args.errorMessage,
        updatedAt: now,
      });
    }
  },
});

// Cancel scheduled email
export const cancelScheduledEmail = mutation({
  args: {
    emailId: v.id("emailAutomation"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.emailId);
    
    if (!email || email.status !== "scheduled") {
      return false;
    }

    await ctx.db.patch(args.emailId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Get user's email preferences
export const getUserEmailPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("emailPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        welcomeEmails: true,
        appointmentReminders: true,
        appointmentConfirmations: true,
        treatmentReminders: true,
        medicationReminders: true,
        securityAlerts: true,
        systemNotifications: true,
        marketingEmails: false,
        profileReminders: true,
        reengagementEmails: true,
        emailFrequency: "immediate" as const,
      };
    }

    return preferences;
  },
});

// Update user's email preferences
export const updateEmailPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      welcomeEmails: v.boolean(),
      appointmentReminders: v.boolean(),
      appointmentConfirmations: v.boolean(),
      treatmentReminders: v.boolean(),
      medicationReminders: v.boolean(),
      securityAlerts: v.boolean(),
      systemNotifications: v.boolean(),
      marketingEmails: v.boolean(),
      profileReminders: v.boolean(),
      reengagementEmails: v.boolean(),
      emailFrequency: v.union(
        v.literal("immediate"),
        v.literal("daily_digest"),
        v.literal("weekly_digest")
      ),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existing = await ctx.db
      .query("emailPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.preferences,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("emailPreferences", {
        userId: args.userId,
        ...args.preferences,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});



// Get recent email by type (helper query)
export const getRecentEmailByType = query({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    withinDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - (args.withinDays * 24 * 60 * 60 * 1000);

    return await ctx.db
      .query("emailAutomation")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "sent")
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("emailType"), args.emailType),
          q.gte(q.field("sentAt"), cutoffTime)
        )
      )
      .first();
  },
});




