import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a prescription order
export const createPrescriptionOrder = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    pharmacyId: v.id("pharmacies"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    treatmentPlanId: v.optional(v.id("treatmentPlans")),
    medicationDetails: v.object({
      name: v.string(),
      dosage: v.string(),
      quantity: v.string(),
      refills: v.number(),
      frequency: v.string(),
      instructions: v.optional(v.string()),
    }),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    deliveryAddress: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      instructions: v.optional(v.string()),
    })),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify pharmacy exists and is active
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy || !pharmacy.isActive) {
      throw new Error("Pharmacy not found or inactive");
    }

    // Verify prescription exists
    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) {
      throw new Error("Prescription not found");
    }

    // Create the order
    const orderId = await ctx.db.insert("prescriptionOrders", {
      ...args,
      status: "pending",
      orderNumber: `RX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      estimatedReadyTime: undefined,
      actualReadyTime: undefined,
      pickedUpAt: undefined,
      deliveredAt: undefined,
      pharmacyNotes: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return orderId;
  },
});

// Update prescription order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("prescriptionOrders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("on_hold")
    ),
    estimatedReadyTime: v.optional(v.number()),
    pharmacyNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, status, estimatedReadyTime, pharmacyNotes } = args;
    const now = Date.now();

    const updates: any = {
      status,
      updatedAt: now,
    };

    if (estimatedReadyTime) {
      updates.estimatedReadyTime = estimatedReadyTime;
    }

    if (pharmacyNotes) {
      updates.pharmacyNotes = pharmacyNotes;
    }

    // Set timestamps based on status
    if (status === "ready") {
      updates.actualReadyTime = now;
    } else if (status === "picked_up") {
      updates.pickedUpAt = now;
    } else if (status === "delivered") {
      updates.deliveredAt = now;
    }

    await ctx.db.patch(orderId, updates);
    return orderId;
  },
});

// Get orders for a pharmacy
export const getOrdersForPharmacy = query({
  args: {
    pharmacyId: v.id("pharmacies"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("prescriptionOrders")
      .withIndex("by_pharmacy", (q) => q.eq("pharmacyId", args.pharmacyId))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const orders = await query.take(limit);

    // Enrich with patient and doctor information
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [patient, doctor, pharmacy] = await Promise.all([
          ctx.db.get(order.patientId),
          ctx.db.get(order.doctorId),
          ctx.db.get(order.pharmacyId),
        ]);

        return {
          ...order,
          patient,
          doctor,
          pharmacy,
        };
      })
    );

    return enrichedOrders;
  },
});

// Get orders for a patient
export const getOrdersForPatient = query({
  args: {
    patientId: v.id("patients"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("prescriptionOrders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const orders = await query.collect();

    // Enrich with pharmacy information
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const pharmacy = await ctx.db.get(order.pharmacyId);
        return {
          ...order,
          pharmacy,
        };
      })
    );

    return enrichedOrders;
  },
});

// Get orders for a doctor
export const getOrdersForDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("prescriptionOrders")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const orders = await query.collect();

    // Enrich with patient and pharmacy information
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [patient, pharmacy] = await Promise.all([
          ctx.db.get(order.patientId),
          ctx.db.get(order.pharmacyId),
        ]);

        return {
          ...order,
          patient,
          pharmacy,
        };
      })
    );

    return enrichedOrders;
  },
});

// Get order by ID with full details
export const getOrderById = query({
  args: { orderId: v.id("prescriptionOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const [patient, doctor, pharmacy, prescription] = await Promise.all([
      ctx.db.get(order.patientId),
      ctx.db.get(order.doctorId),
      ctx.db.get(order.pharmacyId),
      ctx.db.get(order.prescriptionId),
    ]);

    return {
      ...order,
      patient,
      doctor,
      pharmacy,
      prescription,
    };
  },
});

// Get orders for a treatment plan
export const getOrdersByTreatmentPlanId = query({
  args: { treatmentPlanId: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("prescriptionOrders")
      .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", args.treatmentPlanId))
      .order("desc")
      .collect();

    // Enrich with pharmacy information
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const pharmacy = await ctx.db.get(order.pharmacyId);
        return {
          ...order,
          pharmacy,
        };
      })
    );

    return enrichedOrders;
  },
});

// Cancel an order
export const cancelOrder = mutation({
  args: {
    orderId: v.id("prescriptionOrders"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      pharmacyNotes: args.reason,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

// Get order statistics for pharmacy dashboard
export const getPharmacyOrderStats = query({
  args: { pharmacyId: v.id("pharmacies") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("prescriptionOrders")
      .withIndex("by_pharmacy", (q) => q.eq("pharmacyId", args.pharmacyId))
      .collect();

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      ready: orders.filter(o => o.status === "ready").length,
      completed: orders.filter(o => ["picked_up", "delivered"].includes(o.status)).length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    return stats;
  },
});
