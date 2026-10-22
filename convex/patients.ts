import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create patient profile with comprehensive healthcare data
export const createPatientProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("M"), v.literal("F"), v.literal("O"), v.literal("U")),
    primaryPhone: v.string(),
    email: v.string(),
    addressLine1: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    emergencyContactName: v.string(),
    emergencyContactPhone: v.string(),
    emergencyContactRelation: v.string(),
    // Optional fields
    secondaryPhone: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    bloodType: v.optional(v.union(
      v.literal("A+"), v.literal("A-"), v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"), v.literal("O+"), v.literal("O-")
    )),
    primaryCarePhysicianId: v.optional(v.id("doctors")),
    preferredLanguage: v.optional(v.string()),
    consentForTreatment: v.optional(v.boolean()),
    consentForDataSharing: v.optional(v.boolean()),
    advanceDirectives: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if patient profile already exists
    const existingProfile = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      throw new Error("Patient profile already exists");
    }

    // Generate unique MRN (Medical Record Number)
    const mrn = `MRN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const patientId = await ctx.db.insert("patients", {
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      primaryPhone: args.primaryPhone,
      secondaryPhone: args.secondaryPhone,
      email: args.email,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      country: args.country,
      mrn: mrn,
      nationalId: args.nationalId,
      bloodType: args.bloodType,
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      emergencyContactRelation: args.emergencyContactRelation,
      primaryCarePhysicianId: args.primaryCarePhysicianId,
      preferredLanguage: args.preferredLanguage || "English",
      consentForTreatment: args.consentForTreatment ?? true, // Default to true for basic functionality
      consentForDataSharing: args.consentForDataSharing ?? false, // Default to false for privacy
      advanceDirectives: args.advanceDirectives,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: args.userId,
      lastModifiedBy: args.userId,
    });

    return patientId;
  },
});

// Get patient profile by user ID
export const getPatientByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get patient profile by patient ID
export const getPatientById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

// Update patient profile
export const updatePatientProfile = mutation({
  args: {
    patientId: v.id("patients"),
    lastModifiedBy: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("M"), v.literal("F"), v.literal("O"), v.literal("U"))),
    primaryPhone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    email: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    bloodType: v.optional(v.union(
      v.literal("A+"), v.literal("A-"), v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"), v.literal("O+"), v.literal("O-")
    )),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelation: v.optional(v.string()),
    primaryCarePhysicianId: v.optional(v.id("doctors")),
    preferredLanguage: v.optional(v.string()),
    consentForTreatment: v.optional(v.boolean()),
    consentForDataSharing: v.optional(v.boolean()),
    advanceDirectives: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { patientId, lastModifiedBy, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(patientId, {
      ...cleanUpdates,
      lastModifiedBy,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(patientId);
  },
});

// Get patient's medical history
export const getPatientMedicalHistory = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientMedicalHistory")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Add medical history entry
export const addMedicalHistory = mutation({
  args: {
    patientId: v.id("patients"),
    condition: v.string(),
    diagnosisDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientMedicalHistory", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get patient's allergies
export const getPatientAllergies = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientAllergies")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Add allergy
export const addAllergy = mutation({
  args: {
    patientId: v.id("patients"),
    allergen: v.string(),
    reaction: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("Mild"), 
      v.literal("Moderate"), 
      v.literal("Severe")
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientAllergies", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get patient's insurance
export const getPatientInsurance = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientInsurance")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Add insurance
export const addInsurance = mutation({
  args: {
    patientId: v.id("patients"),
    providerName: v.string(),
    policyNumber: v.string(),
    coverageDetails: v.optional(v.string()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientInsurance", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Delete medical history entry
export const deleteMedicalHistory = mutation({
  args: { historyId: v.id("patientMedicalHistory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.historyId);
  },
});

// Delete allergy
export const deleteAllergy = mutation({
  args: { allergyId: v.id("patientAllergies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.allergyId);
  },
});

// Delete insurance
export const deleteInsurance = mutation({
  args: { insuranceId: v.id("patientInsurance") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.insuranceId);
  },
});
