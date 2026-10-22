import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new pharmacy profile (for pharmacy user registration)
export const createPharmacy = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    licenseNumber: v.string(),
    phone: v.string(),
    email: v.string(),
    ncpdpId: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    deaNumber: v.optional(v.string()),
    npiNumber: v.optional(v.string()),
    pharmacistInCharge: v.optional(v.string()),
    chainName: v.optional(v.string()),
    isActive: v.boolean(),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if pharmacy already exists for this user
    const existingPharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingPharmacy) {
      throw new Error("Pharmacy profile already exists for this user");
    }

    // Check if NCPDP ID is already taken
    const existingNcpdp = await ctx.db
      .query("pharmacies")
      .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", args.ncpdpId))
      .first();

    if (existingNcpdp) {
      throw new Error("Pharmacy with this NCPDP ID already exists");
    }

    const pharmacyId = await ctx.db.insert("pharmacies", {
      userId: args.userId,
      name: args.name,
      licenseNumber: args.licenseNumber,
      deaNumber: args.deaNumber,
      npiNumber: args.npiNumber,
      ncpdpId: args.ncpdpId,
      address: args.address,
      phone: args.phone,
      email: args.email,
      pharmacistInCharge: args.pharmacistInCharge,
      chainName: args.chainName,
      isActive: args.isActive,
      isVerified: args.isVerified,
      createdAt: now,
      updatedAt: now,
    });

    return pharmacyId;
  },
});

// Update pharmacy profile
export const updatePharmacy = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    name: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    })),
    deaNumber: v.optional(v.string()),
    npiNumber: v.optional(v.string()),
    chainName: v.optional(v.string()),
    pharmacistInCharge: v.optional(v.string()),
    hours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    services: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { pharmacyId, ...updates } = args;

    await ctx.db.patch(pharmacyId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(pharmacyId);
  },
});

// Get pharmacy by user ID
export const getPharmacyByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pharmacies")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Add a new pharmacy to the directory
export const create = mutation({
  args: {
    ncpdpId: v.string(),
    name: v.string(),
    licenseNumber: v.string(), // Required field
    deaNumber: v.optional(v.string()),
    npiNumber: v.optional(v.string()),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    phone: v.string(),
    fax: v.optional(v.string()),
    email: v.optional(v.string()),
    hours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    services: v.optional(v.array(v.string())),
    chainName: v.optional(v.string()),
    pharmacistInCharge: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if pharmacy already exists
    const existingPharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", args.ncpdpId))
      .first();

    if (existingPharmacy) {
      throw new Error("Pharmacy with this NCPDP ID already exists");
    }

    const pharmacyId = await ctx.db.insert("pharmacies", {
      ...args,
      isActive: true,
      isVerified: args.isVerified ?? false,
      lastVerified: now,
      createdAt: now,
      updatedAt: now,
    });

    return pharmacyId;
  },
});

// Search pharmacies by zip code
export const searchByZipCode = query({
  args: { 
    zipCode: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const pharmacies = await ctx.db
      .query("pharmacies")
      .withIndex("by_zip_code", (q) => q.eq("address.zipCode", args.zipCode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);

    return pharmacies;
  },
});

// Search pharmacies by chain name
export const searchByChain = query({
  args: { 
    chainName: v.string(),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("pharmacies")
      .withIndex("by_chain", (q) => q.eq("chainName", args.chainName))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.zipCode) {
      query = query.filter((q) => q.eq(q.field("address.zipCode"), args.zipCode));
    }

    return await query.collect();
  },
});

// Get pharmacy by ID
export const getById = query({
  args: { id: v.id("pharmacies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get pharmacy by NCPDP ID
export const getByNcpdpId = query({
  args: { ncpdpId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pharmacies")
      .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", args.ncpdpId))
      .first();
  },
});

// Update patient's preferred pharmacy
export const setPatientPreferredPharmacy = mutation({
  args: {
    patientId: v.id("patients"),
    pharmacyNcpdpId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get pharmacy details
    const pharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", args.pharmacyNcpdpId))
      .first();

    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Update patient's preferred pharmacy
    await ctx.db.patch(args.patientId, {
      preferredPharmacy: {
        ncpdpId: pharmacy.ncpdpId,
        name: pharmacy.name,
        address: `${pharmacy.address.street}, ${pharmacy.address.city}, ${pharmacy.address.state} ${pharmacy.address.zipCode}`,
        phone: pharmacy.phone,
      },
      updatedAt: Date.now(),
    });

    return args.patientId;
  },
});

// Get patient's preferred pharmacy
export const getPatientPreferredPharmacy = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);

    if (!patient || !patient.preferredPharmacy) {
      return null;
    }

    // Get full pharmacy details
    const pharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", patient.preferredPharmacy!.ncpdpId))
      .first();

    return pharmacy;
  },
});

// Seed pharmacy data with common chains
export const seedPharmacyData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const samplePharmacies = [
      {
        ncpdpId: "0000001",
        name: "CVS Pharmacy #1234",
        licenseNumber: "NY-PHARM-001234",
        deaNumber: "BC1234567",
        npiNumber: "1234567890",
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        phone: "(555) 123-4567",
        chainName: "CVS",
        pharmacistInCharge: "Dr. John Smith",
        services: ["24_hour", "drive_thru", "delivery"],
        hours: {
          monday: "24 hours",
          tuesday: "24 hours",
          wednesday: "24 hours",
          thursday: "24 hours",
          friday: "24 hours",
          saturday: "24 hours",
          sunday: "24 hours",
        },
      },
      {
        ncpdpId: "0000002",
        name: "Walgreens #5678",
        licenseNumber: "NY-PHARM-005678",
        deaNumber: "BC5678901",
        npiNumber: "5678901234",
        address: {
          street: "456 Oak Ave",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        phone: "(555) 234-5678",
        chainName: "Walgreens",
        pharmacistInCharge: "Dr. Sarah Johnson",
        services: ["drive_thru", "photo"],
        hours: {
          monday: "8:00 AM - 10:00 PM",
          tuesday: "8:00 AM - 10:00 PM",
          wednesday: "8:00 AM - 10:00 PM",
          thursday: "8:00 AM - 10:00 PM",
          friday: "8:00 AM - 10:00 PM",
          saturday: "9:00 AM - 9:00 PM",
          sunday: "9:00 AM - 9:00 PM",
        },
      },
      {
        ncpdpId: "0000003",
        name: "Rite Aid #9012",
        licenseNumber: "NY-PHARM-009012",
        deaNumber: "BC9012345",
        npiNumber: "9012345678",
        address: {
          street: "789 Pine St",
          city: "New York",
          state: "NY",
          zipCode: "10002",
        },
        phone: "(555) 345-6789",
        chainName: "Rite Aid",
        pharmacistInCharge: "Dr. Michael Brown",
        services: ["drive_thru"],
        hours: {
          monday: "9:00 AM - 9:00 PM",
          tuesday: "9:00 AM - 9:00 PM",
          wednesday: "9:00 AM - 9:00 PM",
          thursday: "9:00 AM - 9:00 PM",
          friday: "9:00 AM - 9:00 PM",
          saturday: "9:00 AM - 8:00 PM",
          sunday: "10:00 AM - 6:00 PM",
        },
      },
      {
        ncpdpId: "0000004",
        name: "Independent Pharmacy",
        licenseNumber: "NY-PHARM-000004",
        deaNumber: "BC0004567",
        npiNumber: "0004567890",
        address: {
          street: "321 Elm St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        phone: "(555) 456-7890",
        pharmacistInCharge: "Dr. Emily Davis",
        services: ["delivery", "compounding"],
        hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "9:00 AM - 2:00 PM",
          sunday: "Closed",
        },
      },
    ];

    const pharmacyIds = [];
    
    for (const pharmacyData of samplePharmacies) {
      // Check if pharmacy already exists
      const existing = await ctx.db
        .query("pharmacies")
        .withIndex("by_ncpdp_id", (q) => q.eq("ncpdpId", pharmacyData.ncpdpId))
        .first();

      if (!existing) {
        const pharmacyId = await ctx.db.insert("pharmacies", {
          ...pharmacyData,
          isActive: true,
          isVerified: true, // Sample data is pre-verified
          lastVerified: now,
          createdAt: now,
          updatedAt: now,
        });
        pharmacyIds.push(pharmacyId);
      }
    }

    return {
      message: `Seeded ${pharmacyIds.length} pharmacies`,
      pharmacyIds,
    };
  },
});

// Update pharmacy information
export const update = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      fax: v.optional(v.string()),
      email: v.optional(v.string()),
      hours: v.optional(v.object({
        monday: v.optional(v.string()),
        tuesday: v.optional(v.string()),
        wednesday: v.optional(v.string()),
        thursday: v.optional(v.string()),
        friday: v.optional(v.string()),
        saturday: v.optional(v.string()),
        sunday: v.optional(v.string()),
      })),
      services: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.pharmacyId, {
      ...args.updates,
      lastVerified: now,
      updatedAt: now,
    });

    return args.pharmacyId;
  },
});

// Get all active pharmacies (for admin)
export const getAllActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pharmacies")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get active pharmacies for prescription selection
export const getActivePharmaciesForPrescription = query({
  args: {
    zipCode: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let query = ctx.db
      .query("pharmacies")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.zipCode) {
      query = query.filter((q) => q.eq(q.field("address.zipCode"), args.zipCode));
    }

    const pharmacies = await query.take(limit);

    // Return simplified pharmacy data for selection
    return pharmacies.map(pharmacy => ({
      _id: pharmacy._id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      chainName: pharmacy.chainName,
      services: pharmacy.services || [],
      hours: pharmacy.hours,
      deliveryAvailable: pharmacy.services?.includes("delivery") || false,
      pickupAvailable: true, // All pharmacies support pickup
    }));
  },
});
