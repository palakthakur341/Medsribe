import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { use } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UsePatientDetailReturn } from "../types";

/**
 * Custom hook for managing patient detail data
 * 
 * Features:
 * - Fetches patient information by ID
 * - Gets doctor profile and doctor-patient relationship
 * - Handles authentication and authorization
 * - Provides loading and error states
 * 
 * @param params - Promise containing the patient ID parameter
 * @returns {UsePatientDetailReturn} Patient detail data and utilities
 */
export function usePatientDetail(
  params: Promise<{ id: string }>
): UsePatientDetailReturn {
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  // Validate that the ID is a valid patient ID format
  // Convex IDs are typically alphanumeric strings, not simple words like "add"
  const isValidPatientId = patientId &&
    patientId !== "add" &&
    patientId.length > 10 &&
    /^[a-zA-Z0-9]+$/.test(patientId);

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get patient details - only if we have a valid patient ID
  const patient = useQuery(
    api.patients.getPatientById,
    isValidPatientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Get doctor-patient relationship - only if we have valid data
  const currentDoctorPatient = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && isValidPatientId ? {
      doctorId: doctorProfile._id,
      patientId: patientId as Id<"patients">
    } : "skip"
  );

  // Determine loading state
  const isLoading = (
    !session ||
    doctorProfile === undefined ||
    (isValidPatientId && patient === undefined) ||
    (isValidPatientId && currentDoctorPatient === undefined)
  );

  // Check for authentication and authorization
  const isAuthenticated = session?.user?.role === "doctor";
  const hasValidId = isValidPatientId;
  const hasAccess = isAuthenticated && hasValidId && patient && doctorProfile && currentDoctorPatient;

  return {
    patient: hasAccess ? patient : null,
    doctorProfile: hasAccess ? doctorProfile : null,
    currentDoctorPatient: hasAccess ? currentDoctorPatient : null,
    isLoading,
    error: !isAuthenticated
      ? "Unauthorized access"
      : !hasValidId
        ? "Invalid patient ID"
        : null,
  };
}
