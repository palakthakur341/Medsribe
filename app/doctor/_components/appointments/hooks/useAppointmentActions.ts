import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UseAppointmentActionsReturn, Appointment } from "../types";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

/**
 * Custom hook for handling appointment actions (UPDATED for new slot-based system)
 *
 * Features:
 * - Appointment status updates (cancel, confirm, start, complete)
 * - Slot-based rescheduling functionality
 * - Video call joining
 * - Loading states for each action
 * - Error handling and reporting
 * - Automatic slot management
 *
 * @returns {UseAppointmentActionsReturn} Action handlers and state
 */
export function useAppointmentActions(): UseAppointmentActionsReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // NEW: Slot-based Convex mutations
  const updateAppointmentStatus = useMutation(api.appointments.updateStatus);
  const cancelWithSlotRelease = useMutation(api.appointments.cancelWithSlotRelease);
  const rescheduleWithSlot = useMutation(api.appointments.rescheduleWithSlot);

  // Helper function to manage loading state
  const withLoading = useCallback(async <T,>(
    appointmentId: Id<"appointments">,
    action: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const key = `${appointmentId}-${action}`;
    
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

  // Cancel appointment (NEW: with automatic slot release)
  const cancelAppointment = useCallback(async (appointmentId: Id<"appointments">, reason?: string) => {
    await withLoading(appointmentId, "cancel", async () => {
      await cancelWithSlotRelease({
        appointmentId,
        reason: reason || "Cancelled by doctor"
      });
    });
  }, [cancelWithSlotRelease, withLoading]);

  // Confirm appointment
  const confirmAppointment = useCallback(async (
    appointmentId: Id<"appointments">,
    appointmentData?: any // Optional: for RAG embedding
  ) => {
    await withLoading(appointmentId, "confirm", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "confirmed"
      });

      // 🔥 Embed confirmation into RAG system (production-ready)
      if (appointmentData) {
        const patientName = appointmentData.patient
          ? `${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`
          : 'patient';
        const doctorName = appointmentData.doctor
          ? `${appointmentData.doctor.firstName} ${appointmentData.doctor.lastName}`
          : 'doctor';

        appointmentRAGHooks.onAppointmentConfirmed({
          appointmentId: appointmentId,
          doctorId: appointmentData.doctor?._id || appointmentData.doctorId,
          patientId: appointmentData.patient?._id || appointmentData.patientId,
          appointmentDateTime: appointmentData.appointmentDateTime,
          appointmentType: appointmentData.appointmentType,
          visitReason: appointmentData.visitReason,
          location: appointmentData.location,
          notes: appointmentData.notes,
          patientName,
          doctorName,
        }, 'doctor');
      }
    });
  }, [updateAppointmentStatus, withLoading]);

  // Start appointment
  const startAppointment = useCallback(async (appointmentId: Id<"appointments">) => {
    await withLoading(appointmentId, "start", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "in_progress"
      });
    });
  }, [updateAppointmentStatus, withLoading]);

  // Complete appointment
  const completeAppointment = useCallback(async (
    appointmentId: Id<"appointments">,
    appointmentData?: any, // Optional: for RAG embedding
    duration?: number,
    notes?: string
  ) => {
    await withLoading(appointmentId, "complete", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "completed",
        notes
      });

      // 🔥 Embed completion into RAG system (production-ready)
      if (appointmentData) {
        const patientName = appointmentData.patient
          ? `${appointmentData.patient.firstName} ${appointmentData.patient.lastName}`
          : 'patient';
        const doctorName = appointmentData.doctor
          ? `${appointmentData.doctor.firstName} ${appointmentData.doctor.lastName}`
          : 'doctor';

        appointmentRAGHooks.onAppointmentCompleted({
          appointmentId: appointmentId,
          doctorId: appointmentData.doctor?._id || appointmentData.doctorId,
          patientId: appointmentData.patient?._id || appointmentData.patientId,
          appointmentDateTime: appointmentData.appointmentDateTime,
          appointmentType: appointmentData.appointmentType,
          visitReason: appointmentData.visitReason,
          location: appointmentData.location,
          notes: appointmentData.notes,
          patientName,
          doctorName,
        }, duration, notes);
      }
    });
  }, [updateAppointmentStatus, withLoading]);

  // Reschedule appointment (NEW: slot-based with automatic slot management)
  const rescheduleAppointment = useCallback(async (
    appointmentId: Id<"appointments">,
    newDateTime: Date,
    reason?: string
  ) => {
    await withLoading(appointmentId, "reschedule", async () => {
      // For now, we need to find the slot ID that corresponds to the new date/time
      // This would typically be passed from the slot selector component
      // For backward compatibility, we'll throw an error asking for slot-based reschedule
      throw new Error("Please use rescheduleAppointmentWithSlot for slot-based rescheduling");
    });
  }, [withLoading]);

  // NEW: Slot-based reschedule appointment
  const rescheduleAppointmentWithSlot = useCallback(async (
    appointmentId: Id<"appointments">,
    newSlotId: Id<"timeSlots">,
    reason?: string
  ) => {
    await withLoading(appointmentId, "reschedule", async () => {
      await rescheduleWithSlot({
        appointmentId,
        newSlotId,
        reason
      });
    });
  }, [rescheduleWithSlot, withLoading]);

  // Join video call
  const joinCall = useCallback((appointment: Appointment) => {
    if (appointment.location?.type === "telemedicine" && appointment.location.meetingLink) {
      window.open(appointment.location.meetingLink, "_blank");
    } else {
      // Fallback to a generic meeting room or show error
      console.warn("No meeting link available for this appointment");
    }
  }, []);

  return {
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    rescheduleAppointment, // Legacy - throws error
    rescheduleAppointmentWithSlot, // NEW: Slot-based reschedule
    joinCall,
    loadingStates,
    errors,
  };
}
