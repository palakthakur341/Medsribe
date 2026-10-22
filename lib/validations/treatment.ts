import { z } from "zod";

// Treatment type options
export const treatmentTypes = [
  "Medication Management",
  "Physical Therapy", 
  "Surgical Intervention",
  "Lifestyle Modification",
  "Monitoring/Follow-up",
  "Diagnostic Workup",
  "Preventive Care",
  "Emergency Treatment",
  "Chronic Disease Management",
  "Mental Health Treatment",
  "Other"
] as const;

// Medication details schema matching prescription structure
export const medicationDetailsSchema = z.object({
  // Medication information
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  strength: z.string().min(1, "Strength is required"),
  dosageForm: z.string().min(1, "Dosage form is required"),

  // Dosage information
  quantity: z.string().min(1, "Quantity is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  refills: z.number().min(0, "Refills must be 0 or greater").max(11, "Maximum 11 refills allowed"),
});

// Main treatment form schema
export const treatmentFormSchema = z.object({
  // Treatment Information (matching database schema)
  title: z.string().min(1, "Treatment title is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  plan: z.string().min(1, "Treatment plan description is required"),
  goals: z.array(z.string()),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),

  // Optional SOAP Note Selection
  soapNoteId: z.string().optional().nullable(),

  // Medication Details Array (required - at least one medication)
  medicationDetails: z.array(medicationDetailsSchema).min(1, "At least one medication is required"),

  // Optional Pharmacy Selection
  pharmacyId: z.string().optional(),
});

// Type definitions
export type TreatmentType = typeof treatmentTypes[number];
export type MedicationDetails = z.infer<typeof medicationDetailsSchema>;
export type TreatmentFormData = z.infer<typeof treatmentFormSchema>;

// Pharmacy interface for selection component
export interface PharmacyOption {
  _id: string;
  ncpdpId: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  chainName?: string;
  isActive: boolean;
  isVerified: boolean;
}

// Form submission data interface
export interface TreatmentSubmissionData extends Omit<TreatmentFormData, 'startDate' | 'endDate'> {
  startDate: string; // ISO date string for API
  endDate?: string; // ISO date string for API
  pharmacyDetails?: PharmacyOption; // Full pharmacy object if selected
}

// Default form values
export const defaultTreatmentFormValues: Partial<TreatmentFormData> = {
  title: "",
  diagnosis: "",
  plan: "",
  goals: [],
  startDate: new Date(),
  endDate: undefined,
  soapNoteId: "",
  medicationDetails: [],
  pharmacyId: "",
};

// Dosage form options
export const dosageFormOptions = [
  "tablet",
  "capsule",
  "liquid",
  "injection",
  "cream",
  "ointment",
  "drops",
  "inhaler",
  "patch",
  "suppository",
  "powder",
  "gel",
  "spray",
  "other"
] as const;

// Validation helpers
export const validateMedicationDetails = (medications: MedicationDetails[]): string[] => {
  const errors: string[] = [];

  medications.forEach((med, index) => {
    if (!med.name.trim()) {
      errors.push(`Medication ${index + 1}: Name is required`);
    }
    if (!med.strength.trim()) {
      errors.push(`Medication ${index + 1}: Strength is required`);
    }
    if (!med.dosageForm.trim()) {
      errors.push(`Medication ${index + 1}: Dosage form is required`);
    }
    if (!med.quantity.trim()) {
      errors.push(`Medication ${index + 1}: Quantity is required`);
    }
    if (!med.frequency.trim()) {
      errors.push(`Medication ${index + 1}: Frequency is required`);
    }
    if (!med.instructions.trim()) {
      errors.push(`Medication ${index + 1}: Instructions are required`);
    }
  });

  return errors;
};

// Form field configurations
export const frequencyOptions = [
  "Once daily",
  "Twice daily", 
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours", 
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime",
  "Other"
] as const;

export const durationOptions = [
  "1 day",
  "3 days",
  "1 week",
  "2 weeks", 
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "1 year",
  "Ongoing",
  "As needed",
  "Other"
] as const;

export type FrequencyOption = typeof frequencyOptions[number];
export type DurationOption = typeof durationOptions[number];
