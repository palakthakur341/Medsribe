import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UseTreatmentManagementReturn, TreatmentPlan } from "../types";
import { medicalRAGHooks } from "@/lib/services/medical-rag-hooks";

/**
 * Custom hook for managing treatment plans
 * 
 * Features:
 * - Fetches treatment plans for a patient
 * - Manages selected treatment state
 * - Handles treatment status updates
 * - Provides filtered active treatments
 * 
 * @param patientId - The patient's ID
 * @returns {UseTreatmentManagementReturn} Treatment management data and utilities
 */
export function useTreatmentManagement(
  patientId: Id<"patients"> | null
): UseTreatmentManagementReturn {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  
  const updateTreatment = useMutation(api.treatmentPlans.update);

  // Get treatment plans
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Filter active treatments
  const activeTreatments = useMemo((): TreatmentPlan[] => {
    return treatmentPlans?.filter(plan => plan.status === "active") || [];
  }, [treatmentPlans]);

  // Get selected treatment
  const selectedTreatment = useMemo((): TreatmentPlan | null => {
    if (!selectedTreatmentId || !activeTreatments.length) return null;
    return activeTreatments.find(t => t._id === selectedTreatmentId) || null;
  }, [selectedTreatmentId, activeTreatments]);

  // Auto-select first treatment if none selected
  if (!selectedTreatmentId && activeTreatments.length > 0) {
    setSelectedTreatmentId(activeTreatments[0]._id);
  }

  // Handle treatment status update
  const handleTreatmentStatusUpdate = useCallback(async (
    treatmentId: string,
    status: string,
    treatmentData?: any // Optional: for RAG embedding
  ): Promise<void> => {
    try {
      await updateTreatment({
        id: treatmentId as any,
        status: status as "active" | "completed" | "discontinued"
      });

      // 🔥 Embed treatment status update into RAG system (production-ready)
      if (treatmentData && (status === 'completed' || status === 'discontinued')) {
        medicalRAGHooks.onTreatmentPlanCreated({
          treatmentId,
          doctorId: treatmentData.doctor?._id || treatmentData.doctorId,
          patientId: treatmentData.patient?._id || treatmentData.patientId,
          appointmentId: treatmentData.appointmentId,
          diagnosis: treatmentData.diagnosis,
          treatmentType: treatmentData.title,
          description: `Treatment ${status}: ${treatmentData.plan}`,
          goals: treatmentData.goals || [],
          duration: treatmentData.endDate ? `${treatmentData.startDate} to ${treatmentData.endDate}` : undefined,
          followUpRequired: status === 'active',
          notes: `Treatment status updated to ${status}`,
          createdAt: Date.now(),
        });
      }

      toast.success(`Treatment ${status} successfully`);
    } catch (error) {
      console.error("Failed to update treatment status:", error);
      toast.error("Failed to update treatment status");
    }
  }, [updateTreatment]);

  return {
    treatmentPlans,
    activeTreatments,
    selectedTreatmentId,
    selectedTreatment,
    setSelectedTreatmentId,
    handleTreatmentStatusUpdate,
    isLoading: treatmentPlans === undefined,
  };
}
