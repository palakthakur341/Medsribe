// Export all appointment hooks
export { useDoctorAuth } from './useDoctorAuth';
export { useDoctorAppointments } from './useDoctorAppointments';
export { useAppointmentActions } from './useAppointmentActions';
export { useAppointmentFormatters } from './useAppointmentFormatters';

// Re-export types for convenience
export type {
  UseDoctorAuthReturn,
  UseDoctorAppointmentsReturn,
  UseAppointmentActionsReturn,
  UseAppointmentFormattersReturn,
} from '../types';
