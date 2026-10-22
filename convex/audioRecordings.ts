import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new audio recording record
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    fileName: v.string(),
    fileSize: v.number(),
    duration: v.optional(v.number()),
    mimeType: v.string(),
    storageId: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("audioRecordings", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get audio recordings by patient ID
export const getByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audioRecordings")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Get a specific audio recording by ID
export const getById = query({
  args: { id: v.id("audioRecordings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update audio recording status
export const updateStatus = mutation({
  args: {
    id: v.id("audioRecordings"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    ),
    duration: v.optional(v.number()),
    storageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete an audio recording
export const remove = mutation({
  args: { id: v.id("audioRecordings") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get audio recordings by status
export const getByStatus = query({
  args: { 
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audioRecordings")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get recent audio recordings for a patient
export const getRecentByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audioRecordings")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(10);
  },
});

// Get audio recording statistics for a patient
export const getStatsByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const recordings = await ctx.db
      .query("audioRecordings")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();

    const totalRecordings = recordings.length;
    const totalSize = recordings.reduce((sum, recording) => sum + recording.fileSize, 0);
    const totalDuration = recordings
      .filter(recording => recording.duration !== undefined)
      .reduce((sum, recording) => sum + (recording.duration || 0), 0);
    
    const statusCounts = recordings.reduce((counts, recording) => {
      counts[recording.status] = (counts[recording.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalRecordings,
      totalSize,
      totalDuration,
      statusCounts,
    };
  },
});
