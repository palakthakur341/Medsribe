// Export all appointment components
export { AppointmentCard } from './AppointmentCard';
export { AppointmentsList } from './AppointmentsList';
export { AppointmentFilters } from './AppointmentFilters';
export { AppointmentsSkeleton } from './AppointmentsSkeleton';
export { AppointmentDetails } from './AppointmentDetails';
export { RescheduleDialog } from './RescheduleDialog';

// Re-export component prop types for convenience
export type {
  AppointmentCardProps,
  AppointmentsListProps,
  AppointmentFiltersProps,
  AppointmentsSkeletonProps,
} from '../types';
