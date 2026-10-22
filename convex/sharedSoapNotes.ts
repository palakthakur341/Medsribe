import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const shareSOAPNote = mutation({
  args: {
    soapNoteId: v.id("soapNotes"),
    doctorId: v.id("doctors"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const soapNote = await ctx.db.get(args.soapNoteId);
    if (!soapNote) {
      throw new Error("SOAP note not found");
    }

    // Check if already shared with this doctor
    const existingShare = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", args.soapNoteId))
      .filter((q) => q.eq(q.field("sharedWith"), args.doctorId))
      .first();

    if (existingShare) {
      throw new Error("SOAP note already shared with this doctor");
    }

    // Verify the doctor exists
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const now = Date.now();

    const sharedSoapId = await ctx.db.insert("sharedSoapNotes", {
      soapNoteId: args.soapNoteId,
      patientId: soapNote.patientId,
      sharedBy: soapNote.patientId,
      sharedByType: "patient",
      sharedWith: args.doctorId,
      shareType: "direct_share",
      message: args.message,
      isRead: false,
      actionStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Get patient information for notification
    const patient = await ctx.db.get(soapNote.patientId);

    if (patient) {
      // Notify doctor about shared SOAP note
      await ctx.db.insert("notifications", {
        recipientId: doctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "soap_note_shared",
        priority: "medium",
        title: "SOAP Note Shared",
        message: `${patient.firstName} ${patient.lastName} has shared a SOAP note with you.`,
        actionUrl: `/doctor/shared-soap`,
        relatedRecords: {
          soapNoteId: args.soapNoteId,
          patientId: soapNote.patientId,
          doctorId: args.doctorId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    // Note: RAG embedding for SOAP sharing will be handled by frontend hooks
    // to avoid cloud/localhost connectivity issues

    return sharedSoapId;
  },
});

export const getSharedSOAPNotesForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_shared_with", (q) => q.eq("sharedWith", args.doctorId))
      .order("desc")
      .collect();

    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const patient = await ctx.db.get(shared.patientId);

        let sharedByInfo = null;
        if (shared.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        } else if (shared.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        }

        let referralInfo = null;
        if (shared.referralId) {
          referralInfo = await ctx.db.get(shared.referralId);
        }

        return {
          ...shared,
          soapNote,
          patient,
          sharedByInfo,
          referralInfo,
        };
      })
    );

    // Filter out entries where critical data is missing OR actions have been completed
    return enrichedNotes.filter(note =>
      note.soapNote &&
      note.patient &&
      // Only show notes that are pending or just reviewed (no specific actions taken yet)
      (!note.actionStatus || note.actionStatus === "pending" || note.actionStatus === "reviewed")
    );
  },
});

// Get shared SOAP notes for a specific patient-doctor relationship
export const getSharedNotesForDoctor = query({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors")
  },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_shared_with", (q) => q.eq("sharedWith", args.doctorId))
      .filter((q) => q.eq(q.field("patientId"), args.patientId))
      .order("desc")
      .collect();

    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const patient = await ctx.db.get(shared.patientId);

        let sharedByInfo = null;
        if (shared.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        } else if (shared.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        }

        let referralInfo = null;
        if (shared.referralId) {
          referralInfo = await ctx.db.get(shared.referralId);
        }

        return {
          ...shared,
          soapNote,
          patient,
          sharedByInfo,
          referralInfo,
        };
      })
    );

    // Return all notes (including completed actions) for comprehensive history
    return enrichedNotes.filter(note =>
      note.soapNote &&
      note.patient
    );
  },
});

// Get completed actions for doctor (for history/reference)
export const getCompletedActionsForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_shared_with", (q) => q.eq("sharedWith", args.doctorId))
      .order("desc")
      .collect();

    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const patient = await ctx.db.get(shared.patientId);

        let sharedByInfo = null;
        if (shared.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        } else if (shared.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        }

        let referralInfo = null;
        if (shared.referralId) {
          referralInfo = await ctx.db.get(shared.referralId);
        }

        return {
          ...shared,
          soapNote,
          patient,
          sharedByInfo,
          referralInfo,
        };
      })
    );

    // Only show notes where specific actions have been completed
    return enrichedNotes.filter(note =>
      note.soapNote &&
      note.patient &&
      note.actionStatus &&
      ["assistance_provided", "appointment_scheduled", "referral_sent", "treatment_initiated"].includes(note.actionStatus)
    );
  },
});

export const getSharedSOAPNotesByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const doctor = await ctx.db.get(shared.sharedWith);

        let sharedByInfo = null;
        if (shared.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        } else if (shared.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        }

        return {
          ...shared,
          soapNote,
          doctor,
          sharedByInfo,
        };
      })
    );

    return enrichedNotes.filter(note => note.soapNote && note.doctor);
  },
});

export const markAsRead = mutation({
  args: { sharedSoapNoteId: v.id("sharedSoapNotes") },
  handler: async (ctx, args) => {
    const sharedNote = await ctx.db.get(args.sharedSoapNoteId);
    if (!sharedNote) {
      throw new Error("Shared SOAP note not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.sharedSoapNoteId, {
      isRead: true,
      readAt: now,
      actionStatus: "reviewed",
      actionTakenAt: now,
      updatedAt: now,
    });

    return args.sharedSoapNoteId;
  },
});

// Update action status when doctor takes specific actions
export const updateActionStatus = mutation({
  args: {
    sharedSoapNoteId: v.id("sharedSoapNotes"),
    actionStatus: v.union(
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_sent"),
      v.literal("treatment_initiated")
    ),
    actionDetails: v.optional(v.string()),
    relatedActionId: v.optional(v.union(
      v.id("appointments"),
      v.id("referrals"),
      v.id("treatmentPlans")
    )),
  },
  handler: async (ctx, args) => {
    const sharedNote = await ctx.db.get(args.sharedSoapNoteId);
    if (!sharedNote) {
      throw new Error("Shared SOAP note not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.sharedSoapNoteId, {
      actionStatus: args.actionStatus,
      actionTakenAt: now,
      actionDetails: args.actionDetails,
      relatedActionId: args.relatedActionId,
      updatedAt: now,
    });

    // Create notification for patient about the action taken
    const patient = await ctx.db.get(sharedNote.patientId);
    const doctor = await ctx.db.get(sharedNote.sharedWith);

    if (patient && doctor) {
      let notificationMessage = "";
      let actionUrl = "/patient/soap/history";

      switch (args.actionStatus) {
        case "assistance_provided":
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has provided medical assistance regarding your SOAP note.`;
          break;
        case "appointment_scheduled":
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has scheduled an appointment for you.`;
          actionUrl = "/patient/appointments";
          break;
        case "referral_sent":
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has referred you to a specialist.`;
          actionUrl = "/patient/referrals";
          break;
        case "treatment_initiated":
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has initiated a treatment plan for you.`;
          actionUrl = "/patient/treatments";
          break;
      }

      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "clinical",
        type: "doctor_action_taken",
        priority: "medium",
        title: "Doctor Action Taken",
        message: notificationMessage,
        actionUrl,
        relatedRecords: {
          soapNoteId: sharedNote.soapNoteId,
          doctorId: sharedNote.sharedWith,
          patientId: sharedNote.patientId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.sharedSoapNoteId;
  },
});

export const getUnreadCountForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const unreadNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_shared_with_unread", (q) =>
        q.eq("sharedWith", args.doctorId).eq("isRead", false)
      )
      .collect();

    return unreadNotes.length;
  },
});

export const shareViaReferral = mutation({
  args: {
    soapNoteId: v.id("soapNotes"),
    fromDoctorId: v.id("doctors"),
    toDoctorId: v.id("doctors"),
    referralId: v.id("referrals"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const soapNote = await ctx.db.get(args.soapNoteId);
    if (!soapNote) {
      throw new Error("SOAP note not found");
    }

    // Verify doctors exist
    const fromDoctor = await ctx.db.get(args.fromDoctorId);
    const toDoctor = await ctx.db.get(args.toDoctorId);
    
    if (!fromDoctor) {
      throw new Error("Referring doctor not found");
    }
    if (!toDoctor) {
      throw new Error("Receiving doctor not found");
    }

    // Verify referral exists
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    const now = Date.now();

    const sharedSoapId = await ctx.db.insert("sharedSoapNotes", {
      soapNoteId: args.soapNoteId,
      patientId: soapNote.patientId,
      sharedBy: args.fromDoctorId,
      sharedByType: "doctor",
      sharedWith: args.toDoctorId,
      shareType: "referral_share",
      referralId: args.referralId,
      message: args.message || `SOAP note shared via referral`,
      isRead: false,
      actionStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Get patient information for notification
    const patient = await ctx.db.get(soapNote.patientId);

    if (patient) {
      // Notify receiving doctor about referral with SOAP note
      await ctx.db.insert("notifications", {
        recipientId: toDoctor.userId,
        recipientType: "doctor",
        category: "clinical",
        type: "referral_received",
        priority: "medium",
        title: "Referral Received",
        message: `Dr. ${fromDoctor.firstName} ${fromDoctor.lastName} has referred ${patient.firstName} ${patient.lastName} to you with a SOAP note.`,
        actionUrl: `/doctor/referrals/received`,
        relatedRecords: {
          soapNoteId: args.soapNoteId,
          patientId: soapNote.patientId,
          doctorId: args.fromDoctorId,
          referralId: args.referralId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return sharedSoapId;
  },
});

export const removeSharedSOAPNote = mutation({
  args: { sharedSoapNoteId: v.id("sharedSoapNotes") },
  handler: async (ctx, args) => {
    const sharedNote = await ctx.db.get(args.sharedSoapNoteId);
    if (!sharedNote) {
      throw new Error("Shared SOAP note not found");
    }

    await ctx.db.delete(args.sharedSoapNoteId);
    return args.sharedSoapNoteId;
  },
});

// Additional helper queries
export const getSharedSOAPNoteById = query({
  args: { sharedSoapNoteId: v.id("sharedSoapNotes") },
  handler: async (ctx, args) => {
    const shared = await ctx.db.get(args.sharedSoapNoteId);
    if (!shared) return null;

    const soapNote = await ctx.db.get(shared.soapNoteId);
    const patient = await ctx.db.get(shared.patientId);
    const doctor = await ctx.db.get(shared.sharedWith);

    let sharedByInfo = null;
    if (shared.sharedByType === "patient") {
      sharedByInfo = await ctx.db.get(shared.sharedBy);
    } else if (shared.sharedByType === "doctor") {
      sharedByInfo = await ctx.db.get(shared.sharedBy);
    }

    let referralInfo = null;
    if (shared.referralId) {
      referralInfo = await ctx.db.get(shared.referralId);
    }

    return {
      ...shared,
      soapNote,
      patient,
      doctor,
      sharedByInfo,
      referralInfo,
    };
  },
});

export const getShareHistoryForSOAPNote = query({
  args: { soapNoteId: v.id("soapNotes") },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", args.soapNoteId))
      .order("desc")
      .collect();

    const enrichedShares = await Promise.all(
      shares.map(async (share) => {
        const doctor = await ctx.db.get(share.sharedWith);
        
        let sharedByInfo = null;
        if (share.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(share.sharedBy);
        } else if (share.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(share.sharedBy);
        }

        return {
          ...share,
          doctor,
          sharedByInfo,
        };
      })
    );

    return enrichedShares.filter(share => share.doctor);
  },
});