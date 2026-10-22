import { z } from "zod";

export const doctorProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  licenseNumber: z.string().min(1, "License number is required"),
  npiNumber: z.string().min(1, "NPI number is required"),
  deaNumber: z.string().optional(),
  primarySpecialty: z.string().min(1, "Primary specialty is required"),
  secondarySpecialties: z.array(z.string()).optional(),
  boardCertifications: z.array(z.string()).optional(),
  medicalSchool: z.string().min(1, "Medical school is required"),
  residency: z.string().optional(),
  fellowship: z.string().optional(),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or greater"),
});

export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

export const titleOptions = [
  "Dr.",
  "Prof.",
  "Prof. Dr.",
  "MD",
  "DO",
  "MBBS",
  "MBChB",
  "BMBS"
];

export const specialtyOptions = [
  "Anesthesiology",
  "Cardiology",
  "Cardiothoracic Surgery",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Obstetrics and Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Physical Medicine and Rehabilitation",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Vascular Surgery"
];

export const departmentOptions = [
  "Cardiology",
  "Emergency Department",
  "General Medicine",
  "ICU",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery"
];

export const boardCertificationOptions = [
  "American Board of Anesthesiology",
  "American Board of Dermatology",
  "American Board of Emergency Medicine",
  "American Board of Family Medicine",
  "American Board of Internal Medicine",
  "American Board of Neurological Surgery",
  "American Board of Obstetrics and Gynecology",
  "American Board of Ophthalmology",
  "American Board of Orthopedic Surgery",
  "American Board of Otolaryngology",
  "American Board of Pathology",
  "American Board of Pediatrics",
  "American Board of Physical Medicine and Rehabilitation",
  "American Board of Plastic Surgery",
  "American Board of Psychiatry and Neurology",
  "American Board of Radiology",
  "American Board of Surgery",
  "American Board of Urology"
];

export const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Urdu",
  "Tamil",
  "Telugu",
  "Gujarati",
  "Punjabi",
  "Marathi",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Greek",
  "Turkish",
  "Hebrew",
  "Persian",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Swahili"
];

// Practice settings validation
export const practiceSettingsSchema = z.object({
  practiceName: z.string().min(1, "Practice name is required"),
  practiceType: z.string().min(1, "Practice type is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
  fax: z.string().optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  operatingHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    friday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
  acceptsInsurance: z.boolean(),
  insuranceProviders: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

export type PracticeSettingsFormData = z.infer<typeof practiceSettingsSchema>;

export const practiceTypeOptions = [
  "Solo Practice",
  "Group Practice",
  "Hospital-Based",
  "Clinic",
  "Academic Medical Center",
  "Urgent Care",
  "Specialty Center",
  "Telehealth Practice"
];

export const insuranceProviderOptions = [
  "Aetna",
  "Anthem",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "Medicare",
  "Medicaid",
  "UnitedHealth",
  "Tricare",
  "Workers' Compensation"
];
