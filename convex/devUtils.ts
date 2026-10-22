import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Development Utilities
 * 
 * These functions are for development and testing purposes only.
 * They help set up sample data and configurations for testing the system.
 */

// Setup default availability and slots for development/testing
export const setupDefaultAvailabilityAndSlots = mutation({
  args: {
    doctorId: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const { doctorId } = args;
    const now = Date.now();

    // Default weekly schedule (Monday to Friday, 9 AM to 5 PM)
    const defaultSchedule = [
      {
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        bufferTime: 15,
        breakTimes: [
          {
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch Break"
          }
        ],
        isActive: true,
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        bufferTime: 15,
        breakTimes: [
          {
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch Break"
          }
        ],
        isActive: true,
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        bufferTime: 15,
        breakTimes: [
          {
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch Break"
          }
        ],
        isActive: true,
      },
      {
        dayOfWeek: 4, // Thursday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        bufferTime: 15,
        breakTimes: [
          {
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch Break"
          }
        ],
        isActive: true,
      },
      {
        dayOfWeek: 5, // Friday
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        bufferTime: 15,
        breakTimes: [
          {
            startTime: "12:00",
            endTime: "13:00",
            reason: "Lunch Break"
          }
        ],
        isActive: true,
      },
    ];

    // Create availability for each day
    const availabilityIds = [];
    for (const daySchedule of defaultSchedule) {
      // Check if availability already exists
      const existing = await ctx.db
        .query("doctorAvailability")
        .withIndex("by_doctor_day", (q) => 
          q.eq("doctorId", doctorId).eq("dayOfWeek", daySchedule.dayOfWeek)
        )
        .first();

      if (!existing) {
        const availabilityId = await ctx.db.insert("doctorAvailability", {
          doctorId,
          ...daySchedule,
          createdAt: now,
          updatedAt: now,
        });
        availabilityIds.push(availabilityId);
      } else {
        availabilityIds.push(existing._id);
      }
    }

    // Generate slots for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // Generate time slots
    const generatedSlots = [];
    
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Find availability template for this day
      const template = defaultSchedule.find(t => t.dayOfWeek === dayOfWeek);
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
      const daySlots = generateDaySlots(doctorId, template, dateString, now);
      generatedSlots.push(...daySlots);
    }

    // Insert all generated slots
    const insertPromises = generatedSlots.map(slot => ctx.db.insert("timeSlots", slot));
    const insertedIds = await Promise.all(insertPromises);

    return {
      availabilityIds,
      generatedSlotsCount: insertedIds.length,
      dateRange: { startDate: startDateString, endDate: endDateString },
      message: `Created default availability and generated ${insertedIds.length} time slots`,
    };
  },
});

// Helper function to generate slots for a single day
function generateDaySlots(doctorId: Id<"doctors">, template: any, date: string, createdAt: number) {
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

    if (!isBreakTime) {
      // Create available slot
      slots.push({
        doctorId,
        date,
        time: slotStartTime,
        endTime: slotEndTime,
        slotType: "available" as const,
        appointmentId: undefined,
        isRecurring: true,
        generatedFrom: "template" as const,
        createdAt,
      });
    }

    currentMinutes += template.slotDuration + template.bufferTime;
  }

  return slots;
}
