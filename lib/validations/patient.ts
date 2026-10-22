import { z } from "zod";

// Patient Profile Schema - Updated to match new Convex schema
export const patientProfileSchema = z.object({
  // Core Demographics
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, "Please enter a valid date of birth"),
  gender: z.enum(["M", "F", "O", "U"], {
    required_error: "Please select a gender",
  }),

  // Contact Information
  primaryPhone: z
    .string()
    .min(10, "Primary phone is required")
    .refine((phone) => {
      return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid phone number"),
  secondaryPhone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid secondary phone number"),
  email: z
    .string()
    .email("Please enter a valid email address"),

  // Address Information
  addressLine1: z
    .string()
    .min(5, "Address line 1 is required")
    .max(200, "Address line 1 must be less than 200 characters"),
  addressLine2: z
    .string()
    .max(200, "Address line 2 must be less than 200 characters")
    .optional(),
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(2, "State is required")
    .max(100, "State must be less than 100 characters"),
  zipCode: z
    .string()
    .min(5, "ZIP code is required")
    .max(10, "ZIP code must be less than 10 characters"),
  country: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country must be less than 100 characters"),

  // Medical Identifiers
  nationalId: z
    .string()
    .max(50, "National ID must be less than 50 characters")
    .optional(),

  // Clinical Information
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),

  // Emergency Contact
  emergencyContactName: z
    .string()
    .min(2, "Emergency contact name is required")
    .max(100, "Emergency contact name must be less than 100 characters"),
  emergencyContactPhone: z
    .string()
    .min(10, "Emergency contact phone is required")
    .refine((phone) => {
      return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid emergency contact phone number"),
  emergencyContactRelation: z
    .string()
    .min(2, "Emergency contact relation is required")
    .max(50, "Emergency contact relation must be less than 50 characters"),

  // Care Management
  preferredLanguage: z
    .string()
    .max(50, "Preferred language must be less than 50 characters")
    .optional(),

  // Consent & Legal
  consentForTreatment: z.boolean().default(true),
  consentForDataSharing: z.boolean().default(false),
  advanceDirectives: z
    .string()
    .max(1000, "Advance directives must be less than 1000 characters")
    .optional(),
});

// Medical History Schema
export const medicalHistorySchema = z.object({
  condition: z
    .string()
    .min(1, "Condition is required")
    .max(500, "Condition must be less than 500 characters"),
  diagnosisDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const diagnosisDate = new Date(date);
      const today = new Date();
      return diagnosisDate <= today;
    }, "Diagnosis date cannot be in the future"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

// Allergy Schema
export const allergySchema = z.object({
  allergen: z
    .string()
    .min(1, "Allergen is required")
    .max(200, "Allergen must be less than 200 characters"),
  reaction: z
    .string()
    .max(500, "Reaction must be less than 500 characters")
    .optional(),
  severity: z
    .enum(["Mild", "Moderate", "Severe"])
    .optional(),
});

// Insurance Schema
export const insuranceSchema = z.object({
  providerName: z
    .string()
    .min(1, "Provider name is required")
    .max(100, "Provider name must be less than 100 characters"),
  policyNumber: z
    .string()
    .min(1, "Policy number is required")
    .max(100, "Policy number must be less than 100 characters"),
  coverageDetails: z
    .string()
    .max(1000, "Coverage details must be less than 1000 characters")
    .optional(),
  validFrom: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) instanceof Date;
    }, "Please enter a valid start date"),
  validUntil: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) instanceof Date;
    }, "Please enter a valid end date"),
}).refine((data) => {
  if (data.validFrom && data.validUntil) {
    return new Date(data.validFrom) <= new Date(data.validUntil);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["validUntil"],
});

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Privacy Settings Schema
export const privacySettingsSchema = z.object({
  dataSharing: z.object({
    allowResearch: z.boolean(),
    allowMarketing: z.boolean(),
    shareWithPartners: z.boolean(),
    anonymousAnalytics: z.boolean(),
  }),
  visibility: z.object({
    profileVisible: z.boolean(),
    appointmentHistory: z.boolean(),
    medicalHistory: z.boolean(),
    contactInfo: z.boolean(),
  }),
  security: z.object({
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.boolean(),
    loginNotifications: z.boolean(),
    deviceTracking: z.boolean(),
  }),
});

// Email Update Schema
export const emailUpdateSchema = z.object({
  newEmail: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required for email changes"),
});

// Type exports
export type PatientProfileFormData = z.infer<typeof patientProfileSchema>;
export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;
export type AllergyFormData = z.infer<typeof allergySchema>;
export type InsuranceFormData = z.infer<typeof insuranceSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;

// Blood type options (updated to match schema)
export const bloodTypeOptions = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

// Gender options (updated to match schema)
export const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
  { value: "U", label: "Prefer not to say" }
];

// Language options
export const languageOptions = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Other"
];

// Emergency contact relation options
export const emergencyContactRelationOptions = [
  "Spouse", "Parent", "Child", "Sibling", "Friend", "Guardian",
  "Grandparent", "Aunt/Uncle", "Cousin", "Partner", "Other"
];

// Country options (common ones)
export const countryOptions = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany",
  "France", "Italy", "Spain", "China", "Japan", "India", "Brazil",
  "Mexico", "Russia", "Other"
];

// US States options
export const usStatesOptions = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];
