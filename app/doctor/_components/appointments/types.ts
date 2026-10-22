import { Id } from "@/convex/_generated/dataModel";

// Appointment Status Types
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled";

export type AppointmentType =
  | "new_patient"
  | "follow_up"
  | "consultation"
  | "procedure"
  | "telemedicine"
  | "emergency";

export type LocationType = "in_person" | "telemedicine";

// Core Data Types
export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  email?: string;
  primaryPhone?: string;
  gender?: string;
  dateOfBirth?: string; // Changed from number to string to match schema
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Doctor {
  _id: Id<"doctors">;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  primarySpecialty?: string;
  licenseNumber?: string;
  profileComplete?: boolean;
}

export interface AppointmentLocation {
  type: LocationType;
  address?: string;
  room?: string;
  meetingLink?: string;
  instructions?: string;
}

export interface DoctorPatient {
  _id: Id<"doctorPatients">;
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  assignedBy: "referral_acceptance" | "appointment_scheduling" | "direct_assignment";
  relatedActionId?: Id<"appointments"> | Id<"referrals">;
  assignedAt: number;
  isActive: boolean;
  notes?: string;
}

export interface Appointment {
  _id: Id<"appointments">;
  doctorPatientId: Id<"doctorPatients">;
  appointmentDateTime: number;
  duration: number;
  timeZone: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  visitReason: string;
  location: AppointmentLocation;
  preVisitQuestionnaire?: string;
  chiefComplaint?: string;
  vitals?: {
    height?: number;
    weight?: number;
    bmi?: number;
    bloodPressure?: string;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  insuranceVerified?: boolean;
  copayAmount?: number;
  notes?: string;
  scheduledAt: number;
  confirmedAt?: number;
  checkedInAt?: number;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"users">;
  // Added by the API query
  doctorPatient: DoctorPatient;
  doctor: Doctor | null;
  patient: Patient | null;
}

// Categorized Appointments
export interface CategorizedAppointments {
  today: Appointment[];
  tomorrow: Appointment[];
  thisWeek: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
}

export type AppointmentCategory = keyof CategorizedAppointments | "all";

// Statistics
export interface AppointmentStats {
  total: number;
  today: number;
  thisWeek: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

// Hook Return Types
export interface UseDoctorAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  doctorProfile: Doctor | null | undefined;
}

export interface UseDoctorAppointmentsReturn {
  appointments: Appointment[] | undefined;
  categorizedAppointments: CategorizedAppointments;
  filteredAppointments: Appointment[];
  stats: AppointmentStats;
  isLoading: boolean;
  error: string | null;
  // Filter controls
  searchTerm: string;
  selectedCategory: AppointmentCategory;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: AppointmentCategory) => void;
}

export interface UseAppointmentActionsReturn {
  cancelAppointment: (appointmentId: Id<"appointments">, reason?: string) => Promise<void>;
  confirmAppointment: (appointmentId: Id<"appointments">) => Promise<void>;
  startAppointment: (appointmentId: Id<"appointments">) => Promise<void>;
  completeAppointment: (appointmentId: Id<"appointments">) => Promise<void>;
  rescheduleAppointment: (appointmentId: Id<"appointments">, newDateTime: Date, reason?: string) => Promise<void>; // Legacy
  rescheduleAppointmentWithSlot: (appointmentId: Id<"appointments">, newSlotId: Id<"timeSlots">, reason?: string) => Promise<void>; // NEW
  joinCall: (appointment: Appointment) => void;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface UseAppointmentFormattersReturn {
  formatTime: (dateTime: number) => string;
  formatDate: (dateTime: number) => string;
  formatDateTime: (dateTime: number) => string;
  getStatusColor: (status: AppointmentStatus) => string;
  getStatusIcon: (status: AppointmentStatus) => React.ReactNode;
  getRelativeTime: (dateTime: number) => string;
}

// Component Props
export interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointmentId: Id<"appointments">) => void;
  onConfirm?: (appointmentId: Id<"appointments">) => void;
  onStart?: (appointmentId: Id<"appointments">) => void;
  onComplete?: (appointmentId: Id<"appointments">) => void;
  onJoinCall?: (appointment: Appointment) => void;
  isLoading?: boolean;
  className?: string;
}

export interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  emptyMessage?: string;
  onAppointmentAction?: (action: string, appointmentId: Id<"appointments">) => void;
  className?: string;
}

export interface AppointmentFiltersProps {
  searchTerm: string;
  selectedCategory: AppointmentCategory;
  categories: Array<{
    key: AppointmentCategory;
    label: string;
    count: number;
  }>;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: AppointmentCategory) => void;
  onScheduleNew?: () => void;
  className?: string;
}

export interface AppointmentStatsProps {
  stats: AppointmentStats;
  isLoading?: boolean;
  className?: string;
}

export interface ProfileCompletionCardProps {
  doctorProfile: Doctor | null | undefined;
  className?: string;
}

export interface AppointmentsSkeletonProps {
  showHeader?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  appointmentCount?: number;
}

// Filter and Search Types
export interface AppointmentFilters {
  searchTerm: string;
  category: AppointmentCategory;
  status?: AppointmentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Action Types
export type AppointmentAction = 
  | "cancel" 
  | "confirm" 
  | "start" 
  | "complete" 
  | "reschedule" 
  | "join_call";

export interface AppointmentActionPayload {
  action: AppointmentAction;
  appointmentId: Id<"appointments">;
  data?: any;
}

// Error Types
export interface AppointmentError {
  code: string;
  message: string;
  appointmentId?: Id<"appointments">;
}

// Loading States
export interface LoadingStates {
  appointments: boolean;
  profile: boolean;
  actions: Record<string, boolean>;
}
