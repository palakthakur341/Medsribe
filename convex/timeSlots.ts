import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Time Slot Generation and Management
 * 
 * This module handles the generation and management of time slots based on
 * doctor availability templates. It provides fast slot lookup and booking
 * capabilities with conflict prevention.
 */

// Generate time slots for a specific doctor and date range
export const generateTimeSlots = mutation({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.string(), // "2025-07-15"
    endDate: v.string(),   // "2025-08-15"
  },
  handler: async (ctx, args) => {
    const { doctorId, startDate, endDate } = args;
    const now = Date.now();
    
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

    const generatedSlots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Iterate through each date in the range
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Find availability template for this day
      const template = availabilityTemplates.find(t => t.dayOfWeek === dayOfWeek);
      if (!template) continue;

      // Check if slots already exist for this date
      const existingSlots = await ctx.db
        .query("timeSlots")
        .withIndex("by_doctor_date", (q) => 
          q.eq("doctorId", doctorId).eq("date", dateString)
        )
        .collect();

      if (existingSlots.length > 0) continue; // Skip if slots already exist

      // Generate slots for this day
      const daySlots = generateDaySlots(template, dateString, now);
      generatedSlots.push(...daySlots);
    }

    // Insert all generated slots
    const insertPromises = generatedSlots.map(slot => ctx.db.insert("timeSlots", slot));
    const insertedIds = await Promise.all(insertPromises);

    return {
      generatedCount: insertedIds.length,
      dateRange: { startDate, endDate },
      slotIds: insertedIds,
    };
  },
});

// Helper function to generate slots for a single day
function generateDaySlots(template: any, date: string, createdAt: number) {
  const slots = [];
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(template.startTime);
  const endMinutes = timeToMinutes(template.endTime);
  let currentMinutes = startMinutes;

  while (currentMinutes < endMinutes) {
    const slotStartTime = minutesToTime(currentMinutes);
    const slotEndTime = minutesToTime(currentMinutes + template.slotDuration);

    // Check if this slot conflicts with any break times
    const isBreakTime = template.breakTimes.some((breakTime: any) => {
      const breakStart = timeToMinutes(breakTime.startTime);
      const breakEnd = timeToMinutes(breakTime.endTime);
      return currentMinutes < breakEnd && (currentMinutes + template.slotDuration) > breakStart;
    });

    if (isBreakTime) {
      // Find the break that conflicts and create a break slot
      const conflictingBreak = template.breakTimes.find((breakTime: any) => {
        const breakStart = timeToMinutes(breakTime.startTime);
        const breakEnd = timeToMinutes(breakTime.endTime);
        return currentMinutes < breakEnd && (currentMinutes + template.slotDuration) > breakStart;
      });

      if (conflictingBreak) {
        const breakStart = timeToMinutes(conflictingBreak.startTime);
        const breakEnd = timeToMinutes(conflictingBreak.endTime);
        
        // Skip to the end of the break
        currentMinutes = breakEnd;
        continue;
      }
    }

    // Create available slot
    slots.push({
      doctorId: template.doctorId,
      date,
      time: slotStartTime,
      endTime: slotEndTime,
      slotType: "available" as const,
      appointmentId: undefined,
      isRecurring: true,
      generatedFrom: "template" as const,
      createdAt,
    });

    currentMinutes += template.slotDuration + template.bufferTime;
  }

  return slots;
}

// Get available slots for a doctor on a specific date
export const getAvailableSlots = query({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_date_available", (q) => 
        q.eq("doctorId", args.doctorId)
         .eq("date", args.date)
         .eq("slotType", "available")
      )
      .collect();
  },
});

// Get available slots for a doctor within a date range
export const getAvailableSlotsInRange = query({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_available", (q) => 
        q.eq("doctorId", args.doctorId).eq("slotType", "available")
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Group by date for easier frontend consumption
    const slotsByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, typeof slots>);

    return slotsByDate;
  },
});

// Book a time slot (mark as booked)
export const bookTimeSlot = mutation({
  args: {
    slotId: v.id("timeSlots"),
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    
    if (!slot) {
      throw new Error("Time slot not found");
    }

    if (slot.slotType !== "available") {
      throw new Error("Time slot is not available for booking");
    }

    // Atomic update to prevent double booking
    await ctx.db.patch(args.slotId, {
      slotType: "booked",
      appointmentId: args.appointmentId,
      updatedAt: Date.now(),
    });

    return slot;
  },
});

// Release a time slot (mark as available)
export const releaseTimeSlot = mutation({
  args: {
    slotId: v.id("timeSlots"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    
    if (!slot) {
      throw new Error("Time slot not found");
    }

    await ctx.db.patch(args.slotId, {
      slotType: "available",
      appointmentId: undefined,
      updatedAt: Date.now(),
    });

    return slot;
  },
});

// Block time slots (for doctor unavailability)
export const blockTimeSlots = mutation({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { doctorId, date, startTime, endTime, reason } = args;

    let slotsToBlock;

    if (startTime && endTime) {
      // Block specific time range
      slotsToBlock = await ctx.db
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
      // Block entire day
      slotsToBlock = await ctx.db
        .query("timeSlots")
        .withIndex("by_doctor_date", (q) => 
          q.eq("doctorId", doctorId).eq("date", date)
        )
        .collect();
    }

    // Update slots to blocked status
    const updatePromises = slotsToBlock.map(slot => 
      ctx.db.patch(slot._id, {
        slotType: "blocked",
        updatedAt: Date.now(),
      })
    );

    await Promise.all(updatePromises);

    return {
      blockedCount: slotsToBlock.length,
      blockedSlots: slotsToBlock.map(s => s._id),
    };
  },
});

// Get all slots for a doctor on a specific date
export const getDoctorDaySlots = query({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_date", (q) => 
        q.eq("doctorId", args.doctorId).eq("date", args.date)
      )
      .collect();

    // Sort by time
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  },
});

// Get slot statistics for a doctor
export const getDoctorSlotStats = query({
  args: {
    doctorId: v.id("doctors"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const stats = {
      total: slots.length,
      available: slots.filter(s => s.slotType === "available").length,
      booked: slots.filter(s => s.slotType === "booked").length,
      blocked: slots.filter(s => s.slotType === "blocked").length,
      break: slots.filter(s => s.slotType === "break").length,
    };

    return {
      ...stats,
      utilizationRate: stats.total > 0 ? (stats.booked / (stats.total - stats.break)) * 100 : 0,
    };
  },
});
