// Export all components
export { PatientHeader } from "./PatientHeader";
export { TreatmentList } from "./TreatmentList";
export { TreatmentCard } from "./TreatmentCard";
export { TreatmentDetails } from "./TreatmentDetails";
export { AppointmentForm } from "./AppointmentForm";
export { SlotBasedAppointmentForm } from "./SlotBasedAppointmentForm";
export { PatientChat } from "./PatientChat";
export { PatientDetailSkeleton } from "./PatientDetailSkeleton";
export { TreatmentEmptyState } from "./TreatmentEmptyState";
export { TreatmentDetailsEmptyState } from "./TreatmentDetailsEmptyState";
export { PatientSOAPList } from "./PatientSOAPList";
export { PatientSOAPHistory } from "./PatientSOAPHistory";
export { TreatmentFormLayout } from "./TreatmentFormLayout";

// Treatment Form Components
export { AddTreatmentForm } from "./AddTreatmentForm";
export { TreatmentMedicationEntry } from "./TreatmentMedicationEntry";
export { TreatmentPharmacySelector } from "./TreatmentPharmacySelector";
export { TreatmentSOAPNoteSelector } from "./TreatmentSOAPNoteSelector";

// Re-export types for convenience
export type {
  PatientHeaderProps,
  TreatmentListProps,
  TreatmentDetailsProps,
  AppointmentFormProps,
  PatientChatProps,
} from "../types";
