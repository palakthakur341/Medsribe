// Export all hooks
export {
  useDoctorAuth,
  useDoctorAppointments,
  useAppointmentActions,
  useAppointmentFormatters,
} from './hooks';

// Export all components
export {
  AppointmentCard,
  AppointmentsList,
  AppointmentFilters,
  AppointmentsSkeleton,
  AppointmentDetails,
} from './components';

// Export all types
export type {
  // Core data types
  Appointment,
  Doctor,
  Patient,
  AppointmentStatus,
  AppointmentType,
  AppointmentLocation,
  CategorizedAppointments,
  AppointmentCategory,
  AppointmentStats,
  
  // Hook return types
  UseDoctorAuthReturn,
  UseDoctorAppointmentsReturn,
  UseAppointmentActionsReturn,
  UseAppointmentFormattersReturn,
  
  // Component prop types
  AppointmentCardProps,
  AppointmentsListProps,
  AppointmentFiltersProps,
  AppointmentsSkeletonProps,
  
  // Utility types
  AppointmentFilters as AppointmentFilterState,
  AppointmentAction,
  AppointmentActionPayload,
  AppointmentError,
  LoadingStates,
} from './types';
