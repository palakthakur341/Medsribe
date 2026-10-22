"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UseAppointmentActionsReturn, ActionLoadingStates, ActionErrors } from "../types";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

/**
 * Custom hook for handling appointment actions (cancel, reschedule, join)
 * 
 * Features:
 * - Cancel appointment with reason
 * - Reschedule appointment to new date/time
 * - Join telemedicine calls
 * - Individual loading states for each action
 * - Error handling with retry capability
 * - Optimistic updates support
 * 
 * @returns {UseAppointmentActionsReturn} Action handlers and states
 */
export function useAppointmentActions(): UseAppointmentActionsReturn {
  // Convex mutations - using new slot-based functions
  const cancelAppointmentMutation = useMutation(api.appointments.cancelWithSlotRelease);
  const rescheduleAppointmentMutation = useMutation(api.appointments.rescheduleWithSlot);

  // Loading states for each action per appointment
  const [loadingStates, setLoadingStates] = useState<ActionLoadingStates>({
    cancel: {},
    reschedule: {},
    join: {},
  });

  // Error states for each action per appointment
  const [errors, setErrors] = useState<ActionErrors>({
    cancel: {},
    reschedule: {},
    join: {},
  });

  // Helper function to set loading state
  const setLoading = useCallback((action: keyof ActionLoadingStates, appointmentId: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [appointmentId]: loading,
      },
    }));
  }, []);

  // Helper function to set error state
  const setError = useCallback((action: keyof ActionErrors, appointmentId: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [appointmentId]: error,
      },
    }));
  }, []);

  // Clear error function
  const clearError = useCallback((action: keyof ActionErrors, appointmentId: string) => {
    setError(action, appointmentId, null);
  }, [setError]);

  // Cancel appointment action
  const cancelAppointment = useCallback(async (
    appointmentId: Id<"appointments">,
    reason: string = "Cancelled by patient",
    appointmentData?: any // Optional: for RAG embedding
  ) => {
    const appointmentIdStr = appointmentId.toString();

    try {
      setLoading("cancel", appointmentIdStr, true);
      setError("cancel", appointmentIdStr, null);

      await cancelAppointmentMutation({
        appointmentId,
        reason,
      });

      // 🔥 Embed cancellation into RAG system (production-ready)
      if (appointmentData) {
        const patientName = appointmentData.patient
          ? `${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`
          : 'patient';
        const doctorName = appointmentData.doctor
          ? `${appointmentData.doctor.firstName} ${appointmentData.doctor.lastName}`
          : 'doctor';

        appointmentRAGHooks.onAppointmentCancelled({
          appointmentId: appointmentIdStr,
          doctorId: appointmentData.doctor?._id || appointmentData.doctorId,
          patientId: appointmentData.patient?._id || appointmentData.patientId,
          appointmentDateTime: appointmentData.appointmentDateTime,
          appointmentType: appointmentData.appointmentType,
          visitReason: appointmentData.visitReason,
          location: appointmentData.location,
          notes: appointmentData.notes,
          patientName,
          doctorName,
        }, reason, 'patient');
      }

      // Success - loading will be set to false automatically
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      setError("cancel", appointmentIdStr, error instanceof Error ? error.message : "Failed to cancel appointment");
    } finally {
      setLoading("cancel", appointmentIdStr, false);
    }
  }, [cancelAppointmentMutation, setLoading, setError]);

  // Reschedule appointment action (slot-based)
  const rescheduleAppointment = useCallback(async (
    appointmentId: Id<"appointments">,
    newSlotId: Id<"timeSlots">,
    reason?: string
  ) => {
    const appointmentIdStr = appointmentId.toString();

    try {
      setLoading("reschedule", appointmentIdStr, true);
      setError("reschedule", appointmentIdStr, null);

      await rescheduleAppointmentMutation({
        appointmentId,
        newSlotId,
        reason,
      });

      // Success - loading will be set to false automatically
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      setError("reschedule", appointmentIdStr, error instanceof Error ? error.message : "Failed to reschedule appointment");
    } finally {
      setLoading("reschedule", appointmentIdStr, false);
    }
  }, [rescheduleAppointmentMutation, setLoading, setError]);

  // Join call action
  const joinCall = useCallback((meetingLink?: string) => {
    try {
      if (meetingLink) {
        // Open the specific meeting link
        window.open(meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to generic telemedicine platform
        window.open('/patient/telemedicine', '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("Failed to join call:", error);
      // Could set an error state here if needed
    }
  }, []);

  return {
    cancelAppointment,
    rescheduleAppointment,
    joinCall,
    loadingStates,
    errors,
    clearError,
  };
}
