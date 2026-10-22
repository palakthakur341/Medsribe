import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update doctor profile with comprehensive healthcare data
export const createOrUpdateDoctorProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    primarySpecialty: v.string(),
    licenseNumber: v.string(),
    phone: v.string(),
    email: v.string(),
    // Optional fields
    title: v.optional(v.string()),
    npiNumber: v.optional(v.string()),
    deaNumber: v.optional(v.string()),
    secondarySpecialties: v.optional(v.array(v.string())),
    boardCertifications: v.optional(v.array(v.string())),
    medicalSchool: v.optional(v.string()),
    residency: v.optional(v.string()),
    fellowship: v.optional(v.string()),
    yearsOfExperience: v.optional(v.float64()),
    practiceName: v.optional(v.string()),
    department: v.optional(v.string()),
    hospitalAffiliations: v.optional(v.array(v.string())),
    consultationFee: v.optional(v.float64()),
    languagesSpoken: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    isAcceptingNewPatients: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if doctor profile already exists
    const existingDoctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existingDoctor) {
      // Update existing profile
      await ctx.db.patch(existingDoctor._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        title: args.title,
        licenseNumber: args.licenseNumber,
        npiNumber: args.npiNumber,
        deaNumber: args.deaNumber,
        primarySpecialty: args.primarySpecialty,
        secondarySpecialties: args.secondarySpecialties,
        boardCertifications: args.boardCertifications,
        medicalSchool: args.medicalSchool,
        residency: args.residency,
        fellowship: args.fellowship,
        yearsOfExperience: args.yearsOfExperience,
        phone: args.phone,
        email: args.email,
        practiceName: args.practiceName,
        department: args.department,
        hospitalAffiliations: args.hospitalAffiliations,
        consultationFee: args.consultationFee,
        languagesSpoken: args.languagesSpoken,
        bio: args.bio,
        profileImageUrl: args.profileImageUrl,
        isAcceptingNewPatients: args.isAcceptingNewPatients ?? true,
        updatedAt: now,
      });
      return existingDoctor._id;
    } else {
      // Create new profile
      const doctorId = await ctx.db.insert("doctors", {
        userId: args.userId,
        firstName: args.firstName,
        lastName: args.lastName,
        title: args.title,
        licenseNumber: args.licenseNumber,
        npiNumber: args.npiNumber,
        deaNumber: args.deaNumber,
        primarySpecialty: args.primarySpecialty,
        secondarySpecialties: args.secondarySpecialties,
        boardCertifications: args.boardCertifications,
        medicalSchool: args.medicalSchool,
        residency: args.residency,
        fellowship: args.fellowship,
        yearsOfExperience: args.yearsOfExperience,
        phone: args.phone,
        email: args.email,
        practiceName: args.practiceName,
        department: args.department,
        hospitalAffiliations: args.hospitalAffiliations,
        isAcceptingNewPatients: args.isAcceptingNewPatients ?? true, // Default to true
        consultationFee: args.consultationFee,
        languagesSpoken: args.languagesSpoken,
        bio: args.bio,
        profileImageUrl: args.profileImageUrl,
        isActive: true,
        isVerified: false, // Default to false, needs verification
        createdAt: now,
        updatedAt: now,
      });
      return doctorId;
    }
  },
});

// Update existing doctor profile
export const updateDoctorProfile = mutation({
  args: {
    doctorId: v.id("doctors"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    title: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    npiNumber: v.optional(v.string()),
    deaNumber: v.optional(v.string()),
    primarySpecialty: v.optional(v.string()),
    secondarySpecialties: v.optional(v.array(v.string())),
    boardCertifications: v.optional(v.array(v.string())),
    medicalSchool: v.optional(v.string()),
    residency: v.optional(v.string()),
    fellowship: v.optional(v.string()),
    yearsOfExperience: v.optional(v.float64()),
    practiceName: v.optional(v.string()),
    department: v.optional(v.string()),
    hospitalAffiliations: v.optional(v.array(v.string())),
    consultationFee: v.optional(v.float64()),
    languagesSpoken: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    isAcceptingNewPatients: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { doctorId, ...updateData } = args;

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(doctorId, {
      ...cleanUpdateData,
      updatedAt: Date.now(),
    });

    return doctorId;
  },
});

// Get doctor profile by user ID
export const getDoctorProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    return doctor;
  },
});

// Get doctor profile by doctor ID
export const getDoctorById = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    return doctor;
  },
});

// Get doctor by ID (alias for getDoctorById)
export const getById = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    return doctor;
  },
});

// Get doctor by user ID (alias for getDoctorProfile for compatibility)
export const getDoctorByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return doctor;
  },
});

// Get current doctor profile (alias for getDoctorProfile)
export const getCurrentDoctor = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return doctor;
  },
});

// Get all doctors except current doctor (for referrals and sharing)
export const getAll = query({
  args: { excludeDoctorId: v.optional(v.id("doctors")) },
  handler: async (ctx, args) => {
    // Get active and verified doctors first
    let doctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    // If no active verified doctors, fallback to all active doctors for testing
    if (doctors.length === 0) {
      doctors = await ctx.db
        .query("doctors")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Filter out the excluded doctor if provided
    if (args.excludeDoctorId) {
      doctors = doctors.filter(doctor => doctor._id !== args.excludeDoctorId);
    }

    // Sort by name for consistent ordering
    return doctors.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  },
});

// Enhanced search for doctors with filtering capabilities
export const searchDoctors = query({
  args: {
    searchTerm: v.optional(v.string()),
    specialty: v.optional(v.string()),
    excludeDoctorId: v.optional(v.id("doctors")),
    acceptingNewPatients: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Start with active doctors
    let doctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    // Fallback to active only if no verified doctors
    if (doctors.length === 0) {
      doctors = await ctx.db
        .query("doctors")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Apply filters
    let filteredDoctors = doctors;

    // Exclude specific doctor
    if (args.excludeDoctorId) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor._id !== args.excludeDoctorId);
    }

    // Filter by specialty
    if (args.specialty) {
      const specialty = args.specialty; // TypeScript assertion
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.primarySpecialty === specialty ||
        doctor.secondarySpecialties?.includes(specialty)
      );
    }

    // Filter by accepting new patients
    if (args.acceptingNewPatients !== undefined) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.isAcceptingNewPatients === args.acceptingNewPatients
      );
    }

    // Apply search term filter
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchLower) ||
        doctor.lastName.toLowerCase().includes(searchLower) ||
        doctor.primarySpecialty.toLowerCase().includes(searchLower) ||
        doctor.secondarySpecialties?.some(spec =>
          spec.toLowerCase().includes(searchLower)
        ) ||
        doctor.hospitalAffiliations?.some(hospital =>
          hospital.toLowerCase().includes(searchLower)
        ) ||
        doctor.department?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by relevance and name
    const sortedDoctors = filteredDoctors.sort((a, b) => {
      // If searching by specialty, prioritize exact matches
      if (args.specialty) {
        const aExactMatch = a.primarySpecialty === args.specialty ? 1 : 0;
        const bExactMatch = b.primarySpecialty === args.specialty ? 1 : 0;
        if (aExactMatch !== bExactMatch) {
          return bExactMatch - aExactMatch;
        }
      }

      // Then sort by name
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    return sortedDoctors.slice(0, limit);
  },
});

// Get all active doctors (simplified version - use getAll instead for better functionality)
export const getAllActiveDoctors = query({
  args: {},
  handler: async (ctx) => {
    // Get active and verified doctors
    let doctors = await ctx.db
      .query("doctors")
      .withIndex("by_active_verified", (q) => q.eq("isActive", true).eq("isVerified", true))
      .collect();

    // Fallback to active only if no verified doctors
    if (doctors.length === 0) {
      doctors = await ctx.db
        .query("doctors")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Sort by name for consistent ordering
    return doctors.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  },
});

// Get doctors by specialization with enhanced filtering
export const getDoctorsBySpecialization = query({
  args: {
    specialization: v.string(),
    excludeDoctorId: v.optional(v.id("doctors")),
    acceptingNewPatients: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let doctors = await ctx.db
      .query("doctors")
      .withIndex("by_specialty", (q) => q.eq("primarySpecialty", args.specialization))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Also include doctors with this as secondary specialty
    const secondaryDoctors = await ctx.db
      .query("doctors")
      .filter((q) =>
        q.eq(q.field("isActive"), true) &&
        q.neq(q.field("primarySpecialty"), args.specialization)
      )
      .collect();

    const doctorsWithSecondarySpecialty = secondaryDoctors.filter(doctor =>
      doctor.secondarySpecialties?.includes(args.specialization)
    );

    // Combine and deduplicate
    const allDoctors = [...doctors, ...doctorsWithSecondarySpecialty];
    const uniqueDoctors = allDoctors.filter((doctor, index, self) =>
      index === self.findIndex(d => d._id === doctor._id)
    );

    // Apply filters
    let filteredDoctors = uniqueDoctors;

    if (args.excludeDoctorId) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor._id !== args.excludeDoctorId);
    }

    if (args.acceptingNewPatients !== undefined) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.isAcceptingNewPatients === args.acceptingNewPatients
      );
    }

    // Sort by primary specialty match first, then by name
    return filteredDoctors.sort((a, b) => {
      const aPrimaryMatch = a.primarySpecialty === args.specialization ? 1 : 0;
      const bPrimaryMatch = b.primarySpecialty === args.specialization ? 1 : 0;

      if (aPrimaryMatch !== bPrimaryMatch) {
        return bPrimaryMatch - aPrimaryMatch;
      }

      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
  },
});

// Get available specialties for filtering
export const getAvailableSpecialties = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db
      .query("doctors")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const specialties = new Set<string>();

    doctors.forEach(doctor => {
      specialties.add(doctor.primarySpecialty);
      doctor.secondarySpecialties?.forEach(spec => specialties.add(spec));
    });

    return Array.from(specialties).sort();
  },
});

// Get doctor statistics for admin/dashboard
export const getDoctorStats = query({
  args: {},
  handler: async (ctx) => {
    const allDoctors = await ctx.db.query("doctors").collect();

    const stats = {
      total: allDoctors.length,
      active: allDoctors.filter(d => d.isActive).length,
      verified: allDoctors.filter(d => d.isVerified).length,
      acceptingNewPatients: allDoctors.filter(d => d.isAcceptingNewPatients).length,
      bySpecialty: {} as Record<string, number>,
    };

    // Count by specialty
    allDoctors.forEach(doctor => {
      if (doctor.isActive) {
        stats.bySpecialty[doctor.primarySpecialty] =
          (stats.bySpecialty[doctor.primarySpecialty] || 0) + 1;
      }
    });

    return stats;
  },
});

// Update doctor availability status
export const updateDoctorStatus = mutation({
  args: {
    doctorId: v.id("doctors"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.doctorId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

// Update doctor availability schedule
export const updateDoctorAvailability = mutation({
  args: {
    doctorId: v.id("doctors"),
    availabilitySchedule: v.object({
      monday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      tuesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      wednesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      thursday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      friday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      saturday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      sunday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.doctorId, {
      availabilitySchedule: args.availabilitySchedule,
      updatedAt: Date.now(),
      lastActiveAt: Date.now(),
    });
  },
});

// Update doctor accepting new patients status
export const updateAcceptingNewPatients = mutation({
  args: {
    doctorId: v.id("doctors"),
    isAcceptingNewPatients: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.doctorId, {
      isAcceptingNewPatients: args.isAcceptingNewPatients,
      updatedAt: Date.now(),
    });
  },
});





// Seed sample doctors for testing (development only)
export const seedSampleDoctors = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if doctors already exist
    const existingDoctors = await ctx.db.query("doctors").collect();
    if (existingDoctors.length > 0) {
      return { message: "Doctors already exist", count: existingDoctors.length };
    }

    const now = Date.now();
    const sampleDoctors = [
      {
        userId: "temp_user_1" as any, // This would need to be a real user ID in production
        firstName: "Sarah",
        lastName: "Johnson",
        title: "Dr.",
        primarySpecialty: "Cardiology",
        licenseNumber: "MD123456",
        npiNumber: "1234567890",
        phone: "+1-555-0101",
        email: "sarah.johnson@hospital.com",
        yearsOfExperience: 15,
        isActive: true,
        isVerified: true,
        isAcceptingNewPatients: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "temp_user_2" as any,
        firstName: "Michael",
        lastName: "Chen",
        title: "Dr.",
        primarySpecialty: "Neurology",
        licenseNumber: "MD789012",
        npiNumber: "0987654321",
        phone: "+1-555-0102",
        email: "michael.chen@hospital.com",
        yearsOfExperience: 12,
        isActive: true,
        isVerified: true,
        isAcceptingNewPatients: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "temp_user_3" as any,
        firstName: "Emily",
        lastName: "Rodriguez",
        title: "Dr.",
        primarySpecialty: "Pediatrics",
        licenseNumber: "MD345678",
        npiNumber: "1122334455",
        phone: "+1-555-0103",
        email: "emily.rodriguez@hospital.com",
        yearsOfExperience: 8,
        isActive: true,
        isVerified: true,
        isAcceptingNewPatients: true,
        createdAt: now,
        updatedAt: now,
      }
    ];

    const insertedIds = [];
    for (const doctor of sampleDoctors) {
      const id = await ctx.db.insert("doctors", doctor);
      insertedIds.push(id);
    }

    return {
      message: "Sample doctors created successfully",
      count: insertedIds.length,
      ids: insertedIds
    };
  },
});
