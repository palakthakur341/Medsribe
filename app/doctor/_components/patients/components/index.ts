// Export all patient components
export { PatientCard } from './PatientCard';
export { PatientsList } from './PatientsList';
export { PatientFilters } from './PatientFilters';
export { PatientsSkeleton } from './PatientsSkeleton';
export { AddPatientDialog } from './AddPatientDialog';

// Re-export component prop types for convenience
export type {
  PatientCardProps,
  PatientsListProps,
  PatientFiltersProps,
  PatientsSkeletonProps,
} from '../types';
