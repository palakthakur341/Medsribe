import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    fromDoctorId: v.id("doctors"),
    toDoctorId: v.optional(v.id("doctors")), // Made optional for open referrals
    patientId: v.id("patients"),
    soapNoteId: v.optional(v.id("soapNotes")), // Made optional
    specialtyRequired: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    reasonForReferral: v.string(),
    clinicalQuestion: v.optional(v.string()),
    // Additional optional fields from frontend
    referralType: v.optional(v.string()),
    relevantHistory: v.optional(v.string()),
    currentMedications: v.optional(v.string()),
    workupCompleted: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify all required entities exist
    const fromDoctor = await ctx.db.get(args.fromDoctorId);
    const patient = await ctx.db.get(args.patientId);

    if (!fromDoctor) throw new Error("Referring doctor not found");
    if (!patient) throw new Error("Patient not found");

    // Verify receiving doctor exists (if specified - not for open referrals)
    let toDoctor = null;
    if (args.toDoctorId) {
      toDoctor = await ctx.db.get(args.toDoctorId);
      if (!toDoctor) throw new Error("Receiving doctor not found");
    }

    // Verify SOAP note exists and belongs to patient (if specified)
    let soapNote = null;
    if (args.soapNoteId) {
      soapNote = await ctx.db.get(args.soapNoteId);
      if (!soapNote) throw new Error("SOAP note not found");
      if (soapNote.patientId !== args.patientId) {
        throw new Error("SOAP note does not belong to this patient");
      }
    }

    const now = Date.now();

    // Create the referral
    const referralId = await ctx.db.insert("referrals", {
      fromDoctorId: args.fromDoctorId,
      toDoctorId: args.toDoctorId, // Can be undefined for open referrals
      patientId: args.patientId,
      soapNoteId: args.soapNoteId, // Can be undefined if no SOAP note attached
      specialtyRequired: args.specialtyRequired,
      urgency: args.urgency,
      reasonForReferral: args.reasonForReferral,
      clinicalQuestion: args.clinicalQuestion,
      status: "pending",
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for receiving doctor (only if specific doctor is selected)
    if (toDoctor) {
      await ctx.db.insert("notifications", {
        recipientId: toDoctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "referral_received",
        priority: args.urgency === "stat" ? "urgent" : args.urgency === "urgent" ? "high" : "medium",
        title: "New Referral Received",
        message: `Dr. ${fromDoctor.firstName} ${fromDoctor.lastName} has referred ${patient.firstName} ${patient.lastName} (${args.specialtyRequired}) to you.`,
        actionUrl: `/doctor/referrals/received/${referralId}`,
        relatedRecords: {
          referralId,
          patientId: args.patientId,
          doctorId: args.fromDoctorId,
          soapNoteId: args.soapNoteId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return referralId;
  },
});

export const accept = mutation({
  args: {
    referralId: v.id("referrals"),
    responseMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.status !== "pending") {
      throw new Error("Referral is not in pending status");
    }

    const now = Date.now();

    await ctx.db.patch(args.referralId, {
      status: "accepted",
      responseMessage: args.responseMessage,
      respondedAt: now,
      updatedAt: now,
    });

    // Get doctors and patient for notifications
    const fromDoctor = await ctx.db.get(referral.fromDoctorId);
    const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
    const patient = await ctx.db.get(referral.patientId);

    // If there's a SOAP note attached to this referral, share it with the accepting doctor
    if (referral.soapNoteId && referral.toDoctorId) {
      // Check if SOAP note is already shared to avoid duplicates
      const existingShare = await ctx.db
        .query("sharedSoapNotes")
        .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", referral.soapNoteId!))
        .filter((q) => q.eq(q.field("sharedWith"), referral.toDoctorId!))
        .filter((q) => q.eq(q.field("referralId"), args.referralId))
        .first();

      if (!existingShare) {
        // Create shared SOAP note for the referral
        await ctx.db.insert("sharedSoapNotes", {
          soapNoteId: referral.soapNoteId,
          patientId: referral.patientId,
          sharedBy: referral.fromDoctorId,
          sharedByType: "doctor",
          sharedWith: referral.toDoctorId,
          shareType: "referral_share",
          referralId: args.referralId,
          message: args.responseMessage || `SOAP note shared via accepted referral`,
          isRead: false,
          actionStatus: "pending",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (fromDoctor && toDoctor && patient) {
      // Notify referring doctor about acceptance
      await ctx.db.insert("notifications", {
        recipientId: fromDoctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "referral_accepted",
        priority: "medium",
        title: "Referral Accepted",
        message: `Dr. ${toDoctor.firstName} ${toDoctor.lastName} has accepted your referral for ${patient.firstName} ${patient.lastName}.`,
        actionUrl: `/doctor/referrals/sent/${args.referralId}`,
        relatedRecords: {
          referralId: args.referralId,
          patientId: referral.patientId,
          doctorId: referral.toDoctorId,
          soapNoteId: referral.soapNoteId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });

      // If SOAP note was shared, also notify about the shared SOAP note
      if (referral.soapNoteId) {
        await ctx.db.insert("notifications", {
          recipientId: toDoctor.userId,
          recipientType: "doctor",
          category: "clinical",
          type: "soap_note_shared",
          priority: "medium",
          title: "SOAP Note Shared via Referral",
          message: `Dr. ${fromDoctor.firstName} ${fromDoctor.lastName} has shared a SOAP note for ${patient.firstName} ${patient.lastName} via referral.`,
          actionUrl: `/doctor/shared-soap`,
          relatedRecords: {
            soapNoteId: referral.soapNoteId,
            patientId: referral.patientId,
            doctorId: referral.fromDoctorId,
            referralId: args.referralId,
          },
          channels: ["in_app", "email"],
          isRead: false,
          createdAt: now,
        });
      }

      // Create doctor-patient relationship if it doesn't exist (only for specific doctor referrals)
      if (referral.toDoctorId) {
        const toDoctorId = referral.toDoctorId; // TypeScript assertion
        const existingRelationship = await ctx.db
          .query("doctorPatients")
          .withIndex("by_doctor_patient", (q) =>
            q.eq("doctorId", toDoctorId!).eq("patientId", referral.patientId)
          )
          .first();

        if (!existingRelationship) {
          await ctx.db.insert("doctorPatients", {
            doctorId: toDoctorId,
            patientId: referral.patientId,
          assignedBy: "referral_acceptance",
          relatedActionId: args.referralId,
          assignedAt: now,
          isActive: true,
          notes: `Assigned via referral from Dr. ${fromDoctor.firstName} ${fromDoctor.lastName}`,
        });
        }
      }
    }

    return args.referralId;
  },
});

export const decline = mutation({
  args: {
    referralId: v.id("referrals"),
    responseMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.status !== "pending") {
      throw new Error("Referral is not in pending status");
    }

    const now = Date.now();

    await ctx.db.patch(args.referralId, {
      status: "declined",
      responseMessage: args.responseMessage,
      respondedAt: now,
      updatedAt: now,
    });

    // Get doctors and patient for notification
    const fromDoctor = await ctx.db.get(referral.fromDoctorId);
    const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
    const patient = await ctx.db.get(referral.patientId);

    if (fromDoctor && toDoctor && patient) {
      // Notify referring doctor about decline
      await ctx.db.insert("notifications", {
        recipientId: fromDoctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "referral_declined",
        priority: "medium",
        title: "Referral Declined",
        message: `Dr. ${toDoctor.firstName} ${toDoctor.lastName} has declined your referral for ${patient.firstName} ${patient.lastName}.`,
        actionUrl: `/doctor/referrals/sent/${args.referralId}`,
        relatedRecords: {
          referralId: args.referralId,
          patientId: referral.patientId,
          doctorId: referral.toDoctorId,
          soapNoteId: referral.soapNoteId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.referralId;
  },
});

export const complete = mutation({
  args: {
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.status !== "accepted") {
      throw new Error("Referral must be accepted before it can be completed");
    }

    const now = Date.now();
    
    await ctx.db.patch(args.referralId, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });

    // Get doctors and patient for notification
    const fromDoctor = await ctx.db.get(referral.fromDoctorId);
    const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
    const patient = await ctx.db.get(referral.patientId);

    if (fromDoctor && toDoctor && patient) {
      // Notify referring doctor about completion
      await ctx.db.insert("notifications", {
        recipientId: fromDoctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "referral_completed",
        priority: "low",
        title: "Referral Completed",
        message: `Dr. ${toDoctor.firstName} ${toDoctor.lastName} has completed the referral for ${patient.firstName} ${patient.lastName}.`,
        actionUrl: `/doctor/referrals/sent/${args.referralId}`,
        relatedRecords: {
          referralId: args.referralId,
          patientId: referral.patientId,
          doctorId: referral.toDoctorId,
          soapNoteId: referral.soapNoteId,
        },
        channels: ["in_app"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.referralId;
  },
});

export const cancel = mutation({
  args: {
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.status === "completed") {
      throw new Error("Cannot cancel a completed referral");
    }

    const now = Date.now();
    
    await ctx.db.patch(args.referralId, {
      status: "cancelled",
      updatedAt: now,
    });

    return args.referralId;
  },
});

export const getByFromDoctor = query({
  args: { fromDoctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", args.fromDoctorId))
      .order("desc")
      .collect();

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          toDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.toDoctor && r.soapNote);
  },
});

export const getByToDoctor = query({
  args: { toDoctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", args.toDoctorId))
      .order("desc")
      .collect();

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          fromDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.fromDoctor && r.soapNote);
  },
});

// Alias for getByToDoctor for backward compatibility
export const getReceivedReferrals = query({
  args: { toDoctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", args.toDoctorId))
      .order("desc")
      .collect();

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          fromDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.fromDoctor && r.soapNote);
  },
});

// Alias for getByFromDoctor for backward compatibility
export const getSentReferrals = query({
  args: { fromDoctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", args.fromDoctorId))
      .order("desc")
      .collect();

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          toDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.toDoctor && r.soapNote);
  },
});

export const getByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          fromDoctor,
          toDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.fromDoctor && r.toDoctor && r.soapNote);
  },
});

export const getById = query({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) return null;

    const patient = await ctx.db.get(referral.patientId);
    const fromDoctor = await ctx.db.get(referral.fromDoctorId);
    const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
    const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

    return {
      ...referral,
      patient,
      fromDoctor,
      toDoctor,
      soapNote,
    };
  },
});

export const getPendingBySpecialty = query({
  args: { 
    specialtyRequired: v.string(),
    toDoctorId: v.optional(v.id("doctors")),
  },
  handler: async (ctx, args) => {
    let referrals;

    if (args.toDoctorId) {
      // Get pending referrals for a specific doctor
      const toDoctorId = args.toDoctorId; // TypeScript assertion
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_to_doctor_status", (q) =>
          q.eq("toDoctorId", toDoctorId).eq("status", "pending")
        )
        .order("desc")
        .collect();
    } else {
      // Get pending referrals by specialty
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_specialty_status", (q) =>
          q.eq("specialtyRequired", args.specialtyRequired).eq("status", "pending")
        )
        .order("desc")
        .collect();
    }

    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          fromDoctor,
          toDoctor,
          soapNote,
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.fromDoctor && r.soapNote);
  },
});

export const getPendingCountForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const pendingReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_to_doctor_status", (q) =>
        q.eq("toDoctorId", args.doctorId).eq("status", "pending")
      )
      .collect();

    return pendingReferrals.length;
  },
});

export const getRecentActivity = query({
  args: { doctorId: v.id("doctors"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get recent referrals sent
    const sentReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", args.doctorId))
      .order("desc")
      .take(limit);

    // Get recent referrals received
    const receivedReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", args.doctorId))
      .order("desc")
      .take(limit);

    // Combine and sort by created date
    const allReferrals = [...sentReferrals, ...receivedReferrals]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Enrich with related data
    const enrichedReferrals = await Promise.all(
      allReferrals.map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          fromDoctor,
          toDoctor,
          soapNote,
          direction: referral.fromDoctorId === args.doctorId ? "sent" : "received",
        };
      })
    );

    return enrichedReferrals.filter(r => r.patient && r.fromDoctor && r.toDoctor && r.soapNote);
  },
});

export const getStatsByDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    // Get all referrals sent by this doctor
    const sentReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", args.doctorId))
      .collect();

    // Get all referrals received by this doctor
    const receivedReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", args.doctorId))
      .collect();

    // Calculate sent stats
    const sentStats = {
      total: sentReferrals.length,
      pending: sentReferrals.filter(r => r.status === "pending").length,
      accepted: sentReferrals.filter(r => r.status === "accepted").length,
      declined: sentReferrals.filter(r => r.status === "declined").length,
      completed: sentReferrals.filter(r => r.status === "completed").length,
      cancelled: sentReferrals.filter(r => r.status === "cancelled").length,
    };

    // Calculate received stats
    const receivedStats = {
      total: receivedReferrals.length,
      pending: receivedReferrals.filter(r => r.status === "pending").length,
      accepted: receivedReferrals.filter(r => r.status === "accepted").length,
      declined: receivedReferrals.filter(r => r.status === "declined").length,
      completed: receivedReferrals.filter(r => r.status === "completed").length,
      cancelled: receivedReferrals.filter(r => r.status === "cancelled").length,
    };

    return {
      sent: sentStats,
      received: receivedStats,
    };
  },
});

export const searchReferrals = query({
  args: {
    doctorId: v.id("doctors"),
    searchTerm: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    urgency: v.optional(v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("stat")
    )),
    direction: v.optional(v.union(v.literal("sent"), v.literal("received"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let referrals: any[] = [];

    // Get referrals based on direction
    if (!args.direction || args.direction === "sent") {
      const sentReferrals = await ctx.db
        .query("referrals")
        .withIndex("by_from_doctor", (q) => q.eq("fromDoctorId", args.doctorId))
        .collect();
      referrals.push(...sentReferrals.map(r => ({ ...r, direction: "sent" })));
    }

    if (!args.direction || args.direction === "received") {
      const receivedReferrals = await ctx.db
        .query("referrals")
        .withIndex("by_to_doctor", (q) => q.eq("toDoctorId", args.doctorId))
        .collect();
      referrals.push(...receivedReferrals.map(r => ({ ...r, direction: "received" })));
    }

    // Apply filters
    if (args.status) {
      referrals = referrals.filter(r => r.status === args.status);
    }

    if (args.urgency) {
      referrals = referrals.filter(r => r.urgency === args.urgency);
    }

    // Sort by creation date (newest first)
    referrals.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with related data and apply search term filter
    const enrichedReferrals = await Promise.all(
      referrals.slice(0, limit).map(async (referral) => {
        const patient = await ctx.db.get(referral.patientId);
        const fromDoctor = await ctx.db.get(referral.fromDoctorId);
        const toDoctor = referral.toDoctorId ? await ctx.db.get(referral.toDoctorId) : null;
        const soapNote = referral.soapNoteId ? await ctx.db.get(referral.soapNoteId) : null;

        return {
          ...referral,
          patient,
          fromDoctor,
          toDoctor,
          soapNote,
        };
      })
    );

    // Filter by search term if provided
    let filteredReferrals = enrichedReferrals.filter(r =>
      r.patient && r.fromDoctor && r.toDoctor && r.soapNote
    );

    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredReferrals = filteredReferrals.filter(r =>
        r.patient?.firstName?.toLowerCase().includes(searchLower) ||
        r.patient?.lastName?.toLowerCase().includes(searchLower) ||
        r.fromDoctor?.firstName?.toLowerCase().includes(searchLower) ||
        r.fromDoctor?.lastName?.toLowerCase().includes(searchLower) ||
        r.toDoctor?.firstName?.toLowerCase().includes(searchLower) ||
        r.toDoctor?.lastName?.toLowerCase().includes(searchLower) ||
        r.specialtyRequired?.toLowerCase().includes(searchLower) ||
        r.reasonForReferral?.toLowerCase().includes(searchLower) ||
        r.clinicalQuestion?.toLowerCase().includes(searchLower)
      );
    }

    return filteredReferrals;
  },
});