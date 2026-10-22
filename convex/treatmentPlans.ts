import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    doctorPatientId: v.id("doctorPatients"),
    soapNoteId: v.optional(v.id("soapNotes")),
    title: v.string(),
    diagnosis: v.string(),
    plan: v.string(),
    goals: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),

    // New fields for enhanced treatment management
    medicationDetails: v.optional(v.array(v.object({
      name: v.string(),
      genericName: v.optional(v.string()),
      strength: v.string(),
      dosageForm: v.string(),
      ndc: v.optional(v.string()),
      rxcui: v.optional(v.string()),
      quantity: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      instructions: v.string(),
      refills: v.number(),
    }))),
    pharmacyId: v.optional(v.id("pharmacies")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("treatmentPlans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByDoctorPatientId = query({
  args: { doctorPatientId: v.id("doctorPatients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("treatmentPlans")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", args.doctorPatientId))
      .order("desc")
      .collect();
  },
});

export const getActiveByDoctorPatientId = query({
  args: { doctorPatientId: v.id("doctorPatients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("treatmentPlans")
      .withIndex("by_doctor_patient_status", (q) =>
        q.eq("doctorPatientId", args.doctorPatientId).eq("status", "active")
      )
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a treatment plan
export const update = mutation({
  args: {
    id: v.id("treatmentPlans"),
    title: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    plan: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    )),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),

    // New fields for enhanced treatment management
    medicationDetails: v.optional(v.array(v.object({
      name: v.string(),
      genericName: v.optional(v.string()),
      strength: v.string(),
      dosageForm: v.string(),
      ndc: v.optional(v.string()),
      rxcui: v.optional(v.string()),
      quantity: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      instructions: v.string(),
      refills: v.number(),
    }))),
    pharmacyId: v.optional(v.id("pharmacies")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a treatment plan
export const remove = mutation({
  args: { id: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getWithDetailsById = query({
  args: { id: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    const treatmentPlan = await ctx.db.get(args.id);
    if (!treatmentPlan) return null;

    const doctorPatient = await ctx.db.get(treatmentPlan.doctorPatientId);
    if (!doctorPatient) return null;

    const patient = await ctx.db.get(doctorPatient.patientId);
    const doctor = await ctx.db.get(doctorPatient.doctorId);
    const soapNote = treatmentPlan.soapNoteId
      ? await ctx.db.get(treatmentPlan.soapNoteId)
      : null;

    // Get pharmacy details if pharmacyId exists
    const pharmacy = treatmentPlan.pharmacyId
      ? await ctx.db.get(treatmentPlan.pharmacyId)
      : null;

    return {
      ...treatmentPlan,
      doctorPatient,
      patient,
      doctor,
      soapNote,
      pharmacy,
    };
  },
});

export const getWithDetailsByDoctorPatientId = query({
  args: { doctorPatientId: v.id("doctorPatients") },
  handler: async (ctx, args) => {
    const treatmentPlans = await ctx.db
      .query("treatmentPlans")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", args.doctorPatientId))
      .order("desc")
      .collect();

    const doctorPatient = await ctx.db.get(args.doctorPatientId);
    if (!doctorPatient) return [];

    const patient = await ctx.db.get(doctorPatient.patientId);
    const doctor = await ctx.db.get(doctorPatient.doctorId);

    const enrichedPlans = await Promise.all(
      treatmentPlans.map(async (plan) => {
        const soapNote = plan.soapNoteId
          ? await ctx.db.get(plan.soapNoteId)
          : null;

        // Get pharmacy details if pharmacyId exists
        const pharmacy = plan.pharmacyId
          ? await ctx.db.get(plan.pharmacyId)
          : null;

        return {
          ...plan,
          doctorPatient,
          patient,
          doctor,
          soapNote,
          pharmacy,
        };
      })
    );

    return enrichedPlans;
  },
});

// Get treatment plans with details by patient ID (enhanced version)
export const getWithDetailsByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    // Get all doctor-patient relationships for this patient
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allTreatmentPlans = [];

    for (const doctorPatient of doctorPatients) {
      const treatmentPlans = await ctx.db
        .query("treatmentPlans")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .order("desc")
        .collect();

      const doctor = await ctx.db.get(doctorPatient.doctorId);
      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const plan of treatmentPlans) {
        const soapNote = plan.soapNoteId
          ? await ctx.db.get(plan.soapNoteId)
          : null;

        // Get pharmacy details if pharmacyId exists
        const pharmacy = plan.pharmacyId
          ? await ctx.db.get(plan.pharmacyId)
          : null;

        allTreatmentPlans.push({
          ...plan,
          doctorPatient,
          patient,
          doctor,
          soapNote,
          pharmacy,
        });
      }
    }

    return allTreatmentPlans.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  },
});
