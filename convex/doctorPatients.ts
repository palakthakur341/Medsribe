import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Assign a patient to a doctor
export const assignPatient = mutation({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    assignedBy: v.union(
      v.literal("referral_acceptance"),
      v.literal("appointment_scheduling"),
      v.literal("direct_assignment")
    ),
    relatedActionId: v.optional(v.union(v.id("appointments"), v.id("referrals"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if relationship already exists
    const existingRelationship = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => 
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingRelationship) {
      // Update existing relationship
      await ctx.db.patch(existingRelationship._id, {
        assignedBy: args.assignedBy,
        relatedActionId: args.relatedActionId,
        notes: args.notes,
        assignedAt: now,
      });
      return existingRelationship._id;
    } else {
      // Create new relationship
      return await ctx.db.insert("doctorPatients", {
        doctorId: args.doctorId,
        patientId: args.patientId,
        assignedBy: args.assignedBy,
        relatedActionId: args.relatedActionId,
        assignedAt: now,
        isActive: true,
        notes: args.notes,
      });
    }
  },
});

// Get patients assigned to a doctor
export const getPatientsByDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const relationships = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Get patient details for each relationship
    const patientsWithDetails = await Promise.all(
      relationships.map(async (relationship) => {
        const patient = await ctx.db.get(relationship.patientId);
        const relatedAction = relationship.relatedActionId 
          ? await ctx.db.get(relationship.relatedActionId)
          : null;

        return {
          ...relationship,
          patient,
          relatedAction,
        };
      })
    );

    return patientsWithDetails.filter(item => item.patient);
  },
});

// Get doctors assigned to a patient
export const getDoctorsByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const relationships = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Get doctor details for each relationship
    const doctorsWithDetails = await Promise.all(
      relationships.map(async (relationship) => {
        const doctor = await ctx.db.get(relationship.doctorId);
        const relatedAction = relationship.relatedActionId 
          ? await ctx.db.get(relationship.relatedActionId)
          : null;

        return {
          ...relationship,
          doctor,
          relatedAction,
        };
      })
    );

    return doctorsWithDetails.filter(item => item.doctor);
  },
});

// Check if a patient is assigned to a doctor
export const isPatientAssignedToDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const relationship = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => 
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return !!relationship;
  },
});

// Deactivate a doctor-patient relationship
export const deactivateRelationship = mutation({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const relationship = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => 
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (relationship) {
      await ctx.db.patch(relationship._id, {
        isActive: false,
        notes: args.notes,
      });
      return true;
    }
    return false;
  },
});

export const getDoctorPatientRelationship = query({
  args: {
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) =>
        q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

export const getDoctorPatientStats = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const allRelationships = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    const activeRelationships = allRelationships.filter(r => r.isActive);
    const referralAssignments = allRelationships.filter(r => r.assignedBy === "referral_acceptance");
    const appointmentAssignments = allRelationships.filter(r => r.assignedBy === "appointment_scheduling");

    return {
      totalPatients: activeRelationships.length,
      totalAssignments: allRelationships.length,
      referralAssignments: referralAssignments.length,
      appointmentAssignments: appointmentAssignments.length,
      activeRelationships: activeRelationships.length,
    };
  },
});

// Get doctor-patient relationship by ID
export const getById = query({
  args: { doctorPatientId: v.id("doctorPatients") },
  handler: async (ctx, args) => {
    const relationship = await ctx.db.get(args.doctorPatientId);

    if (!relationship) {
      return null;
    }

    // Get related doctor and patient details
    const doctor = await ctx.db.get(relationship.doctorId);
    const patient = await ctx.db.get(relationship.patientId);
    const relatedAction = relationship.relatedActionId
      ? await ctx.db.get(relationship.relatedActionId)
      : null;

    return {
      ...relationship,
      doctor,
      patient,
      relatedAction,
    };
  },
});
