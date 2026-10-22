import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { UsePatientTreatmentsReturn, TreatmentStats, Id } from "../types";

/**
 * Custom hook for managing patient treatments and medications
 * Handles data fetching, filtering, and statistics calculation
 */
export function usePatientTreatments(patientId?: Id<"patients">): UsePatientTreatmentsReturn {
  // Fetch treatment plans with details
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Fetch prescriptions with details (replacing medications)
  const prescriptions = useQuery(
    api.prescriptions.getByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Memoized loading state
  const isLoading = useMemo(() => {
    return treatmentPlans === undefined || prescriptions === undefined;
  }, [treatmentPlans, prescriptions]);

  // Create treatment plans with their associated prescriptions
  const treatmentsWithPrescriptions = useMemo(() => {
    if (!treatmentPlans || !prescriptions) return [];

    return treatmentPlans.map(treatment => {
      const relatedPrescriptions = prescriptions.filter(prescription =>
        prescription.treatmentPlanId === treatment._id
      );
      return {
        ...treatment,
        prescriptions: relatedPrescriptions
      };
    });
  }, [treatmentPlans, prescriptions]);

  // Get standalone prescriptions (not associated with any treatment)
  const standalonePrescriptions = useMemo(() => {
    if (!prescriptions) return [];
    return prescriptions.filter(prescription => !prescription.treatmentPlanId);
  }, [prescriptions]);

  // Calculate statistics
  const stats = useMemo((): TreatmentStats => {
    const totalTreatments = treatmentPlans?.length || 0;
    const activeTreatments = treatmentPlans?.filter(t => t.status === "active").length || 0;
    const completedTreatments = treatmentPlans?.filter(t => t.status === "completed").length || 0;
    const discontinuedTreatments = treatmentPlans?.filter(t => t.status === "discontinued").length || 0;

    const totalPrescriptions = prescriptions?.length || 0;
    const activePrescriptions = prescriptions?.filter(p => p.status === "filled").length || 0;

    return {
      total: totalTreatments,
      active: activeTreatments,
      completed: completedTreatments,
      discontinued: discontinuedTreatments,
      activeMedications: activePrescriptions, // Keep same property name for compatibility
      totalMedications: totalPrescriptions, // Keep same property name for compatibility
    };
  }, [treatmentPlans, prescriptions]);

  // Refetch function (placeholder for now)
  const refetch = useMemo(() => () => {
    // In a real implementation, this would trigger a refetch of the queries
    console.log("Refetching treatments and prescriptions...");
  }, []);

  return {
    treatmentPlans,
    medications: prescriptions, // Keep same property name for compatibility
    treatmentsWithMedications: treatmentsWithPrescriptions, // Keep same property name for compatibility
    standaloneMedications: standalonePrescriptions, // Keep same property name for compatibility
    isLoading,
    error: null, // Convex queries don't expose errors in the same way
    refetch,
    stats,
  };
}
