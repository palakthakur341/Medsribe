import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UsePatientActionsReturn, AssignmentType } from "../types";

/**
 * Custom hook for handling patient actions
 * 
 * Features:
 * - Patient assignment and removal
 * - Update patient notes
 * - Loading states for each action
 * - Error handling and reporting
 * 
 * @returns {UsePatientActionsReturn} Action handlers and state
 */
export function usePatientActions(): UsePatientActionsReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convex mutations
  const assignPatientMutation = useMutation(api.doctorPatients.assignPatient);
  const removePatientMutation = useMutation(api.doctorPatients.removePatient);
  const updateNotesMutation = useMutation(api.doctorPatients.updateNotes);

  // Helper function to manage loading state
  const withLoading = useCallback(async <T,>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: "" }));
      
      const result = await fn();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setErrors(prev => ({ ...prev, [key]: errorMessage }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // Assign patient to doctor
  const assignPatient = useCallback(async (
    patientId: Id<"patients">, 
    assignmentType: AssignmentType
  ) => {
    await withLoading(`assign-${patientId}`, async () => {
      await assignPatientMutation({
        patientId,
        assignedBy: assignmentType
      });
    });
  }, [assignPatientMutation, withLoading]);

  // Remove patient from doctor
  const removePatient = useCallback(async (doctorPatientId: Id<"doctorPatients">) => {
    await withLoading(`remove-${doctorPatientId}`, async () => {
      await removePatientMutation({
        doctorPatientId
      });
    });
  }, [removePatientMutation, withLoading]);

  // Update patient notes
  const updatePatientNotes = useCallback(async (
    doctorPatientId: Id<"doctorPatients">, 
    notes: string
  ) => {
    await withLoading(`update-notes-${doctorPatientId}`, async () => {
      await updateNotesMutation({
        doctorPatientId,
        notes
      });
    });
  }, [updateNotesMutation, withLoading]);

  return {
    assignPatient,
    removePatient,
    updatePatientNotes,
    loadingStates,
    errors,
  };
}
