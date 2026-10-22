import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Create a new user (credentials)
export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient"), v.literal("admin"), v.literal("pharmacy")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
      isActive: true,
      twoFactorEnabled: false,
      provider: "credentials",
      createdAt: now,
      updatedAt: now,
    });

    // Create default email preferences
    await ctx.db.insert("emailPreferences", {
      userId,
      welcomeEmails: true,
      appointmentReminders: true,
      appointmentConfirmations: true,
      treatmentReminders: true,

      securityAlerts: true,
      systemNotifications: true,
      marketingEmails: false,
      profileReminders: true,
      reengagementEmails: true,
      emailFrequency: "immediate",
      createdAt: now,
      updatedAt: now,
    });

    // Welcome email will be sent via existing email system on login



    return userId;
  },
});

// Create a new OAuth user
export const createOAuthUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient"), v.literal("admin"), v.literal("pharmacy")),
    provider: v.string(),
    providerId: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      role: args.role,
      isActive: true,
      twoFactorEnabled: false,
      provider: args.provider,
      providerId: args.providerId,
      name: args.name,
      image: args.image,
      emailVerifiedAt: now, // OAuth emails are pre-verified
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});



// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),
    twoFactorEnabled: v.optional(v.boolean()),
    provider: v.optional(v.string()),
    providerId: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // If email is being updated, check if it's already taken
    if (updates.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingUser && existingUser._id !== userId) {
        throw new Error("Email already taken");
      }
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Create password reset token
export const createPasswordResetToken = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a secure random token
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15) +
                  Date.now().toString(36);

    // Set expiration to 1 hour from now
    const expiresAt = Date.now() + (60 * 60 * 1000);

    // Invalidate any existing tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user_active", (q) => q.eq("userId", user._id).eq("isUsed", false))
      .collect();

    for (const existingToken of existingTokens) {
      await ctx.db.patch(existingToken._id, { isUsed: true });
    }

    // Create new token
    const tokenId = await ctx.db.insert("passwordResetTokens", {
      userId: user._id,
      token,
      expiresAt,
      isUsed: false,
      createdAt: Date.now(),
    });

    return { token, email: user.email };
  },
});

// Generate password reset token and send email (action)
export const generatePasswordResetToken = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    try {
      // Create the password reset token
      const result = await ctx.runMutation(api.users.createPasswordResetToken, {
        email: args.email,
      });

      // Get user details for personalized email
      const user = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });

      // Generate password reset email using template
      const { generateEmailContent, sendEmail } = await import("./emailService");
      const emailOptions = generateEmailContent("password_reset", {
        email: result.email,
        firstName: user?.name?.split(' ')[0] || "",
        resetToken: result.token
      });

      // Send email using the email service
      const emailSent = await sendEmail(emailOptions);

      // Always return success for security reasons

      return { success: true };
    } catch (error: any) {
      // For security, don't reveal if user exists or not - always return success
      return { success: true };
    }
  },
});

// Get inactive users for re-engagement emails
export const getInactiveUsers = query({
  args: { lastLoginBefore: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) =>
        q.or(
          q.eq(q.field("lastLoginAt"), undefined),
          q.lt(q.field("lastLoginAt"), args.lastLoginBefore)
        )
      )
      .collect();
  },
});





// Validate password reset token
export const validatePasswordResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return { valid: false, error: "Invalid token" };
    }

    if (tokenRecord.isUsed) {
      return { valid: false, error: "Token has already been used" };
    }

    if (tokenRecord.expiresAt < Date.now()) {
      return { valid: false, error: "Token has expired" };
    }

    const user = await ctx.db.get(tokenRecord.userId);
    if (!user) {
      return { valid: false, error: "User not found" };
    }

    return {
      valid: true,
      userId: tokenRecord.userId,
      email: user.email
    };
  },
});

// Reset password with token
export const resetPasswordWithToken = mutation({
  args: {
    token: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate token
    const tokenRecord = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      throw new Error("Invalid token");
    }

    if (tokenRecord.isUsed) {
      throw new Error("Token has already been used");
    }

    if (tokenRecord.expiresAt < Date.now()) {
      throw new Error("Token has expired");
    }

    // Update user password
    await ctx.db.patch(tokenRecord.userId, {
      passwordHash: args.newPasswordHash,
      updatedAt: Date.now(),
    });

    // Mark token as used
    await ctx.db.patch(tokenRecord._id, { isUsed: true });

    return { success: true };
  },
});

// Delete user account and all related data
export const deleteUserAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get user to determine role
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Step 1: Delete password reset tokens
      const passwordResetTokens = await ctx.db
        .query("passwordResetTokens")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();

      for (const token of passwordResetTokens) {
        await ctx.db.delete(token._id);
      }

      // Step 2: Delete notifications
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
        .collect();

      for (const notification of notifications) {
        await ctx.db.delete(notification._id);
      }

      // Step 3: Delete chat messages and sessions
      const chatSessions = await ctx.db
        .query("chatSessions")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();

      for (const session of chatSessions) {
        // Delete all messages in this session
        const messages = await ctx.db
          .query("chatMessages")
          .withIndex("by_session_id", (q) => q.eq("sessionId", session._id))
          .collect();

        for (const message of messages) {
          await ctx.db.delete(message._id);
        }

        // Delete the session
        await ctx.db.delete(session._id);
      }

      if (user.role === "patient") {
        await deletePatientData(ctx, userId);
      } else if (user.role === "doctor") {
        await deleteDoctorData(ctx, userId);
      }

      // Final step: Delete the user account
      await ctx.db.delete(userId);

      return { success: true, message: "Account and all related data deleted successfully" };
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw new Error("Failed to delete account. Please try again.");
    }
  },
});

// Helper function to delete patient-specific data
async function deletePatientData(ctx: MutationCtx, userId: Id<"users">) {
  // Get patient record
  const patient = await ctx.db
    .query("patients")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .first();

  if (!patient) return;

  const patientId = patient._id;

  // Delete patient medical history
  const medicalHistory = await ctx.db
    .query("patientMedicalHistory")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const history of medicalHistory) {
    await ctx.db.delete(history._id);
  }

  // Delete patient allergies
  const allergies = await ctx.db
    .query("patientAllergies")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const allergy of allergies) {
    await ctx.db.delete(allergy._id);
  }

  // Delete patient insurance
  const insurance = await ctx.db
    .query("patientInsurance")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const ins of insurance) {
    await ctx.db.delete(ins._id);
  }

  // Delete audio recordings
  const audioRecordings = await ctx.db
    .query("audioRecordings")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const recording of audioRecordings) {
    await ctx.db.delete(recording._id);
  }

  // Delete SOAP notes and related data
  const soapNotes = await ctx.db
    .query("soapNotes")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const soapNote of soapNotes) {
    // Delete shared SOAP notes
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", soapNote._id))
      .collect();

    for (const shared of sharedNotes) {
      await ctx.db.delete(shared._id);
    }

    // Delete referrals related to this SOAP note
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_soap_note", (q) => q.eq("soapNoteId", soapNote._id))
      .collect();

    for (const referral of referrals) {
      await ctx.db.delete(referral._id);
    }

    // Delete the SOAP note
    await ctx.db.delete(soapNote._id);
  }

  // Delete doctor-patient relationships
  const doctorPatients = await ctx.db
    .query("doctorPatients")
    .withIndex("by_patient_id", (q) => q.eq("patientId", patientId))
    .collect();

  for (const relationship of doctorPatients) {
    // Delete appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", relationship._id))
      .collect();

    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    // Delete treatment plans and medications
    const treatmentPlans = await ctx.db
      .query("treatmentPlans")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", relationship._id))
      .collect();

    for (const plan of treatmentPlans) {
      // Note: Medications now handled through prescription system

      // Delete the treatment plan
      await ctx.db.delete(plan._id);
    }

    // Delete the doctor-patient relationship
    await ctx.db.delete(relationship._id);
  }

  // Delete referrals where patient is involved
  const patientReferrals = await ctx.db
    .query("referrals")
    .withIndex("by_patient", (q) => q.eq("patientId", patientId))
    .collect();

  for (const referral of patientReferrals) {
    await ctx.db.delete(referral._id);
  }

  // Delete the patient record
  await ctx.db.delete(patientId);
}

// Helper function to delete doctor-specific data
async function deleteDoctorData(ctx: MutationCtx, userId: Id<"users">) {
  // Get doctor record
  const doctor = await ctx.db
    .query("doctors")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .first();

  if (!doctor) return;

  const doctorId = doctor._id;

  // Delete doctor-patient relationships and related data
  const doctorPatients = await ctx.db
    .query("doctorPatients")
    .withIndex("by_doctor_id", (q) => q.eq("doctorId", doctorId))
    .collect();

  for (const relationship of doctorPatients) {
    // Delete appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", relationship._id))
      .collect();

    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    // Delete treatment plans and medications
    const treatmentPlans = await ctx.db
      .query("treatmentPlans")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", relationship._id))
      .collect();

    for (const plan of treatmentPlans) {
      // Note: Medications now handled through prescription system

      // Delete the treatment plan
      await ctx.db.delete(plan._id);
    }

    // Delete the doctor-patient relationship
    await ctx.db.delete(relationship._id);
  }

  // Delete referrals sent by this doctor
  const sentReferrals = await ctx.db
    .query("referrals")
    .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", doctorId))
    .collect();

  for (const referral of sentReferrals) {
    await ctx.db.delete(referral._id);
  }

  // Delete referrals received by this doctor
  const receivedReferrals = await ctx.db
    .query("referrals")
    .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", doctorId))
    .collect();

  for (const referral of receivedReferrals) {
    await ctx.db.delete(referral._id);
  }

  // Delete shared SOAP notes where doctor is involved
  const sharedSoapNotes = await ctx.db
    .query("sharedSoapNotes")
    .withIndex("by_shared_with", (q) => q.eq("sharedWith", doctorId))
    .collect();

  for (const shared of sharedSoapNotes) {
    await ctx.db.delete(shared._id);
  }

  // Delete shared SOAP notes shared by this doctor
  const sharedByDoctor = await ctx.db
    .query("sharedSoapNotes")
    .withIndex("by_shared_by", (q) => q.eq("sharedBy", doctorId))
    .collect();

  for (const shared of sharedByDoctor) {
    await ctx.db.delete(shared._id);
  }

  // Update patients who have this doctor as primary care physician
  const patientsWithThisDoctor = await ctx.db
    .query("patients")
    .withIndex("by_primary_care", (q) => q.eq("primaryCarePhysicianId", doctorId))
    .collect();

  for (const patient of patientsWithThisDoctor) {
    await ctx.db.patch(patient._id, {
      primaryCarePhysicianId: undefined,
      updatedAt: Date.now(),
    });
  }

  // Delete the doctor record
  await ctx.db.delete(doctorId);
}


