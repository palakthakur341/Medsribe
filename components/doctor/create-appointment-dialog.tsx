"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Loader2,
  CheckCircle
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorPatientId: string;
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

const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  doctorPatientId,
  onSuccess
}: CreateAppointmentDialogProps) {
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [visitReason, setVisitReason] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [copayAmount, setCopayAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Create appointment mutation
  const createAppointment = useMutation(api.appointments.create);

  const handleCreate = async () => {
    if (!appointmentType || !visitReason.trim() || !appointmentDate || !appointmentTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine date and time into a timestamp
    const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(dateTime.getTime())) {
      toast.error("Please enter a valid date and time");
      return;
    }

    // Check if appointment is in the future
    if (dateTime.getTime() <= Date.now()) {
      toast.error("Appointment must be scheduled for a future date and time");
      return;
    }

    setIsCreating(true);
    try {
      await createAppointment({
        doctorPatientId: doctorPatientId as any,
        appointmentDateTime: dateTime.getTime(),
        duration,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointmentType: appointmentType as any,
        visitReason,
        location: {
          type: locationType,
          address: locationType === "in_person" ? address : undefined,
          room: locationType === "in_person" ? room : undefined,
          meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
        },
        notes: notes.trim() || undefined,
        insuranceVerified: insuranceVerified || undefined,
        copayAmount: copayAmount ? parseFloat(copayAmount) : undefined,
      });

      toast.success("Appointment scheduled successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setAppointmentType("");
    setVisitReason("");
    setAppointmentDate("");
    setAppointmentTime("");
    setDuration(30);
    setLocationType("in_person");
    setAddress("");
    setRoom("");
    setMeetingLink("");
    setNotes("");
    setInsuranceVerified(false);
    setCopayAmount("");
  };

  // Generate time slots (9 AM to 5 PM in 15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule a new appointment with the patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointmentType">Appointment Type *</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visit Reason */}
          <div className="space-y-2">
            <Label htmlFor="visitReason">Visit Reason *</Label>
            <Textarea
              id="visitReason"
              placeholder="Describe the reason for this appointment..."
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value.toString()}>
                      {dur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label>Location Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  locationType === "in_person" && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={() => setLocationType("in_person")}
              >
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">In-Person</p>
                  <p className="text-sm text-muted-foreground">At clinic/office</p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  locationType === "telemedicine" && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={() => setLocationType("telemedicine")}
              >
                <CardContent className="p-4 text-center">
                  <Video className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Telemedicine</p>
                  <p className="text-sm text-muted-foreground">Virtual appointment</p>
                </CardContent>
              </Card>
            </div>

            {locationType === "in_person" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Clinic address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    placeholder="Room number"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>
              </div>
            )}

            {locationType === "telemedicine" && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  placeholder="Video call link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={insuranceVerified}
                  onChange={(e) => setInsuranceVerified(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="insurance" className="text-sm">Insurance Verified</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copay">Copay Amount ($)</Label>
                <Input
                  id="copay"
                  type="number"
                  placeholder="0.00"
                  value={copayAmount}
                  onChange={(e) => setCopayAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!appointmentType || !visitReason.trim() || !appointmentDate || !appointmentTime || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Schedule Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
