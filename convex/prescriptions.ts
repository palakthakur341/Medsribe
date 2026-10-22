import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Create a new prescription
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.optional(v.id("appointments")),
    treatmentPlanId: v.optional(v.id("treatmentPlans")),
    medication: v.object({
      name: v.string(),
      genericName: v.optional(v.string()),
      strength: v.string(),
      dosageForm: v.string(),
      ndc: v.optional(v.string()),
      rxcui: v.optional(v.string()),
    }),
    dosage: v.object({
      quantity: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      instructions: v.string(),
      refills: v.number(),
    }),
    pharmacy: v.optional(v.object({
      ncpdpId: v.string(),
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    })),
    deliveryMethod: v.union(
      v.literal("electronic"),
      v.literal("print"),
      v.literal("fax"),
      v.literal("phone")
    ),
    priority: v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("stat")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify doctor and patient exist
    const doctor = await ctx.db.get(args.doctorId);
    const patient = await ctx.db.get(args.patientId);
    
    if (!doctor || !patient) {
      throw new Error("Doctor or patient not found");
    }

    // Create prescription with pending status
    const prescriptionId = await ctx.db.insert("prescriptions", {
      ...args,
      prescriptionDate: now,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      prescribedBy: doctor.userId,
    });

    return prescriptionId;
  },
});

// Get prescriptions for a patient
export const getByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Get doctor information for each prescription
    const prescriptionsWithDoctors = await Promise.all(
      prescriptions.map(async (prescription) => {
        const doctor = await ctx.db.get(prescription.doctorId);
        return {
          ...prescription,
          doctor: doctor ? {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            licenseNumber: doctor.licenseNumber,
          } : null,
        };
      })
    );

    return prescriptionsWithDoctors;
  },
});

// Get prescriptions for a doctor
export const getByDoctorId = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Get patient information for each prescription
    const prescriptionsWithPatients = await Promise.all(
      prescriptions.map(async (prescription) => {
        const patient = await ctx.db.get(prescription.patientId);
        return {
          ...prescription,
          patient: patient ? {
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth,
          } : null,
        };
      })
    );

    return prescriptionsWithPatients;
  },
});

// Update prescription status
export const updateStatus = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("received"),
      v.literal("filled"),
      v.literal("cancelled"),
      v.literal("error")
    ),
    externalPrescriptionId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.prescriptionId, {
      status: args.status,
      externalPrescriptionId: args.externalPrescriptionId,
      errorMessage: args.errorMessage,
      updatedAt: now,
    });

    return args.prescriptionId;
  },
});



// Add safety checks to prescription
export const addSafetyChecks = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    safetyChecks: v.object({
      drugInteractions: v.array(v.object({
        severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("major")),
        description: v.string(),
        interactingMedication: v.string(),
      })),
      allergyAlerts: v.array(v.object({
        allergen: v.string(),
        severity: v.string(),
        reaction: v.string(),
      })),
      contraindications: v.array(v.string()),
      dosageAlerts: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.prescriptionId, {
      safetyChecks: args.safetyChecks,
      updatedAt: now,
    });

    return args.prescriptionId;
  },
});

// Send prescription electronically (action for external API calls)
export const sendElectronically = action({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  handler: async (ctx, args) => {
    // Get prescription details
    const prescription = await ctx.runQuery(api.prescriptions.getById, {
      prescriptionId: args.prescriptionId,
    });

    if (!prescription) {
      throw new Error("Prescription not found");
    }

    if (prescription.status !== "pending") {
      throw new Error("Prescription already sent or cancelled");
    }

    try {
      // TODO: Integrate with Surescripts or pharmacy API
      // For now, we'll simulate the API call
      const externalResponse = await simulatePharmacyAPI(prescription);
      
      if (externalResponse.success) {
        // Update prescription status to sent
        await ctx.runMutation(api.prescriptions.updateStatus, {
          prescriptionId: args.prescriptionId,
          status: "sent",
          externalPrescriptionId: externalResponse.transactionId,
        });

        return {
          success: true,
          transactionId: externalResponse.transactionId,
        };
      } else {
        // Update prescription status to error
        await ctx.runMutation(api.prescriptions.updateStatus, {
          prescriptionId: args.prescriptionId,
          status: "error",
          errorMessage: externalResponse.error,
        });

        return {
          success: false,
          error: externalResponse.error,
        };
      }
    } catch (error) {
      // Update prescription status to error
      await ctx.runMutation(api.prescriptions.updateStatus, {
        prescriptionId: args.prescriptionId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

// Get prescription by ID
export const getById = query({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const prescription = await ctx.db.get(args.prescriptionId);
    
    if (!prescription) {
      return null;
    }

    // Get related data
    const doctor = await ctx.db.get(prescription.doctorId);
    const patient = await ctx.db.get(prescription.patientId);

    return {
      ...prescription,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        licenseNumber: doctor.licenseNumber,
      } : null,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
      } : null,
    };
  },
});

// Simulate pharmacy API call (replace with real integration)
async function simulatePharmacyAPI(prescription: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success/failure
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      transactionId: `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return {
      success: false,
      error: "Pharmacy system temporarily unavailable",
    };
  }
}
