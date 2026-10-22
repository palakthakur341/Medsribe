import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Doctor Exception Management
 * 
 * This module handles doctor unavailability exceptions such as vacation,
 * sick days, conferences, etc. It automatically blocks affected time slots
 * and can notify patients with existing appointments.
 */

// Create a doctor exception (vacation, sick day, etc.)
export const createDoctorException = mutation({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
    exceptionType: v.union(
      v.literal("vacation"),
      v.literal("sick"),
      v.literal("conference"),
      v.literal("emergency"),
      v.literal("personal"),
      v.literal("training")
    ),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringPattern: v.optional(v.object({
      frequency: v.union(v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      endDate: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { doctorId, date, startTime, endTime, reason, exceptionType } = args;

    // Find affected time slots
    let affectedSlots;
    
    if (startTime && endTime) {
      // Partial day exception
      affectedSlots = await ctx.db
        .query("timeSlots")
        .withIndex("by_doctor_date", (q) => 
          q.eq("doctorId", doctorId).eq("date", date)
        )
        .filter((q) => 
          q.and(
            q.gte(q.field("time"), startTime),
            q.lte(q.field("endTime"), endTime)
          )
        )
        .collect();
    } else {
      // Full day exception
      affectedSlots = await ctx.db
        .query("timeSlots")
        .withIndex("by_doctor_date", (q) => 
          q.eq("doctorId", doctorId).eq("date", date)
        )
        .collect();
    }

    // Get appointments that will be affected
    const affectedAppointments = [];
    for (const slot of affectedSlots) {
      if (slot.appointmentId) {
        const appointment = await ctx.db.get(slot.appointmentId);
        if (appointment && appointment.status === "scheduled") {
          affectedAppointments.push(appointment);
        }
      }
    }

    // Block the affected slots
    const blockPromises = affectedSlots.map(slot => 
      ctx.db.patch(slot._id, {
        slotType: "blocked",
        updatedAt: now,
      })
    );
    await Promise.all(blockPromises);

    // Create the exception record
    const exceptionId = await ctx.db.insert("doctorExceptions", {
      doctorId,
      date,
      exceptionType,
      startTime,
      endTime,
      reason,
      affectedSlots: affectedSlots.map(s => s._id),
      isRecurring: args.isRecurring || false,
      recurringPattern: args.recurringPattern,
      createdAt: now,
      updatedAt: now,
      createdBy: doctorId as any, // Assuming doctor creates their own exceptions
    });

    return {
      exceptionId,
      affectedSlotsCount: affectedSlots.length,
      affectedAppointments: affectedAppointments.map(a => a._id),
    };
  },
});

// Get doctor exceptions for a date range
export const getDoctorExceptions = query({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("doctorExceptions")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId));

    if (args.startDate && args.endDate) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate!),
          q.lte(q.field("date"), args.endDate!)
        )
      );
    }

    return await query.collect();
  },
});

// Update a doctor exception
export const updateDoctorException = mutation({
  args: {
    exceptionId: v.id("doctorExceptions"),
    reason: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const exception = await ctx.db.get(args.exceptionId);
    if (!exception) {
      throw new Error("Exception not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.reason !== undefined) updates.reason = args.reason;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;

    await ctx.db.patch(args.exceptionId, updates);
    return exception;
  },
});

// Delete a doctor exception and restore affected slots
export const deleteDoctorException = mutation({
  args: {
    exceptionId: v.id("doctorExceptions"),
  },
  handler: async (ctx, args) => {
    const exception = await ctx.db.get(args.exceptionId);
    if (!exception) {
      throw new Error("Exception not found");
    }

    // Restore affected slots to available status (if they're not booked)
    const restorePromises = exception.affectedSlots.map(async (slotId) => {
      const slot = await ctx.db.get(slotId);
      if (slot && slot.slotType === "blocked" && !slot.appointmentId) {
        await ctx.db.patch(slotId, {
          slotType: "available",
          updatedAt: Date.now(),
        });
      }
    });

    await Promise.all(restorePromises);

    // Delete the exception
    await ctx.db.delete(args.exceptionId);

    return {
      deletedExceptionId: args.exceptionId,
      restoredSlotsCount: exception.affectedSlots.length,
    };
  },
});

// Get exceptions by type
export const getExceptionsByType = query({
  args: {
    doctorId: v.id("doctors"),
    exceptionType: v.union(
      v.literal("vacation"),
      v.literal("sick"),
      v.literal("conference"),
      v.literal("emergency"),
      v.literal("personal"),
      v.literal("training")
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("doctorExceptions")
      .withIndex("by_doctor_type", (q) => 
        q.eq("doctorId", args.doctorId).eq("exceptionType", args.exceptionType)
      );

    if (args.startDate && args.endDate) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate!),
          q.lte(q.field("date"), args.endDate!)
        )
      );
    }

    return await query.collect();
  },
});

// Check if a doctor has any exceptions on a specific date
export const checkDoctorAvailabilityOnDate = query({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const exceptions = await ctx.db
      .query("doctorExceptions")
      .withIndex("by_doctor_date", (q) => 
        q.eq("doctorId", args.doctorId).eq("date", args.date)
      )
      .collect();

    if (exceptions.length === 0) {
      return { isAvailable: true, exceptions: [] };
    }

    // If checking a specific time
    if (args.time) {
      const timeMinutes = timeToMinutes(args.time);
      
      const conflictingExceptions = exceptions.filter(exception => {
        // Full day exceptions always conflict
        if (!exception.startTime || !exception.endTime) {
          return true;
        }

        const exceptionStart = timeToMinutes(exception.startTime);
        const exceptionEnd = timeToMinutes(exception.endTime);
        
        return timeMinutes >= exceptionStart && timeMinutes < exceptionEnd;
      });

      return {
        isAvailable: conflictingExceptions.length === 0,
        exceptions: conflictingExceptions,
      };
    }

    // If not checking specific time, return all exceptions for the date
    return {
      isAvailable: false,
      exceptions,
    };
  },
});

// Get recurring exceptions and generate future instances
export const getRecurringExceptions = query({
  args: {
    doctorId: v.id("doctors"),
    lookAheadDays: v.optional(v.number()), // Default 90 days
  },
  handler: async (ctx, args) => {
    const lookAhead = args.lookAheadDays || 90;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + lookAhead);
    const endDateString = endDate.toISOString().split('T')[0];

    const recurringExceptions = await ctx.db
      .query("doctorExceptions")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isRecurring"), true))
      .collect();

    const futureInstances = [];

    for (const exception of recurringExceptions) {
      if (!exception.recurringPattern) continue;

      const { frequency, interval, endDate: patternEndDate } = exception.recurringPattern;
      const startDate = new Date(exception.date);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (patternEndDate && currentDate > new Date(patternEndDate)) {
          break;
        }

        const dateString = currentDate.toISOString().split('T')[0];
        if (dateString !== exception.date) { // Don't include the original
          futureInstances.push({
            ...exception,
            date: dateString,
            isGeneratedInstance: true,
            originalExceptionId: exception._id,
          });
        }

        // Calculate next occurrence
        if (frequency === "weekly") {
          currentDate.setDate(currentDate.getDate() + (7 * interval));
        } else if (frequency === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
      }
    }

    return {
      recurringExceptions,
      futureInstances,
    };
  },
});

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get exception statistics for a doctor
export const getDoctorExceptionStats = query({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const exceptions = await ctx.db
      .query("doctorExceptions")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const stats = {
      total: exceptions.length,
      vacation: exceptions.filter(e => e.exceptionType === "vacation").length,
      sick: exceptions.filter(e => e.exceptionType === "sick").length,
      conference: exceptions.filter(e => e.exceptionType === "conference").length,
      emergency: exceptions.filter(e => e.exceptionType === "emergency").length,
      personal: exceptions.filter(e => e.exceptionType === "personal").length,
      training: exceptions.filter(e => e.exceptionType === "training").length,
      recurring: exceptions.filter(e => e.isRecurring).length,
    };

    return stats;
  },
});
