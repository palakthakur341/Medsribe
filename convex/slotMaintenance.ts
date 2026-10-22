import { v } from "convex/values";
import { mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Slot Maintenance and Background Jobs
 * 
 * This module handles automated slot generation, cleanup, and optimization
 * tasks that run in the background to maintain the appointment system.
 */

// Generate slots for all active doctors for the next N days
export const generateSlotsForAllDoctors = action({
  args: {
    daysAhead: v.optional(v.number()), // Default 90 days
  },
  handler: async (ctx, args): Promise<{
    totalDoctors: number;
    results: Array<{
      doctorId: Id<"doctors">;
      doctorName: string;
      generatedCount?: number;
      dateRange?: { startDate: string; endDate: string };
      slotIds?: Id<"timeSlots">[];
      error?: string;
    }>;
    dateRange: { startDate: string; endDate: string };
  }> => {
    const daysAhead = args.daysAhead || 90;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // Get all active doctors
    const doctors: Array<{
      _id: Id<"doctors">;
      firstName: string;
      lastName: string;
    }> = await ctx.runQuery(internal.slotMaintenance.getActiveDoctors);

    const results: Array<{
      doctorId: Id<"doctors">;
      doctorName: string;
      generatedCount?: number;
      dateRange?: { startDate: string; endDate: string };
      slotIds?: Id<"timeSlots">[];
      error?: string;
    }> = [];

    for (const doctor of doctors) {
      try {
        const result: {
          generatedCount: number;
          dateRange: { startDate: string; endDate: string };
          slotIds: Id<"timeSlots">[];
        } = await ctx.runMutation(api.timeSlots.generateTimeSlots, {
          doctorId: doctor._id,
          startDate: startDateString,
          endDate: endDateString,
        });
        results.push({
          doctorId: doctor._id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          ...result,
        });
      } catch (error) {
        console.error(`Failed to generate slots for doctor ${doctor._id}:`, error);
        results.push({
          doctorId: doctor._id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      totalDoctors: doctors.length,
      results,
      dateRange: { startDate: startDateString, endDate: endDateString },
    };
  },
});

// Internal query to get active doctors
export const getActiveDoctors = internalQuery({
  args: {},
  handler: async (ctx): Promise<Array<{
    _id: Id<"doctors">;
    firstName: string;
    lastName: string;
  }>> => {
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    return doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
    }));
  },
});

// Clean up old time slots (older than specified days)
export const cleanupOldSlots = mutation({
  args: {
    olderThanDays: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const olderThanDays = args.olderThanDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    // Find old slots
    const oldSlots = await ctx.db
      .query("timeSlots")
      .withIndex("by_date_range", (q) => q.lt("date", cutoffDateString))
      .collect();

    // Delete old slots
    const deletePromises = oldSlots.map(slot => ctx.db.delete(slot._id));
    await Promise.all(deletePromises);

    return {
      deletedCount: oldSlots.length,
      cutoffDate: cutoffDateString,
    };
  },
});

// Optimize slot arrangements for a doctor
export const optimizeDoctorSlots = mutation({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { doctorId, date } = args;

    // Get all slots for the day
    const daySlots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_date", (q) => 
        q.eq("doctorId", doctorId).eq("date", date)
      )
      .collect();

    if (daySlots.length === 0) {
      return { message: "No slots found for optimization" };
    }

    // Sort slots by time
    const sortedSlots = daySlots.sort((a, b) => a.time.localeCompare(b.time));

    // Find gaps between booked appointments that could be filled
    const optimizations = [];
    
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = sortedSlots[i];
      const nextSlot = sortedSlots[i + 1];

      if (currentSlot.slotType === "booked" && nextSlot.slotType === "booked") {
        // Check if there are available slots between them
        const gapSlots = sortedSlots.filter(slot => 
          slot.time > currentSlot.endTime && 
          slot.time < nextSlot.time &&
          slot.slotType === "available"
        );

        if (gapSlots.length > 0) {
          optimizations.push({
            type: "gap_optimization",
            between: [currentSlot._id, nextSlot._id],
            availableSlots: gapSlots.map(s => s._id),
            suggestion: "Consider consolidating appointments to reduce gaps",
          });
        }
      }
    }

    // Check for isolated single slots
    const isolatedSlots = sortedSlots.filter((slot, index) => {
      if (slot.slotType !== "available") return false;
      
      const prevSlot = sortedSlots[index - 1];
      const nextSlot = sortedSlots[index + 1];
      
      return (
        (!prevSlot || prevSlot.slotType !== "available") &&
        (!nextSlot || nextSlot.slotType !== "available")
      );
    });

    if (isolatedSlots.length > 0) {
      optimizations.push({
        type: "isolated_slots",
        slots: isolatedSlots.map(s => s._id),
        suggestion: "Consider blocking isolated slots to create larger available blocks",
      });
    }

    return {
      date,
      totalSlots: daySlots.length,
      optimizations,
      stats: {
        available: sortedSlots.filter(s => s.slotType === "available").length,
        booked: sortedSlots.filter(s => s.slotType === "booked").length,
        blocked: sortedSlots.filter(s => s.slotType === "blocked").length,
      },
    };
  },
});

// Generate missing slots for a specific date range
export const generateMissingSlots = mutation({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { doctorId, startDate, endDate } = args;

    // Get doctor availability templates
    const availabilityTemplates = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor_active", (q) => 
        q.eq("doctorId", doctorId).eq("isActive", true)
      )
      .collect();

    if (availabilityTemplates.length === 0) {
      throw new Error("No availability templates found for doctor");
    }

    const missingDates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check each date in the range
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Check if there's an availability template for this day
      const template = availabilityTemplates.find(t => t.dayOfWeek === dayOfWeek);
      if (!template) continue;

      // Check if slots already exist for this date
      const existingSlots = await ctx.db
        .query("timeSlots")
        .withIndex("by_doctor_date", (q) => 
          q.eq("doctorId", doctorId).eq("date", dateString)
        )
        .collect();

      if (existingSlots.length === 0) {
        missingDates.push(dateString);
      }
    }

    // Generate slots for missing dates
    let totalGenerated = 0;
    for (const missingDate of missingDates) {
      const result = await ctx.runMutation(api.timeSlots.generateTimeSlots, {
        doctorId,
        startDate: missingDate,
        endDate: missingDate,
      });
      totalGenerated += result.generatedCount;
    }

    return {
      missingDates,
      totalGenerated,
      dateRange: { startDate, endDate },
    };
  },
});

// Update slot durations based on appointment type preferences
export const updateSlotDurations = mutation({
  args: {
    doctorId: v.id("doctors"),
    appointmentTypeDurations: v.object({
      new_patient: v.optional(v.number()),
      follow_up: v.optional(v.number()),
      consultation: v.optional(v.number()),
      procedure: v.optional(v.number()),
      telemedicine: v.optional(v.number()),
      emergency: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // This would update the doctor's availability templates
    // to use different slot durations for different appointment types
    
    const availabilityTemplates = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    const updates = [];
    
    for (const template of availabilityTemplates) {
      // For now, we'll just update the default slot duration
      // In a more advanced system, we could have different durations per appointment type
      const defaultDuration = args.appointmentTypeDurations.consultation || template.slotDuration;
      
      await ctx.db.patch(template._id, {
        slotDuration: defaultDuration,
        updatedAt: Date.now(),
      });
      
      updates.push({
        templateId: template._id,
        dayOfWeek: template.dayOfWeek,
        oldDuration: template.slotDuration,
        newDuration: defaultDuration,
      });
    }

    return {
      doctorId: args.doctorId,
      updatedTemplates: updates.length,
      updates,
    };
  },
});

// Get maintenance statistics
export const getMaintenanceStats = mutation({
  args: {
    daysBack: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const daysBack = args.daysBack || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateString = startDate.toISOString().split('T')[0];

    // Get slot statistics
    const allSlots = await ctx.db
      .query("timeSlots")
      .withIndex("by_date_range", (q) => q.gte("date", startDateString))
      .collect();

    const stats = {
      totalSlots: allSlots.length,
      available: allSlots.filter(s => s.slotType === "available").length,
      booked: allSlots.filter(s => s.slotType === "booked").length,
      blocked: allSlots.filter(s => s.slotType === "blocked").length,
      break: allSlots.filter(s => s.slotType === "break").length,
    };

    // Get doctor count
    const activeDoctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    // Get appointment statistics
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_datetime", (q) => q.gte("appointmentDateTime", startDate.getTime()))
      .collect();

    return {
      dateRange: { startDate: startDateString, endDate: new Date().toISOString().split('T')[0] },
      slotStats: {
        ...stats,
        utilizationRate: stats.totalSlots > 0 ? (stats.booked / stats.totalSlots) * 100 : 0,
      },
      doctorStats: {
        totalActiveDoctors: activeDoctors.length,
        averageSlotsPerDoctor: activeDoctors.length > 0 ? stats.totalSlots / activeDoctors.length : 0,
      },
      appointmentStats: {
        totalAppointments: appointments.length,
        scheduled: appointments.filter(a => a.status === "scheduled").length,
        completed: appointments.filter(a => a.status === "completed").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
      },
    };
  },
});
