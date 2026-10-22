import { z } from "zod";

// Medication validation schema
export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  strength: z.string().min(1, "Strength is required"),
  dosageForm: z.string().min(1, "Dosage form is required"),
  ndc: z.string().optional(),
  rxcui: z.string().optional(),
});

// Dosage validation schema
export const dosageSchema = z.object({
  quantity: z.string().min(1, "Quantity is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  refills: z.number().min(0, "Refills must be 0 or greater").max(11, "Maximum 11 refills allowed"),
});

// Pharmacy validation schema
export const pharmacySchema = z.object({
  ncpdpId: z.string().min(1, "Pharmacy ID is required"),
  name: z.string().min(1, "Pharmacy name is required"),
  address: z.string().min(1, "Pharmacy address is required"),
  phone: z.string().min(1, "Pharmacy phone is required"),
});

// Complete prescription validation schema
export const prescriptionSchema = z.object({
  medication: medicationSchema,
  dosage: dosageSchema,
  pharmacy: pharmacySchema.optional(),
  deliveryMethod: z.enum(["electronic", "print", "fax", "phone"]).default("electronic"),
  priority: z.enum(["routine", "urgent", "stat"]).default("routine"),
  notes: z.string().optional(),
});

// Form data types
export type MedicationFormData = z.infer<typeof medicationSchema>;
export type DosageFormData = z.infer<typeof dosageSchema>;
export type PharmacyFormData = z.infer<typeof pharmacySchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
