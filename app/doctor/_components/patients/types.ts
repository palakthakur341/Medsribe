import { Id } from "@/convex/_generated/dataModel";

// Assignment Types
export type AssignmentType = 
  | "referral_acceptance" 
  | "appointment_scheduling" 
  | "direct_assignment";

// Core Data Types
export interface Patient {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone?: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  mrn: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Doctor {
  _id: Id<"doctors">;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  primarySpecialty?: string;
  licenseNumber?: string;
}

export interface DoctorPatient {
  _id: Id<"doctorPatients">;
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  assignedBy: AssignmentType;
  relatedActionId?: Id<"appointments"> | Id<"referrals">;
  assignedAt: number;
  isActive: boolean;
  notes?: string;
  // Added by API query
  patient: Patient | null;
  doctor: Doctor | null;
}

export interface Treatment {
  _id: Id<"treatments">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  treatmentName: string;
  description?: string;
  startDate: number;
  endDate?: number;
  status: "active" | "completed" | "discontinued";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Medication {
  _id: Id<"medications">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate: number;
  endDate?: number;
  status: "active" | "completed" | "discontinued";
  createdAt: number;
  updatedAt: number;
}

export interface Appointment {
  _id: Id<"appointments">;
  doctorPatientId: Id<"doctorPatients">;
  appointmentDateTime: number;
  duration: number;
  timeZone: string;
  appointmentType: "new_patient" | "follow_up" | "consultation" | "procedure" | "telemedicine" | "emergency";
  status: "scheduled" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled" | "rescheduled";
  visitReason: string;
  location: {
    type: "in_person" | "telemedicine";
    address?: string;
    room?: string;
    meetingLink?: string;
    instructions?: string;
  };
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Statistics
export interface PatientStats {
  total: number;
  active: number;
  recentlyAdded: number;
  withUpcomingAppointments: number;
}

// Hook Return Types
export interface UseDoctorAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  doctorProfile: Doctor | null | undefined;
}

export interface UseDoctorPatientsReturn {
  patients: DoctorPatient[] | undefined;
  filteredPatients: DoctorPatient[];
  stats: PatientStats;
  isLoading: boolean;
  error: string | null;
  // Filter controls
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface UsePatientActionsReturn {
  assignPatient: (patientId: Id<"patients">, assignmentType: AssignmentType) => Promise<void>;
  removePatient: (doctorPatientId: Id<"doctorPatients">) => Promise<void>;
  updatePatientNotes: (doctorPatientId: Id<"doctorPatients">, notes: string) => Promise<void>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface UsePatientFormattersReturn {
  calculateAge: (dateOfBirth: string) => number;
  formatAssignmentType: (assignedBy: AssignmentType) => string;
  formatPatientName: (patient: Patient) => string;
  formatAddress: (address: Patient['address']) => string;
  getAssignmentBadgeVariant: (assignedBy: AssignmentType) => "default" | "secondary" | "destructive" | "outline";
}

// Component Props
export interface PatientCardProps {
  relationship: DoctorPatient;
  onView?: (patientId: Id<"patients">) => void;
  onRemove?: (doctorPatientId: Id<"doctorPatients">) => void;
  isLoading?: boolean;
  className?: string;
}

export interface PatientsListProps {
  patients: DoctorPatient[];
  isLoading?: boolean;
  emptyMessage?: string;
  onPatientAction?: (action: string, patientId: Id<"patients">) => void;
  className?: string;
}

export interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddPatient?: () => void;
  className?: string;
}

export interface PatientStatsProps {
  stats: PatientStats;
  isLoading?: boolean;
  className?: string;
}

export interface PatientsSkeletonProps {
  showHeader?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  patientCount?: number;
}

// Patient Detail Page Types
export interface PatientHeaderProps {
  patient: Patient;
  relationship: DoctorPatient;
  onBack?: () => void;
  className?: string;
}

export interface PatientOverviewProps {
  patient: Patient;
  relationship: DoctorPatient;
  treatments?: Treatment[];
  medications?: Medication[];
  appointments?: Appointment[];
  className?: string;
}

export interface TreatmentSectionProps {
  patientId: Id<"patients">;
  treatments: Treatment[];
  onAddTreatment?: () => void;
  onEditTreatment?: (treatmentId: Id<"treatments">) => void;
  className?: string;
}

export interface MedicationSectionProps {
  patientId: Id<"patients">;
  medications: Medication[];
  onAddMedication?: () => void;
  onEditMedication?: (medicationId: Id<"medications">) => void;
  className?: string;
}

export interface AppointmentSectionProps {
  patientId: Id<"patients">;
  appointments: Appointment[];
  onScheduleAppointment?: () => void;
  onViewAppointment?: (appointmentId: Id<"appointments">) => void;
  className?: string;
}

export interface ChatSectionProps {
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  className?: string;
}

// Add Patient Form Types
export interface AddPatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Patient['gender'];
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
}

export interface AddPatientFormProps {
  onSubmit: (data: AddPatientFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export interface PatientFormFieldsProps {
  form: any; // React Hook Form instance
  isLoading?: boolean;
}

// Filter and Search Types
export interface PatientFilters {
  searchTerm: string;
  assignmentType?: AssignmentType[];
  isActive?: boolean;
}

// Action Types
export type PatientAction = 
  | "view" 
  | "remove" 
  | "assign" 
  | "update_notes";

export interface PatientActionPayload {
  action: PatientAction;
  patientId: Id<"patients">;
  doctorPatientId?: Id<"doctorPatients">;
  data?: any;
}

// Error Types
export interface PatientError {
  code: string;
  message: string;
  patientId?: Id<"patients">;
}

// Loading States
export interface LoadingStates {
  patients: boolean;
  profile: boolean;
  actions: Record<string, boolean>;
}
