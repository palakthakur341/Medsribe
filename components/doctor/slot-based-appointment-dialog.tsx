"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  CheckCircle
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

interface SlotBasedAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorPatientId: Id<"doctorPatients">;
  doctorId: Id<"doctors">;
  onSuccess?: () => void;
}

const APPOINTMENT_TYPES = [
  { value: "new_patient", label: "New Patient", description: "First visit with this patient" },
  { value: "follow_up", label: "Follow-up", description: "Follow-up visit" },
  { value: "consultation", label: "Consultation", description: "General consultation" },
  { value: "procedure", label: "Procedure", description: "Medical procedure" },
  { value: "telemedicine", label: "Telemedicine", description: "Virtual appointment" },
  { value: "emergency", label: "Emergency", description: "Urgent care" },
];

export const SlotBasedAppointmentDialog: React.FC<SlotBasedAppointmentDialogProps> = ({
  open,
  onOpenChange,
  doctorPatientId,
  doctorId,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [copayAmount, setCopayAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get available slots for the selected date
  const availableSlots = useQuery(api.timeSlots.getAvailableSlots, {
    doctorId,
    date: selectedDate,
  });

  // Get slots for the next 7 days for quick date selection
  const weekStartDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEndDate = format(addDays(new Date(), 6), 'yyyy-MM-dd');

  const weekSlots = useQuery(api.timeSlots.getAvailableSlotsInRange, {
    doctorId,
    startDate: weekStartDate,
    endDate: weekEndDate,
  });

  // Get doctor-patient relationship to access patient and doctor details
  const doctorPatientRelation = useQuery(api.doctorPatients.getById, {
    doctorPatientId,
  });

  // Create appointment mutation
  const createAppointment = useMutation(api.appointments.createWithSlot);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedSlot("");
      setAppointmentType("");
      setVisitReason("");
      setLocationType("in_person");
      setAddress("");
      setRoom("");
      setMeetingLink("");
      setNotes("");
      setInsuranceVerified(false);
      setCopayAmount("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!selectedSlot || !appointmentType || !visitReason.trim()) {
      toast.error("Please fill in all required fields and select a time slot");
      return;
    }

    setIsCreating(true);
    try {
      const appointmentId = await createAppointment({
        doctorPatientId,
        slotId: selectedSlot as Id<"timeSlots">,
        appointmentType: appointmentType as any,
        visitReason,
        location: {
          type: locationType,
          address: locationType === "in_person" ? address : undefined,
          room: locationType === "in_person" ? room : undefined,
          meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
        },
        notes: notes || undefined,
        insuranceVerified,
        copayAmount: copayAmount ? parseFloat(copayAmount) : undefined,
      });

      // Get the selected slot details for appointment date/time
      const selectedSlotData = availableSlots?.find(slot => slot._id === selectedSlot);
      const appointmentDateTime = selectedSlotData
        ? new Date(`${selectedSlotData.date}T${selectedSlotData.time}`).getTime()
        : Date.now();

      // 🔥 Embed appointment data into RAG system with patient and doctor names
      if (doctorPatientRelation?.patient && doctorPatientRelation?.doctor && appointmentId) {
        const patientName = `${doctorPatientRelation.patient.firstName} ${doctorPatientRelation.patient.lastName}`;
        const doctorName = `${doctorPatientRelation.doctor.firstName} ${doctorPatientRelation.doctor.lastName}`;

        // Enhanced appointment data with detailed information
        const enhancedNotes = notes
          ? `${notes}. Patient should bring current medication list and any recent medical records.`
          : "Patient should bring current medication list and any recent medical records.";

        appointmentRAGHooks.onAppointmentScheduled({
          appointmentId: appointmentId,
          doctorId: doctorId,
          patientId: doctorPatientRelation.patient._id,
          appointmentDateTime,
          appointmentType: appointmentType,
          visitReason,
          location: {
            type: locationType,
            address: locationType === "in_person" ? address : undefined,
            room: locationType === "in_person" ? room : undefined,
            meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
          },
          notes: enhancedNotes,
          patientName,
          doctorName,
        }, {
          scheduledBy: 'doctor',
          bookingMethod: 'online',
          insuranceVerified,
          copayAmount: copayAmount ? parseFloat(copayAmount) : undefined,
          timeSlotId: selectedSlot,
        });
      }

      toast.success("Appointment scheduled successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dateString = format(date, 'yyyy-MM-dd');
    const daySlots = weekSlots?.[dateString] || [];
    
    return {
      date: dateString,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: isSameDay(date, new Date()),
      availableCount: daySlots.length,
    };
  });

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            Schedule New Appointment
          </DialogTitle>
          <DialogDescription className="text-base">
            Select an available time slot and provide appointment details for this patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Select Date</Label>
              <p className="text-sm text-muted-foreground mt-1">Choose an available date</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((dateInfo) => (
                <div
                  key={dateInfo.date}
                  className={cn(
                    "relative border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm text-center",
                    selectedDate === dateInfo.date
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50",
                    dateInfo.availableCount === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => dateInfo.availableCount > 0 && setSelectedDate(dateInfo.date)}
                >
                  <div className="text-xs font-medium opacity-80 mb-1">
                    {dateInfo.dayName.toUpperCase()}
                  </div>
                  <div className="text-lg font-bold mb-1">
                    {dateInfo.dayNumber}
                  </div>
                  <div className="text-xs">
                    {dateInfo.isToday ? (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-medium",
                        selectedDate === dateInfo.date
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )}>
                        Today
                      </span>
                    ) : dateInfo.availableCount > 0 ? (
                      <span className="text-muted-foreground">
                        {dateInfo.availableCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        None
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Times
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {availableSlots === undefined ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No available slots</p>
                  <p className="text-sm text-muted-foreground">
                    Please select a different date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm text-center",
                        selectedSlot === slot._id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedSlot(slot._id)}
                    >
                      <div className="font-semibold text-sm">{formatTime(slot.time)}</div>
                      <div className={cn(
                        "text-xs mt-1",
                        selectedSlot === slot._id ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {formatTime(slot.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Slot Confirmation */}
          {selectedSlot && (
            <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Time slot selected</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDate), 'EEEE, MMMM d')} at {formatTime(availableSlots?.find(s => s._id === selectedSlot)?.time || "")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          {selectedSlot && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Appointment Details</Label>
                <p className="text-sm text-muted-foreground">
                  Provide information about this appointment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <RadioGroup
                    value={locationType}
                    onValueChange={(value) => setLocationType(value as "in_person" | "telemedicine")}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="in_person" id="in_person_dialog" />
                      <Label htmlFor="in_person_dialog" className="flex items-center gap-2 cursor-pointer text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        In Person
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="telemedicine" id="telemedicine_dialog" />
                      <Label htmlFor="telemedicine_dialog" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Video className="h-3 w-3 text-muted-foreground" />
                        Telemedicine
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitReason">Reason for Visit *</Label>
                <Textarea
                  id="visitReason"
                  placeholder="Please describe the reason for this appointment..."
                  className="min-h-[80px] resize-none"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information or special requirements..."
                  className="min-h-[60px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !selectedSlot || !appointmentType || !visitReason.trim()}
            className="flex-1 sm:flex-none"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
