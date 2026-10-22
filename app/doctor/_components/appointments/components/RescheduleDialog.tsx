"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { toast } from "sonner";
import type { Appointment } from "../types";

interface RescheduleDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (appointmentId: string, newSlotId: string, reason?: string, slotData?: any) => void;
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onReschedule,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSlotSelector, setShowSlotSelector] = useState(false);

  const handleSlotSelect = (slotId: string, slotInfo: any) => {
    setSelectedSlotId(slotId);
    setSelectedSlot(slotInfo);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSubmit = async () => {
    if (!appointment || !selectedSlot) {
      toast.error("Please select a new time slot");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for rescheduling");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the reschedule handler with slot ID and slot data
      await onReschedule?.(appointment._id, selectedSlotId, reason, selectedSlot);

      // Reset form and close dialog
      setSelectedSlotId("");
      setSelectedSlot(null);
      setReason("");
      setShowSlotSelector(false);
      onOpenChange(false);

      toast.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Failed to reschedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedSlotId("");
    setSelectedSlot(null);
    setReason("");
    setShowSlotSelector(false);
    onOpenChange(false);
  };

  if (!appointment) return null;

  const currentDateTime = new Date(appointment.appointmentDateTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-primary" />
            </div>
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Select a new date and time for this appointment. The patient will be notified of the change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Appointment Info */}
          <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">
                {format(currentDateTime, "MMM d")} at {format(currentDateTime, "h:mm a")}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </span>
            </div>
          </div>

          {/* Browse Available Times Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Select New Time</span>
              {selectedSlot && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Time selected
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSlotSelector(!showSlotSelector)}
              className="text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {showSlotSelector ? "Hide" : "Browse Available Times"}
            </Button>
          </div>

          {showSlotSelector && appointment?.doctor?._id && (
            <div className="space-y-4">
              {/* Calendar Container - Exact match to patient dialog */}
              <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                <PatientSlotSelector
                  doctorId={appointment.doctor._id}
                  onSlotSelect={handleSlotSelect}
                  selectedSlotId={selectedSlotId}
                  showNextAvailable={false}
                />
              </div>
            </div>
          )}

          {selectedSlotId && selectedSlot && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  New time selected
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {format(new Date(`${selectedSlot.date}T${selectedSlot.time}`), "EEEE, MMMM d")} at {formatTime(selectedSlot.time)}
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Rescheduling
              </Label>
            </div>
            <Textarea
              id="reason"
              placeholder="Please explain why this appointment needs to be rescheduled..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[90px] resize-none border-border/50 focus:border-primary/50 transition-colors"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              The patient will be notified of this change along with your reason.
            </p>
          </div>


        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSlot || !reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Rescheduling..." : "Reschedule Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
