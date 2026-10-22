import { Id } from "@/convex/_generated/dataModel";

// Core interfaces
export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  userId: Id<"users">;
  email?: string;
  mrn?: string;
  dateOfBirth?: string;
  gender?: "M" | "F" | "Other";
  primaryPhone?: string;
  secondaryPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  nationalId?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredLanguage?: string;
  consentForTreatment?: boolean;
  consentForDataSharing?: boolean;
  advanceDirectives?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Form data interface
export interface PatientProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "M" | "F" | "Other";
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nationalId?: string;
  bloodType?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  preferredLanguage: string;
  consentForTreatment: boolean;
  consentForDataSharing: boolean;
  advanceDirectives?: string;
}

// Form section interfaces
export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export interface PersonalInfoSectionProps {
  form: any; // React Hook Form instance
}

export interface AddressSectionProps {
  form: any; // React Hook Form instance
}

export interface MedicalInfoSectionProps {
  form: any; // React Hook Form instance
}

export interface EmergencyContactSectionProps {
  form: any; // React Hook Form instance
}

export interface ConsentSectionProps {
  form: any; // React Hook Form instance
}

// Hook return types
export interface UsePatientAuthReturn {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  isLoading: boolean;
  isAuthenticated: boolean;
  isPatient: boolean;
  user: any;
  patientProfile: Patient | undefined;
  redirectToLogin: () => void;
}

export interface UsePatientProfileReturn {
  patientProfile: Patient | undefined;
  isLoading: boolean;
  updateProfile: (data: any) => Promise<void>;
  createProfile: (data: any) => Promise<void>;
  isUpdating: boolean;
  error: Error | null;
}

// Component props interfaces
export interface ProfileHeaderProps {
  patientProfile?: Patient;
  session?: any;
  className?: string;
}

export interface ProfileFormProps {
  patientProfile?: Patient;
  onSubmit: (data: PatientProfileFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// Validation and options
export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: keyof PatientProfileFormData;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "textarea" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  description?: string;
  validation?: any;
}

// Progress tracking
export interface ProfileCompletionStatus {
  totalFields: number;
  completedFields: number;
  completionPercentage: number;
  missingRequiredFields: string[];
  isComplete: boolean;
}

// Loading and error states
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error: Error | null;
}

// Event types
export type ProfileEventType = "created" | "updated" | "viewed" | "exported";

export interface ProfileEvent {
  type: ProfileEventType;
  patientId: Id<"patients">;
  timestamp: number;
  data: any;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  role?: string;
}

// Theme and styling types
export interface ProfileTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    muted: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Constants
export const REQUIRED_FIELDS: (keyof PatientProfileFormData)[] = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'gender',
  'primaryPhone',
  'email',
  'addressLine1',
  'city',
  'state',
  'zipCode',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelation',
];

export const BLOOD_TYPE_OPTIONS: SelectOption[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "Other", label: "Other" },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
];

export const EMERGENCY_CONTACT_RELATION_OPTIONS: SelectOption[] = [
  { value: "Spouse", label: "Spouse" },
  { value: "Parent", label: "Parent" },
  { value: "Child", label: "Child" },
  { value: "Sibling", label: "Sibling" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
];

export const US_STATES_OPTIONS: SelectOption[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  // Add more states as needed
];

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  // Add more countries as needed
];
