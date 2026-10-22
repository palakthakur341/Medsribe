import { mutation } from "./_generated/server";

// Seed some sample appointments for testing
export const seedSampleAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    // Get some sample patients and doctors
    const patients = await ctx.db.query("patients").take(3);
    const doctors = await ctx.db.query("doctors").take(2);

    if (patients.length === 0 || doctors.length === 0) {
      throw new Error("Need at least one patient and one doctor to seed appointments");
    }

    const now = Date.now();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Get user IDs for createdBy field
    const doctor1User = await ctx.db.get(doctors[0].userId);
    const doctor2User = await ctx.db.get(doctors[1].userId);

    if (!doctor1User || !doctor2User) {
      throw new Error("Doctor user records not found");
    }

    // Create or find doctorPatient relationships
    const doctorPatientRelationships = [];

    // Doctor 1 with Patient 1 and 2
    let dp1 = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorId", doctors[0]._id).eq("patientId", patients[0]._id))
      .first();

    if (!dp1) {
      const dp1Id = await ctx.db.insert("doctorPatients", {
        doctorId: doctors[0]._id,
        patientId: patients[0]._id,
        assignedBy: "direct_assignment",
        assignedAt: now,
        isActive: true,
      });
      dp1 = await ctx.db.get(dp1Id);
    }
    doctorPatientRelationships.push(dp1!);

    let dp2 = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorId", doctors[0]._id).eq("patientId", patients[1]._id))
      .first();

    if (!dp2) {
      const dp2Id = await ctx.db.insert("doctorPatients", {
        doctorId: doctors[0]._id,
        patientId: patients[1]._id,
        assignedBy: "direct_assignment",
        assignedAt: now,
        isActive: true,
      });
      dp2 = await ctx.db.get(dp2Id);
    }
    doctorPatientRelationships.push(dp2!);

    // Doctor 2 with Patient 3
    let dp3 = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_patient", (q) => q.eq("doctorId", doctors[1]._id).eq("patientId", patients[2]._id))
      .first();

    if (!dp3) {
      const dp3Id = await ctx.db.insert("doctorPatients", {
        doctorId: doctors[1]._id,
        patientId: patients[2]._id,
        assignedBy: "direct_assignment",
        assignedAt: now,
        isActive: true,
      });
      dp3 = await ctx.db.get(dp3Id);
    }
    doctorPatientRelationships.push(dp3!);

    // Sample appointments using new schema
    const sampleAppointments = [
      {
        doctorPatientId: doctorPatientRelationships[0]._id,
        appointmentDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).getTime(),
        duration: 30,
        timeZone: "America/New_York",
        appointmentType: "consultation" as const,
        visitReason: "Initial consultation for new patient",
        location: {
          type: "in_person" as const,
          address: "123 Medical Center Dr",
          room: "Room 101",
        },
        status: "scheduled" as const,
        notes: "Initial consultation",
        scheduledAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: doctor1User._id,
      },
      {
        doctorPatientId: doctorPatientRelationships[0]._id,
        appointmentDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).getTime(),
        duration: 20,
        timeZone: "America/New_York",
        appointmentType: "follow_up" as const,
        visitReason: "Follow-up appointment for treatment progress",
        location: {
          type: "telemedicine" as const,
          meetingLink: "https://meet.example.com/room123",
        },
        status: "confirmed" as const,
        notes: "Follow-up appointment",
        scheduledAt: now,
        confirmedAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: doctor1User._id,
      },
      {
        doctorPatientId: doctorPatientRelationships[1]._id,
        appointmentDateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 15).getTime(),
        duration: 25,
        timeZone: "America/New_York",
        appointmentType: "consultation" as const,
        visitReason: "Regular check-up and health assessment",
        location: {
          type: "in_person" as const,
          address: "123 Medical Center Dr",
          room: "Room 102",
        },
        status: "scheduled" as const,
        notes: "Regular check-up",
        scheduledAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: doctor1User._id,
      },
      {
        doctorPatientId: doctorPatientRelationships[2]._id,
        appointmentDateTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 0).getTime(),
        duration: 45,
        timeZone: "America/New_York",
        appointmentType: "new_patient" as const,
        visitReason: "New patient consultation and initial assessment",
        location: {
          type: "in_person" as const,
          address: "123 Medical Center Dr",
          room: "Room 103",
        },
        status: "scheduled" as const,
        notes: "New patient consultation",
        scheduledAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: doctor2User._id,
      },
    ];

    // Insert appointments
    const appointmentIds = [];
    for (const appointment of sampleAppointments) {
      const id = await ctx.db.insert("appointments", appointment);
      appointmentIds.push(id);
    }

    return {
      message: `Created ${appointmentIds.length} sample appointments`,
      appointmentIds,
    };
  },
});

// Clear all appointments (for testing)
export const clearAllAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();
    
    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    return {
      message: `Deleted ${appointments.length} appointments`,
    };
  },
});
