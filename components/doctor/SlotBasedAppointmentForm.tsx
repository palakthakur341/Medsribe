"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { Id } from "@/convex/_generated/dataModel";

interface SlotBasedAppointmentFormProps {
  doctorId: Id<"doctors">;
  patientName: string;
  onSubmit: (formData: AppointmentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface AppointmentFormData {
  slotId: string;
  appointmentType: string;
  visitReason: string;
  locationType: "in_person" | "telemedicine";
  address?: string;
  room?: string;
  meetingLink?: string;
  notes?: string;
  insuranceVerified: boolean;
  copayAmount?: number;
}

export const SlotBasedAppointmentForm: React.FC<SlotBasedAppointmentFormProps> = ({
  doctorId,
  patientName,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  
  // Form state
  const [appointmentType, setAppointmentType] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [copayAmount, setCopayAmount] = useState("");

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
    if (!selectedSlotId || !appointmentType || !visitReason) {
      return;
    }

    const formData: AppointmentFormData = {
      slotId: selectedSlotId,
      appointmentType,
      visitReason,
      locationType,
      address: locationType === "in_person" ? address : undefined,
      room: locationType === "in_person" ? room : undefined,
      meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
      notes,
      insuranceVerified,
      copayAmount: copayAmount ? parseFloat(copayAmount) : undefined,
    };

    await onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {/* Visit Reason */}
      <div>
        <Label htmlFor="visit-reason" className="text-sm font-medium">
          Visit Reason
        </Label>
        <Input
          id="visit-reason"
          placeholder="Reason for the appointment"
          value={visitReason}
          onChange={(e) => setVisitReason(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Appointment Type */}
      <div>
        <Label className="text-sm font-medium">Appointment Type</Label>
        <Select value={appointmentType} onValueChange={setAppointmentType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_patient">New Patient</SelectItem>
            <SelectItem value="follow_up">Follow-up</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
            <SelectItem value="telemedicine">Telemedicine</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select Time Slot</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSlotSelector(!showSlotSelector)}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {showSlotSelector ? "Hide" : "Browse Times"}
          </Button>
        </div>

        {showSlotSelector && (
          <div className="border rounded-lg p-3 bg-gradient-to-br from-muted/30 to-muted/10">
            <PatientSlotSelector
              doctorId={doctorId}
              onSlotSelect={handleSlotSelect}
              selectedSlotId={selectedSlotId}
              showNextAvailable={false}
            />
          </div>
        )}

        {selectedSlot && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Time slot selected
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {new Date(`${selectedSlot.date}T${selectedSlot.time}`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })} at {formatTime(selectedSlot.time)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location Type */}
      <div>
        <Label className="text-sm font-medium">Location Type</Label>
        <RadioGroup
          value={locationType}
          onValueChange={(value: "in_person" | "telemedicine") => setLocationType(value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="in_person" id="in_person" />
            <Label htmlFor="in_person" className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              In-Person
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="telemedicine" id="telemedicine" />
            <Label htmlFor="telemedicine" className="text-sm flex items-center gap-2">
              <Video className="h-4 w-4" />
              Telemedicine
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Location Details */}
      {locationType === "in_person" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Address
            </Label>
            <Input
              id="address"
              placeholder="Clinic address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="room" className="text-sm font-medium">
              Room
            </Label>
            <Input
              id="room"
              placeholder="Room number"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="meeting-link" className="text-sm font-medium">
            Meeting Link
          </Label>
          <Input
            id="meeting-link"
            placeholder="Video call link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Additional Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes for the appointment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      {/* Insurance & Payment */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="insurance"
            checked={insuranceVerified}
            onChange={(e) => setInsuranceVerified(e.target.checked)}
            className="rounded border-border"
          />
          <Label htmlFor="insurance" className="text-sm">
            Insurance Verified
          </Label>
        </div>
        <div>
          <Label htmlFor="copay" className="text-sm font-medium">
            Copay Amount
          </Label>
          <Input
            id="copay"
            type="number"
            placeholder="0.00"
            value={copayAmount}
            onChange={(e) => setCopayAmount(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedSlotId || !appointmentType || !visitReason || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
        </Button>
      </div>
    </div>
  );
};
