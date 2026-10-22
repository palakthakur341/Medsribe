import { useMemo } from "react";
import type { UsePatientFormattersReturn, AssignmentType, Patient } from "../types";

/**
 * Custom hook for patient formatting utilities
 * 
 * Features:
 * - Age calculation from date of birth
 * - Assignment type formatting
 * - Patient name formatting
 * - Address formatting
 * - Badge variant selection
 * 
 * @returns {UsePatientFormattersReturn} Formatting utilities
 */
export function usePatientFormatters(): UsePatientFormattersReturn {
  // Memoized formatters to prevent unnecessary re-renders
  const formatters = useMemo(() => ({
    calculateAge: (dateOfBirth: string): number => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    },

    formatAssignmentType: (assignedBy: AssignmentType): string => {
      const labels = {
        referral_acceptance: "Referral",
        appointment_scheduling: "Appointment",
        direct_assignment: "Direct"
      };

      return labels[assignedBy] || assignedBy;
    },

    formatPatientName: (patient: Patient): string => {
      return `${patient.firstName} ${patient.lastName}`;
    },

    formatAddress: (address: Patient['address']): string => {
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    },

    getAssignmentBadgeVariant: (assignedBy: AssignmentType): "default" | "secondary" | "destructive" | "outline" => {
      switch (assignedBy) {
        case "referral_acceptance":
          return "default";
        case "appointment_scheduling":
          return "secondary";
        case "direct_assignment":
          return "outline";
        default:
          return "secondary";
      }
    }
  }), []);

  return formatters;
}
