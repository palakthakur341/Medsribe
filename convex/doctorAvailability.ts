import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Doctor Availability Management
 * 
 * This module handles doctor availability templates that define when doctors
 * are available for appointments. These templates are used to generate
 * time slots automatically.
 */

// Create or update doctor availability for a specific day
export const setDoctorAvailability = mutation({
  args: {
    doctorId: v.id("doctors"),
    dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
    startTime: v.string(),
    endTime: v.string(),
    slotDuration: v.number(),
    bufferTime: v.number(),
    breakTimes: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      reason: v.string(),
    })),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if availability already exists for this doctor and day
    const existing = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor_day", (q) => 
        q.eq("doctorId", args.doctorId).eq("dayOfWeek", args.dayOfWeek)
      )
      .first();

    if (existing) {
      // Update existing availability
      await ctx.db.patch(existing._id, {
        startTime: args.startTime,
        endTime: args.endTime,
        slotDuration: args.slotDuration,
        bufferTime: args.bufferTime,
        breakTimes: args.breakTimes,
        isActive: args.isActive,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new availability
      return await ctx.db.insert("doctorAvailability", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get doctor availability for all days
export const getDoctorAvailability = query({
  args: {
    doctorId: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
  },
});

// Get doctor availability for a specific day
export const getDoctorAvailabilityByDay = query({
  args: {
    doctorId: v.id("doctors"),
    dayOfWeek: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor_day", (q) => 
        q.eq("doctorId", args.doctorId).eq("dayOfWeek", args.dayOfWeek)
      )
      .first();
  },
});

// Bulk update doctor availability for the entire week
export const setWeeklyAvailability = mutation({
  args: {
    doctorId: v.id("doctors"),
    weeklySchedule: v.array(v.object({
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      slotDuration: v.number(),
      bufferTime: v.number(),
      breakTimes: v.array(v.object({
        startTime: v.string(),
        endTime: v.string(),
        reason: v.string(),
      })),
      isActive: v.boolean(),
    })),
  },
  handler: async (ctx, args): Promise<Id<"doctorAvailability">[]> => {
    const results: Id<"doctorAvailability">[] = [];

    for (const daySchedule of args.weeklySchedule) {
      const availabilityId: Id<"doctorAvailability"> = await ctx.runMutation(api.doctorAvailability.setDoctorAvailability, {
        doctorId: args.doctorId,
        ...daySchedule,
      });
      results.push(availabilityId);
    }

    return results;
  },
});

// Delete doctor availability for a specific day
export const deleteDoctorAvailability = mutation({
  args: {
    doctorId: v.id("doctors"),
    dayOfWeek: v.number(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor_day", (q) => 
        q.eq("doctorId", args.doctorId).eq("dayOfWeek", args.dayOfWeek)
      )
      .first();

    if (availability) {
      await ctx.db.delete(availability._id);
      return true;
    }
    return false;
  },
});

// Get all active doctors with their availability
export const getAllDoctorsAvailability = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    const doctorsWithAvailability = await Promise.all(
      doctors.map(async (doctor) => {
        const availability = await ctx.db
          .query("doctorAvailability")
          .withIndex("by_doctor_active", (q) => 
            q.eq("doctorId", doctor._id).eq("isActive", true)
          )
          .collect();

        return {
          ...doctor,
          availability,
        };
      })
    );

    return doctorsWithAvailability;
  },
});

// Validate availability times
export const validateAvailabilityTimes = query({
  args: {
    startTime: v.string(),
    endTime: v.string(),
    breakTimes: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      reason: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const errors = [];

    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(args.startTime);
    const endMinutes = timeToMinutes(args.endTime);

    // Validate start time is before end time
    if (startMinutes >= endMinutes) {
      errors.push("Start time must be before end time");
    }

    // Validate break times
    for (const breakTime of args.breakTimes) {
      const breakStartMinutes = timeToMinutes(breakTime.startTime);
      const breakEndMinutes = timeToMinutes(breakTime.endTime);

      // Break start must be before break end
      if (breakStartMinutes >= breakEndMinutes) {
        errors.push(`Break "${breakTime.reason}": start time must be before end time`);
      }

      // Break must be within working hours
      if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
        errors.push(`Break "${breakTime.reason}": must be within working hours`);
      }
    }

    // Check for overlapping breaks
    for (let i = 0; i < args.breakTimes.length; i++) {
      for (let j = i + 1; j < args.breakTimes.length; j++) {
        const break1Start = timeToMinutes(args.breakTimes[i].startTime);
        const break1End = timeToMinutes(args.breakTimes[i].endTime);
        const break2Start = timeToMinutes(args.breakTimes[j].startTime);
        const break2End = timeToMinutes(args.breakTimes[j].endTime);

        if (break1Start < break2End && break2Start < break1End) {
          errors.push(`Breaks "${args.breakTimes[i].reason}" and "${args.breakTimes[j].reason}" overlap`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

// Get availability summary for a doctor
export const getDoctorAvailabilitySummary = query({
  args: {
    doctorId: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor_active", (q) => 
        q.eq("doctorId", args.doctorId).eq("isActive", true)
      )
      .collect();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const summary = availability.map(avail => ({
      dayOfWeek: avail.dayOfWeek,
      dayName: daysOfWeek[avail.dayOfWeek],
      startTime: avail.startTime,
      endTime: avail.endTime,
      slotDuration: avail.slotDuration,
      bufferTime: avail.bufferTime,
      breakCount: avail.breakTimes.length,
      totalBreakTime: avail.breakTimes.reduce((total, breakTime) => {
        const start = breakTime.startTime.split(':').map(Number);
        const end = breakTime.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        return total + (endMinutes - startMinutes);
      }, 0),
    }));

    return summary.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },
});
