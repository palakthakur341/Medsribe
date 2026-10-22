import { Id } from "@/convex/_generated/dataModel";

// Base types from the database
export interface Patient {
  _id: Id<"patients">;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryPhone: string;
  dateOfBirth: string;
  gender: string;
  mrn: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Doctor {
  _id: Id<"doctors">;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
}

export interface DoctorPatient {
  _id: Id<"doctorPatients">;
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  assignedAt: number;
  assignedBy: "doctor" | "patient" | "admin";
  isActive: boolean;
  notes?: string;
}

export interface TreatmentPlan {
  _id: Id<"treatmentPlans">;
  patientId: Id<"patients">;
  doctorPatientId: Id<"doctorPatients">;
  soapNoteId?: Id<"soapNotes">;
  title: string;
  diagnosis: string;
  plan: string;
  goals?: string[];
  status: "active" | "completed" | "discontinued";
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  createdAt: number;
  updatedAt: number;

  // Extended properties from API queries
  soapNote?: {
    _id: Id<"soapNotes">;
    timestamp: number;
    data?: {
      specialty_detection?: {
        specialty: string;
      };
      soap_notes?: {
        assessment?: string;
        plan?: string;
      };
    };
  };
  doctorPatient?: any;
  patient?: any;
  doctor?: any;
}

export interface Medication {
  _id: Id<"medications">;
  patientId: Id<"patients">;
  treatmentPlanId?: Id<"treatmentPlans">;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: "active" | "completed" | "discontinued";
  startDate: number;
  endDate?: number;
  treatmentPlan?: TreatmentPlan;
}

export interface AppointmentLocation {
  type: "in_person" | "telemedicine";
  address?: string;
  room?: string;
  meetingLink?: string;
}

export interface AppointmentFormData {
  appointmentType: string;
  visitReason: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  locationType: "in_person" | "telemedicine";
  address: string;
  room: string;
  meetingLink: string;
  notes: string;
  insuranceVerified: boolean;
  copayAmount: string;
}

// Hook return types
export interface UsePatientDetailReturn {
  patient: Patient | null;
  doctorProfile: Doctor | null;
  currentDoctorPatient: DoctorPatient | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseTreatmentManagementReturn {
  treatmentPlans: TreatmentPlan[] | null;
  activeTreatments: TreatmentPlan[];
  selectedTreatmentId: string | null;
  selectedTreatment: TreatmentPlan | null;
  setSelectedTreatmentId: (id: string | null) => void;
  handleTreatmentStatusUpdate: (treatmentId: string, status: string) => Promise<void>;
  isLoading: boolean;
}

export interface UseMedicationManagementReturn {
  medications: Medication[] | null;
  activeMedications: Medication[];
  selectedTreatmentMedications: Medication[];
  handleMedicationStatusUpdate: (medicationId: string, status: string) => Promise<void>;
  isLoading: boolean;
}

export interface UseAppointmentSchedulingReturn {
  formData: AppointmentFormData;
  updateFormData: (field: keyof AppointmentFormData, value: any) => void;
  resetForm: () => void;
  handleCreateAppointment: () => Promise<void>;
  isCreating: boolean;
  timeSlots: Array<{ value: string; label: string }>;
}

// Component props types
export interface PatientHeaderProps {
  patient: Patient;
  onChatToggle: () => void;
  onAppointmentClick: () => void;
  onAddTreatment: () => void;
  onSOAPHistoryToggle?: () => void;
  showChat: boolean;
  showSOAPHistory?: boolean;
  className?: string;
}

export interface TreatmentListProps {
  treatments: TreatmentPlan[];
  selectedTreatmentId: string | null;
  onTreatmentSelect: (id: string) => void;
  onTreatmentComplete: (id: string) => void;
  onAddTreatment: () => void;
  activeMedications: Medication[];
  isLoading?: boolean;
  className?: string;
}

export interface TreatmentDetailsProps {
  treatment: TreatmentPlan | null;
  medications: Medication[];
  onAddMedication: () => void;
  onMedicationComplete: (id: string) => void;
  onShowPrescriptionForm: () => void;
  onAddPrescription?: () => void;
  showPrescriptionForm: boolean;
  patientId: Id<"patients">;
  className?: string;
}

export interface AppointmentFormProps {
  patientId: Id<"patients">;
  currentDoctorPatient: DoctorPatient;
  patient: Patient;
  doctorProfile: Doctor;
  onCancel: () => void;
  onSuccess: () => void;
  className?: string;
}

export interface PatientChatProps {
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  patientName: string;
  onClose: () => void;
  className?: string;
}

// View state types
export type ActiveView = "overview" | "treatment-form" | "medication-form" | "appointment-form" | "prescription-form" | "chat";

// Constants
export const APPOINTMENT_TYPES = [
  { value: "new_patient", label: "New Patient", description: "First visit with this patient" },
  { value: "follow_up", label: "Follow-up", description: "Follow-up visit" },
  { value: "consultation", label: "Consultation", description: "General consultation" },
  { value: "procedure", label: "Procedure", description: "Medical procedure" },
  { value: "telemedicine", label: "Telemedicine", description: "Virtual appointment" },
  { value: "emergency", label: "Emergency", description: "Urgent care" },
] as const;

export const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
] as const;
