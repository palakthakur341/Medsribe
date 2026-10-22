// Export all hooks
export { usePatientDetail } from "./usePatientDetail";
export { useTreatmentManagement } from "./useTreatmentManagement";

export { useAppointmentScheduling } from "./useAppointmentScheduling";
export { usePatientDetailFormatters } from "./usePatientDetailFormatters";

// Re-export types for convenience
export type {
  UsePatientDetailReturn,
  UseTreatmentManagementReturn,
  UseMedicationManagementReturn,
  UseAppointmentSchedulingReturn,
} from "../types";
