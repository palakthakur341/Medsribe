"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Clock } from "lucide-react";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { CancelDialogProps, RescheduleDialogProps } from "../types";

/**
 * Cancel appointment dialog component
 * 
 * Features:
 * - Confirmation dialog for canceling appointments
 * - Loading state support
 * - Accessible design
 * - Customizable content
 * 
 * @param props - CancelDialogProps
 * @returns JSX.Element
 */
export const CancelDialog = React.memo<CancelDialogProps>(({
  open,
  onOpenChange,
  appointmentId,
  appointment,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = React.useCallback(async () => {
    if (!appointmentId) return;
    
    try {
      await onConfirm(appointmentId, "Cancelled by patient");
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to cancel appointment:", error);
    }
  }, [appointmentId, onConfirm, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="mt-2 p-2 bg-muted rounded text-sm">
            <strong>Appointment Details:</strong><br />
            {appointment.doctor && `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}<br />
            {new Date(appointment.appointmentDateTime).toLocaleString()}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !appointmentId}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CancelDialog.displayName = "CancelDialog";

/**
 * Reschedule appointment dialog component
 *
 * Features:
 * - Request-based reschedule system
 * - Optional slot selection or general request
 * - Reason input for the request
 * - Shows current appointment details
 *
 * @param props - RescheduleDialogProps
 * @returns JSX.Element
 */
export const RescheduleDialog = React.memo<RescheduleDialogProps>(({
  open,
  onOpenChange,
  appointmentId,
  appointment,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [showSlotSelector, setShowSlotSelector] = React.useState<boolean>(false);

  const handleClose = React.useCallback(() => {
    setSelectedSlotId("");
    setReason("");
    setShowSlotSelector(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmitRequest = React.useCallback(async () => {
    if (!appointmentId || !reason.trim()) return;

    try {
      // Submit reschedule request with optional slot selection
      await onConfirm({
        appointmentId,
        requestedSlotId: selectedSlotId || undefined,
        reason: reason.trim(),
      });
      handleClose();
    } catch (error) {
      console.error("Failed to submit reschedule request:", error);
    }
  }, [appointmentId, selectedSlotId, reason, onConfirm, handleClose]);

  const handleSlotSelect = React.useCallback((slotId: any, slotInfo: any) => {
    setSelectedSlotId(slotId);
  }, []);

  // Get doctor ID from appointment
  const doctorId = appointment?.doctor?._id;

  // Get next available slot for display outside calendar
  const nextAvailableSlot = useQuery(
    api.slotAvailability.getNextAvailableSlot,
    doctorId ? { doctorId } : "skip"
  );

  // Helper function to format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Request Appointment Reschedule
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Submit a request to reschedule your appointment. Our office will review and respond to your request promptly.
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">
                {new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="text-muted-foreground">at</span>
              <span className="font-medium">
                {new Date(appointment.appointmentDateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Rescheduling
              </Label>
            </div>
            <Textarea
              id="reason"
              placeholder="Please explain why you need to reschedule this appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[90px] resize-none border-border/50 focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This helps us understand your situation and prioritize your request.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                  <Label className="text-sm font-medium">Preferred New Time</Label>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </div>

                <Button
                  variant={showSlotSelector ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSlotSelector(!showSlotSelector)}
                  disabled={isLoading}
                  className="h-8 px-4 text-xs"
                >
                  {showSlotSelector ? (
                    <>
                      <Calendar className="h-3 w-3 mr-1.5" />
                      Hide Calendar
                    </>
                  ) : (
                    <>
                      <Calendar className="h-3 w-3 mr-1.5" />
                      Browse Available Times
                    </>
                  )}
                </Button>
              </div>

              {selectedSlotId && (
                <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Time selected
                </div>
              )}
            </div>

            {showSlotSelector && doctorId && (
              <div className="space-y-4">
                {/* Next Available - Outside calendar container */}
                {nextAvailableSlot && (
                  <div className="p-3 bg-primary/10 rounded-lg border-primary/20 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Next Available:</span>
                        <span className="font-medium">
                          {format(new Date(nextAvailableSlot.dateTime), 'EEE, MMM d')}
                        </span>
                        <span className="text-muted-foreground">at</span>
                        <span className="font-medium">
                          {formatTime(nextAvailableSlot.slot.time)}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleSlotSelect(nextAvailableSlot.slot._id, nextAvailableSlot.slot)}
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                )}

                {/* Calendar Container */}
                <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                  <PatientSlotSelector
                    doctorId={doctorId}
                    onSlotSelect={handleSlotSelect}
                    selectedSlotId={selectedSlotId}
                    showNextAvailable={false}
                  />
                </div>
              </div>
            )}

            {selectedSlotId && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Preferred time selected
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    We'll do our best to accommodate your preferred time when processing your request.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="h-10 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            disabled={isLoading || !reason.trim()}
            className="h-10 px-6 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

RescheduleDialog.displayName = "RescheduleDialog";

/**
 * Generic confirmation dialog component
 * 
 * @param props - Confirmation dialog props
 * @returns JSX.Element
 */
interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

export const ConfirmationDialog = React.memo<ConfirmationDialogProps>(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  variant = "default",
}) => {
  const handleConfirm = React.useCallback(async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  }, [onConfirm, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";
