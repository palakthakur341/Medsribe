import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Real-time Slot Availability API
 * 
 * This module provides fast, real-time availability checking with conflict
 * prevention and optimized queries for the appointment booking system.
 */

// Get available slots for multiple doctors within a date range
export const getMultiDoctorAvailability = query({
  args: {
    doctorIds: v.array(v.id("doctors")),
    startDate: v.string(),
    endDate: v.string(),
    appointmentType: v.optional(v.union(
      v.literal("new_patient"),
      v.literal("follow_up"),
      v.literal("consultation"),
      v.literal("procedure"),
      v.literal("telemedicine"),
      v.literal("emergency")
    )),
  },
  handler: async (ctx, args) => {
    const { doctorIds, startDate, endDate, appointmentType } = args;
    
    const doctorAvailability = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const slots = await ctx.db
          .query("timeSlots")
          .withIndex("by_doctor_available", (q) => 
            q.eq("doctorId", doctorId).eq("slotType", "available")
          )
          .filter((q) => 
            q.and(
              q.gte(q.field("date"), startDate),
              q.lte(q.field("date"), endDate)
            )
          )
          .collect();

        // Get doctor info
        const doctor = await ctx.db.get(doctorId);
        
        // Group slots by date
        const slotsByDate = slots.reduce((acc, slot) => {
          if (!acc[slot.date]) {
            acc[slot.date] = [];
          }
          acc[slot.date].push(slot);
          return acc;
        }, {} as Record<string, typeof slots>);

        return {
          doctorId,
          doctor,
          totalSlots: slots.length,
          slotsByDate,
        };
      })
    );

    return doctorAvailability;
  },
});

// Get next available slot for a doctor
export const getNextAvailableSlot = query({
  args: {
    doctorId: v.id("doctors"),
    fromDate: v.optional(v.string()), // Default to today
    appointmentType: v.optional(v.union(
      v.literal("new_patient"),
      v.literal("follow_up"),
      v.literal("consultation"),
      v.literal("procedure"),
      v.literal("telemedicine"),
      v.literal("emergency")
    )),
  },
  handler: async (ctx, args) => {
    const fromDate = args.fromDate || new Date().toISOString().split('T')[0];
    
    const nextSlot = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_available", (q) => 
        q.eq("doctorId", args.doctorId).eq("slotType", "available")
      )
      .filter((q) => q.gte(q.field("date"), fromDate))
      .order("asc")
      .first();

    if (!nextSlot) {
      return null;
    }

    // Get doctor info
    const doctor = await ctx.db.get(args.doctorId);

    return {
      slot: nextSlot,
      doctor,
      dateTime: new Date(`${nextSlot.date}T${nextSlot.time}`).getTime(),
    };
  },
});

// Check if a specific time slot is available
export const checkSlotAvailability = query({
  args: {
    doctorId: v.id("doctors"),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_date_time", (q) => 
        q.eq("doctorId", args.doctorId)
         .eq("date", args.date)
         .eq("time", args.time)
      )
      .first();

    if (!slot) {
      return {
        isAvailable: false,
        reason: "No slot exists for this time",
        slot: null,
      };
    }

    return {
      isAvailable: slot.slotType === "available",
      reason: slot.slotType !== "available" ? `Slot is ${slot.slotType}` : null,
      slot,
    };
  },
});

// Get availability summary for a doctor's week
export const getWeeklyAvailabilitySummary = query({
  args: {
    doctorId: v.id("doctors"),
    weekStartDate: v.string(), // Monday of the week
  },
  handler: async (ctx, args) => {
    const weekStart = new Date(args.weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
    
    const weekEndString = weekEnd.toISOString().split('T')[0];

    const slots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.weekStartDate),
          q.lte(q.field("date"), weekEndString)
        )
      )
      .collect();

    // Group by date and calculate stats
    const dailyStats: Record<string, {
      dayName: string;
      total: number;
      available: number;
      booked: number;
      blocked: number;
      utilizationRate: number;
    }> = {};
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      const daySlots = slots.filter(s => s.date === dateString);

      dailyStats[dateString] = {
        dayName: daysOfWeek[currentDate.getDay()],
        total: daySlots.length,
        available: daySlots.filter(s => s.slotType === "available").length,
        booked: daySlots.filter(s => s.slotType === "booked").length,
        blocked: daySlots.filter(s => s.slotType === "blocked").length,
        utilizationRate: daySlots.length > 0 ?
          (daySlots.filter(s => s.slotType === "booked").length / daySlots.length) * 100 : 0,
      };
    }

    const weekTotal = {
      total: slots.length,
      available: slots.filter(s => s.slotType === "available").length,
      booked: slots.filter(s => s.slotType === "booked").length,
      blocked: slots.filter(s => s.slotType === "blocked").length,
      utilizationRate: slots.length > 0 ? 
        (slots.filter(s => s.slotType === "booked").length / slots.length) * 100 : 0,
    };

    return {
      weekStartDate: args.weekStartDate,
      weekEndDate: weekEndString,
      dailyStats,
      weekTotal,
    };
  },
});

// Find alternative slots when preferred time is not available
export const findAlternativeSlots = query({
  args: {
    doctorId: v.id("doctors"),
    preferredDate: v.string(),
    preferredTime: v.string(),
    searchRadius: v.optional(v.number()), // Days before/after to search
    maxResults: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchRadius = args.searchRadius || 7; // Default 1 week
    const maxResults = args.maxResults || 10;
    
    const preferredDateTime = new Date(`${args.preferredDate}T${args.preferredTime}`);
    const startDate = new Date(preferredDateTime);
    startDate.setDate(startDate.getDate() - searchRadius);
    const endDate = new Date(preferredDateTime);
    endDate.setDate(endDate.getDate() + searchRadius);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const availableSlots = await ctx.db
      .query("timeSlots")
      .withIndex("by_doctor_available", (q) => 
        q.eq("doctorId", args.doctorId).eq("slotType", "available")
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), startDateString),
          q.lte(q.field("date"), endDateString)
        )
      )
      .collect();

    // Calculate similarity score based on time difference
    const slotsWithScore = availableSlots.map(slot => {
      const slotDateTime = new Date(`${slot.date}T${slot.time}`);
      const timeDiff = Math.abs(slotDateTime.getTime() - preferredDateTime.getTime());
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      return {
        ...slot,
        score: Math.max(0, 100 - (daysDiff * 10)), // Higher score for closer times
        daysDifference: daysDiff,
        isPreferredDate: slot.date === args.preferredDate,
        isPreferredTime: slot.time === args.preferredTime,
      };
    });

    // Sort by score (closest to preferred time first)
    const sortedSlots = slotsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return {
      preferredDateTime: preferredDateTime.getTime(),
      alternativeSlots: sortedSlots,
      searchRadius,
      totalFound: availableSlots.length,
    };
  },
});

// Bulk check availability for multiple time slots
export const bulkCheckAvailability = query({
  args: {
    slotChecks: v.array(v.object({
      doctorId: v.id("doctors"),
      date: v.string(),
      time: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.slotChecks.map(async (check) => {
        const slot = await ctx.db
          .query("timeSlots")
          .withIndex("by_doctor_date_time", (q) => 
            q.eq("doctorId", check.doctorId)
             .eq("date", check.date)
             .eq("time", check.time)
          )
          .first();

        return {
          ...check,
          isAvailable: slot?.slotType === "available",
          slotType: slot?.slotType || "not_found",
          slotId: slot?._id,
        };
      })
    );

    return results;
  },
});

// Get peak availability times for a doctor
export const getPeakAvailabilityTimes = query({
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

    // Group by time of day
    const timeStats: Record<string, {
      time: string;
      count: number;
      dates: string[];
    }> = {};

    slots.forEach(slot => {
      const time = slot.time;
      if (!timeStats[time]) {
        timeStats[time] = {
          time,
          count: 0,
          dates: [],
        };
      }
      timeStats[time].count++;
      timeStats[time].dates.push(slot.date);
    });

    // Sort by availability count
    const sortedTimes = Object.values(timeStats)
      .sort((a: any, b: any) => b.count - a.count);

    return {
      peakTimes: sortedTimes.slice(0, 5), // Top 5 most available times
      totalSlots: slots.length,
      dateRange: { startDate: args.startDate, endDate: args.endDate },
    };
  },
});

// Reserve a slot temporarily (for booking flow)
export const reserveSlotTemporarily = mutation({
  args: {
    slotId: v.id("timeSlots"),
    reservationDuration: v.optional(v.number()), // Minutes, default 15
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.slotType !== "available") {
      throw new Error("Slot is not available for reservation");
    }

    const reservationDuration = args.reservationDuration || 15; // 15 minutes default
    const expiresAt = Date.now() + (reservationDuration * 60 * 1000);

    // Note: This would require adding a reservation system to the schema
    // For now, we'll return the slot info for temporary client-side reservation
    return {
      slotId: args.slotId,
      reservedUntil: expiresAt,
      slot,
    };
  },
});
