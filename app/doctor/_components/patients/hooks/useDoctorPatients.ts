import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { 
  UseDoctorPatientsReturn, 
  DoctorPatient, 
  PatientStats,
  Doctor
} from "../types";

/**
 * Custom hook for managing doctor patients data
 * 
 * Features:
 * - Fetches patients assigned to a specific doctor
 * - Provides filtering and search functionality
 * - Calculates patient statistics
 * - Handles loading and error states
 * 
 * @param doctorProfile - The doctor's profile data
 * @returns {UseDoctorPatientsReturn} Patients data and utilities
 */
export function useDoctorPatients(
  doctorProfile: Doctor | null | undefined
): UseDoctorPatientsReturn {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch assigned patients
  const patients = useQuery(
    api.doctorPatients.getPatientsByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  ) as DoctorPatient[] | undefined;

  // Filter patients based on search
  const filteredPatients = useMemo((): DoctorPatient[] => {
    if (!patients) return [];

    if (!searchTerm.trim()) return patients;

    const searchLower = searchTerm.toLowerCase();
    return patients.filter(relationship => {
      const patient = relationship.patient;
      if (!patient) return false;

      return (
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.primaryPhone?.includes(searchTerm) ||
        patient.mrn?.toLowerCase().includes(searchLower)
      );
    });
  }, [patients, searchTerm]);

  // Calculate statistics
  const stats = useMemo((): PatientStats => {
    if (!patients) {
      return {
        total: 0,
        active: 0,
        recentlyAdded: 0,
        withUpcomingAppointments: 0
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: patients.length,
      active: patients.filter(p => p.isActive).length,
      recentlyAdded: patients.filter(p => new Date(p.assignedAt) >= thirtyDaysAgo).length,
      withUpcomingAppointments: 0, // TODO: Calculate based on appointments data
    };
  }, [patients]);

  return {
    patients,
    filteredPatients,
    stats,
    isLoading: patients === undefined,
    error: null, // TODO: Add error handling
    searchTerm,
    setSearchTerm,
  };
}
