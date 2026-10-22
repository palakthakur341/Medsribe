"use client";

import { useState, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { UseAppointmentDialogsReturn, CancelDialogState, RescheduleDialogState } from "../types";

/**
 * Custom hook for managing appointment dialog states
 * 
 * Features:
 * - Manages cancel dialog state and handlers
 * - Manages reschedule dialog state and handlers
 * - Provides clean open/close functions
 * - Maintains appointment ID context
 * - Optimized with useCallback for performance
 * 
 * @returns {UseAppointmentDialogsReturn} Dialog states and handlers
 */
export function useAppointmentDialogs(): UseAppointmentDialogsReturn {
  // Cancel dialog state
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState>({
    open: false,
    appointmentId: null,
    reason: undefined,
  });

  // Reschedule dialog state
  const [rescheduleDialog, setRescheduleDialog] = useState<RescheduleDialogState>({
    open: false,
    appointmentId: null,
    newDateTime: undefined,
    newDuration: undefined,
  });

  // Cancel dialog handlers
  const openCancelDialog = useCallback((appointmentId: Id<"appointments">) => {
    setCancelDialog({
      open: true,
      appointmentId,
      reason: undefined,
    });
  }, []);

  const closeCancelDialog = useCallback(() => {
    setCancelDialog({
      open: false,
      appointmentId: null,
      reason: undefined,
    });
  }, []);

  // Reschedule dialog handlers
  const openRescheduleDialog = useCallback((appointmentId: Id<"appointments">) => {
    setRescheduleDialog({
      open: true,
      appointmentId,
      newDateTime: undefined,
      newDuration: undefined,
    });
  }, []);

  const closeRescheduleDialog = useCallback(() => {
    setRescheduleDialog({
      open: false,
      appointmentId: null,
      newDateTime: undefined,
      newDuration: undefined,
    });
  }, []);

  return {
    cancelDialog,
    rescheduleDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
  };
}
