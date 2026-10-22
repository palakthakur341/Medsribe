import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Appointment Reschedule Request System
 * 
 * Patients can request appointment reschedules which require approval
 * from the doctor's office before being processed.
 */

// Create a reschedule request
export const createRescheduleRequest = mutation({
  args: {
    appointmentId: v.id("appointments"),
    requestedSlotId: v.optional(v.id("timeSlots")),
    requestedDateTime: v.optional(v.number()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the appointment details
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Get doctor-patient relationship
    const doctorPatient = await ctx.db.get(appointment.doctorPatientId);
    if (!doctorPatient) {
      throw new Error("Doctor-patient relationship not found");
    }

    // Check if there's already a pending request for this appointment
    const existingRequest = await ctx.db
      .query("appointmentRescheduleRequests")
      .withIndex("by_appointment", (q) => q.eq("appointmentId", args.appointmentId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("There is already a pending reschedule request for this appointment");
    }

    // Validate requested slot if provided
    if (args.requestedSlotId) {
      const requestedSlot = await ctx.db.get(args.requestedSlotId);
      if (!requestedSlot || requestedSlot.slotType !== "available") {
        throw new Error("Requested time slot is not available");
      }
      
      // Ensure the slot is for the same doctor
      if (requestedSlot.doctorId !== doctorPatient.doctorId) {
        throw new Error("Requested slot must be with the same doctor");
      }
    }

    const now = Date.now();

    // Create the reschedule request
    const requestId = await ctx.db.insert("appointmentRescheduleRequests", {
      appointmentId: args.appointmentId,
      patientId: doctorPatient.patientId,
      doctorId: doctorPatient.doctorId,
      currentDateTime: appointment.appointmentDateTime,
      requestedSlotId: args.requestedSlotId,
      requestedDateTime: args.requestedDateTime,
      reason: args.reason,
      status: "pending",
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Get doctor's user ID for notification
    const doctor = await ctx.db.get(doctorPatient.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Create notification for doctor/admin
    await ctx.db.insert("notifications", {
      recipientId: doctor.userId,
      recipientType: "doctor",
      category: "administrative",
      type: "reschedule_request",
      priority: "medium",
      title: "New Reschedule Request",
      message: `Patient has requested to reschedule their appointment. Reason: ${args.reason}`,
      actionUrl: `/doctor/appointments/reschedule-requests/${requestId}`,
      relatedRecords: {
        patientId: doctorPatient.patientId,
        doctorId: doctorPatient.doctorId,
        appointmentId: args.appointmentId,
      },
      channels: ["in_app", "email"],
      isRead: false,
      createdAt: now,
    });

    return requestId;
  },
});

// Get reschedule requests for a doctor
export const getByDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("appointmentRescheduleRequests")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const requests = await query
      .order("desc")
      .take(limit);

    // Enrich with appointment, patient, and slot details
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const [appointment, patient, requestedSlot] = await Promise.all([
          ctx.db.get(request.appointmentId),
          ctx.db.get(request.patientId),
          request.requestedSlotId ? ctx.db.get(request.requestedSlotId) : null,
        ]);

        return {
          ...request,
          appointment,
          patient,
          requestedSlot,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get reschedule requests for a patient
export const getByPatient = query({
  args: {
    patientId: v.id("patients"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let query = ctx.db
      .query("appointmentRescheduleRequests")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const requests = await query
      .order("desc")
      .take(limit);

    // Enrich with appointment, doctor, and slot details
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const [appointment, doctor, requestedSlot] = await Promise.all([
          ctx.db.get(request.appointmentId),
          ctx.db.get(request.doctorId),
          request.requestedSlotId ? ctx.db.get(request.requestedSlotId) : null,
        ]);

        return {
          ...request,
          appointment,
          doctor,
          requestedSlot,
        };
      })
    );

    return enrichedRequests;
  },
});

// Approve a reschedule request (Doctor/Admin only)
export const approveRequest = mutation({
  args: {
    requestId: v.id("appointmentRescheduleRequests"),
    adminNotes: v.optional(v.string()),
    respondedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Reschedule request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Validate that the requested slot is still available
    if (request.requestedSlotId) {
      const requestedSlot = await ctx.db.get(request.requestedSlotId);
      if (!requestedSlot || requestedSlot.slotType !== "available") {
        throw new Error("Requested time slot is no longer available");
      }
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      adminNotes: args.adminNotes,
      respondedAt: now,
      respondedBy: args.respondedBy,
      updatedAt: now,
    });

    // If a specific slot was requested, proceed with the reschedule
    if (request.requestedSlotId) {
      // Get the appointment and requested slot
      const appointment = await ctx.db.get(request.appointmentId);
      const requestedSlot = await ctx.db.get(request.requestedSlotId);

      if (!appointment || !requestedSlot) {
        throw new Error("Appointment or requested slot not found");
      }

      // Find and release the old slot
      const oldSlot = await ctx.db
        .query("timeSlots")
        .withIndex("by_appointment", (q) => q.eq("appointmentId", request.appointmentId))
        .first();

      if (oldSlot) {
        await ctx.db.patch(oldSlot._id, {
          slotType: "available",
          appointmentId: undefined,
          updatedAt: Date.now(),
        });
      }

      // Book the new slot
      await ctx.db.patch(request.requestedSlotId, {
        slotType: "booked",
        appointmentId: request.appointmentId,
        updatedAt: Date.now(),
      });

      // Update the appointment with new date/time
      const newDateTime = new Date(`${requestedSlot.date}T${requestedSlot.time}`).getTime();
      await ctx.db.patch(request.appointmentId, {
        appointmentDateTime: newDateTime,
        status: "scheduled",
        updatedAt: Date.now(),
      });
    }

    // Get patient's user ID for notification
    const patient = await ctx.db.get(request.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Create notification for patient
    await ctx.db.insert("notifications", {
      recipientId: patient.userId,
      recipientType: "patient",
      category: "administrative",
      type: "reschedule_approved",
      priority: "medium",
      title: "Reschedule Request Approved",
      message: request.requestedSlotId 
        ? "Your reschedule request has been approved and your appointment has been updated."
        : "Your reschedule request has been approved. The office will contact you to schedule a new time.",
      actionUrl: `/patient/appointments`,
      relatedRecords: {
        patientId: request.patientId,
        doctorId: request.doctorId,
        appointmentId: request.appointmentId,
      },
      channels: ["in_app", "email"],
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Reject a reschedule request (Doctor/Admin only)
export const rejectRequest = mutation({
  args: {
    requestId: v.id("appointmentRescheduleRequests"),
    adminNotes: v.string(),
    respondedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Reschedule request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      adminNotes: args.adminNotes,
      respondedAt: now,
      respondedBy: args.respondedBy,
      updatedAt: now,
    });

    // Get patient's user ID for notification
    const patient = await ctx.db.get(request.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Create notification for patient
    await ctx.db.insert("notifications", {
      recipientId: patient.userId,
      recipientType: "patient",
      category: "administrative",
      type: "reschedule_rejected",
      priority: "medium",
      title: "Reschedule Request Declined",
      message: `Your reschedule request has been declined. Reason: ${args.adminNotes}`,
      actionUrl: `/patient/appointments`,
      relatedRecords: {
        patientId: request.patientId,
        doctorId: request.doctorId,
        appointmentId: request.appointmentId,
      },
      channels: ["in_app", "email"],
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Cancel a reschedule request (Patient only)
export const cancelRequest = mutation({
  args: {
    requestId: v.id("appointmentRescheduleRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Reschedule request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be cancelled");
    }

    const now = Date.now();

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "cancelled",
      updatedAt: now,
    });

    return { success: true };
  },
});
