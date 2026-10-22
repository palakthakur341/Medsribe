// Export all hooks
export {
  useDoctorAuth,
  useDoctorPatients,
  usePatientActions,
  usePatientFormatters,
} from './hooks';

// Export all components
export {
  PatientCard,
  PatientsList,
  PatientFilters,
  PatientsSkeleton,
  AddPatientDialog,
} from './components';

// Export all types
export type {
  // Core data types
  Patient,
  Doctor,
  DoctorPatient,
  Treatment,
  Medication,
  Appointment,
  AssignmentType,
  PatientStats,
  
  // Hook return types
  UseDoctorAuthReturn,
  UseDoctorPatientsReturn,
  UsePatientActionsReturn,
  UsePatientFormattersReturn,
  
  // Component prop types
  PatientCardProps,
  PatientsListProps,
  PatientFiltersProps,
  PatientsSkeletonProps,
  
  // Patient detail page types
  PatientHeaderProps,
  PatientOverviewProps,
  TreatmentSectionProps,
  MedicationSectionProps,
  AppointmentSectionProps,
  ChatSectionProps,
  
  // Add patient form types
  AddPatientFormData,
  AddPatientFormProps,
  PatientFormFieldsProps,
  
  // Utility types
  PatientAction,
  PatientActionPayload,
  PatientError,
  LoadingStates,
} from './types';
