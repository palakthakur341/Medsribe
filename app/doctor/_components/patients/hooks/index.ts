// Export all patient hooks
export { useDoctorPatients } from './useDoctorPatients';
export { usePatientActions } from './usePatientActions';
export { usePatientFormatters } from './usePatientFormatters';

// Re-use the auth hook from appointments
export { useDoctorAuth } from '../../appointments/hooks/useDoctorAuth';

// Re-export types for convenience
export type {
  UseDoctorAuthReturn,
  UseDoctorPatientsReturn,
  UsePatientActionsReturn,
  UsePatientFormattersReturn,
} from '../types';
