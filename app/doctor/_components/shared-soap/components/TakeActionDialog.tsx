"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stethoscope, Calendar, UserPlus, Clock, MapPin, Video, ArrowLeft, User, Search } from "lucide-react";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import type { SharedSOAPNote } from "../types";
import { soapRAGHooks } from "@/lib/services/soap-rag-hooks";

interface TakeActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: SharedSOAPNote | null;
  doctorId: Id<"doctors">;
}

type ActionType = "assistance" | "appointment" | "referral";

export const TakeActionDialog: React.FC<TakeActionDialogProps> = ({
  open,
  onOpenChange,
  note,
  doctorId,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assistance state
  const [assistanceText, setAssistanceText] = useState("");

  // Appointment state
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [appointmentType, setAppointmentType] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  // Referral state
  const [referralReason, setReferralReason] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("medium");
  const [selectedDoctorId, setSelectedDoctorId] = useState<Id<"doctors"> | null>(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

  // Queries
  const availableDoctors = useQuery(api.doctors.searchDoctors, {
    searchTerm: doctorSearchQuery,
    limit: 10,
  });

  // Mutations
  const createAssistance = useMutation(api.soapNotes.addAssistance);
  const createAppointmentWithSlot = useMutation(api.appointments.createWithSlot);
  const createReferral = useMutation(api.referrals.create);
  const assignPatient = useMutation(api.doctorPatients.assignPatient);
  const updateActionStatus = useMutation(api.sharedSoapNotes.updateActionStatus);

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
    if (!selectedAction || !note) return;

    setIsSubmitting(true);
    try {
      if (selectedAction === "assistance") {
        if (!assistanceText.trim()) {
          toast.error("Please provide assistance details");
          return;
        }

        await createAssistance({
          soapNoteId: note.soapNote._id,
          assistanceText: assistanceText.trim(),
          doctorId,
        });

        if (note._id) {
          await updateActionStatus({
            sharedSoapNoteId: note._id,
            actionStatus: "assistance_provided",
            actionDetails: `Medical assistance provided: ${assistanceText.trim().substring(0, 100)}...`,
          });

          // 🔥 Embed SOAP action into RAG system (production-ready)
          soapRAGHooks.onSOAPNoteAction({
            actionId: note._id,
            soapNoteId: note.soapNote._id,
            doctorId,
            patientId: note.patient._id,
            patientName: `${note.patient.firstName} ${note.patient.lastName}`,  // ✅ ADD PATIENT NAME
            actionType: 'reviewed',
            comments: assistanceText.trim(),
            reason: 'Medical assistance provided to patient',
            createdAt: Date.now(),
          });
        }

        toast.success("Assistance provided successfully!");
      } else if (selectedAction === "appointment") {
        if (!selectedSlotId || !appointmentType || !visitReason.trim()) {
          toast.error("Please fill in all required appointment fields");
          return;
        }

        // Ensure doctor-patient relationship exists
        const doctorPatientId = await assignPatient({
          doctorId,
          patientId: note.patient._id,
          assignedBy: "appointment_scheduling",
        });

        // Create appointment with slot
        await createAppointmentWithSlot({
          doctorPatientId,
          slotId: selectedSlotId as any,
          appointmentType: appointmentType as any,
          visitReason,
          location: {
            type: locationType,
            address: locationType === "in_person" ? address : undefined,
            room: locationType === "in_person" ? room : undefined,
            meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
          },
          notes,
          insuranceVerified: false,
          copayAmount: undefined,
        });

        if (note._id) {
          await updateActionStatus({
            sharedSoapNoteId: note._id,
            actionStatus: "appointment_scheduled",
            actionDetails: `Appointment scheduled: ${visitReason}`,
          });

          // 🔥 Embed SOAP action into RAG system (production-ready)
          soapRAGHooks.onSOAPNoteAction({
            actionId: note._id,
            soapNoteId: note.soapNote._id,
            doctorId,
            patientId: note.patient._id,
            patientName: `${note.patient.firstName} ${note.patient.lastName}`,  // ✅ ADD PATIENT NAME
            actionType: 'accepted',
            comments: `Appointment scheduled: ${visitReason}`,
            reason: 'Appointment scheduled based on shared SOAP note',
            createdAt: Date.now(),
          });
        }

        toast.success("Appointment scheduled successfully!");
      } else if (selectedAction === "referral") {
        if (!referralReason.trim()) {
          toast.error("Please provide referral reason");
          return;
        }

        if (!selectedDoctorId) {
          toast.error("Please select a doctor for referral");
          return;
        }

        await createReferral({
          patientId: note.patient._id,
          fromDoctorId: doctorId,
          toDoctorId: selectedDoctorId,
          reasonForReferral: referralReason.trim(),
          urgency: urgencyLevel === "low" ? "routine" : urgencyLevel === "medium" ? "routine" : urgencyLevel === "high" ? "urgent" : "stat",
          soapNoteId: note.soapNote._id,
          specialtyRequired: "General", // Default value, could be made dynamic
        });

        if (note._id) {
          await updateActionStatus({
            sharedSoapNoteId: note._id,
            actionStatus: "referral_sent",
            actionDetails: `Referral created: ${referralReason.trim().substring(0, 100)}...`,
          });

          // 🔥 Embed SOAP action into RAG system (production-ready)
          soapRAGHooks.onSOAPNoteAction({
            actionId: note._id,
            soapNoteId: note.soapNote._id,
            doctorId,
            patientId: note.patient._id,
            patientName: `${note.patient.firstName} ${note.patient.lastName}`,  // ✅ ADD PATIENT NAME
            actionType: 'accepted',
            comments: referralReason.trim(),
            reason: 'Referral created based on shared SOAP note',
            createdAt: Date.now(),
          });
        }

        toast.success("Referral created successfully!");
      }

      handleClose();
    } catch (error) {
      console.error("Error taking action:", error);
      toast.error("Failed to complete action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setAssistanceText("");
    setSelectedSlotId("");
    setSelectedSlot(null);
    setShowSlotSelector(false);
    setAppointmentType("");
    setVisitReason("");
    setLocationType("in_person");
    setAddress("");
    setRoom("");
    setMeetingLink("");
    setNotes("");
    setReferralReason("");
    setUrgencyLevel("medium");
    setSelectedDoctorId(null);
    setDoctorSearchQuery("");
    onOpenChange(false);
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3">
            {selectedAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAction(null)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-lg">
                {selectedAction === "assistance" ? "Provide Medical Assistance" :
                 selectedAction === "appointment" ? "Schedule Appointment" :
                 selectedAction === "referral" ? "Create Referral" :
                 "Take Action"}
              </DialogTitle>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                  {note.patient?.firstName[0]}{note.patient?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">
                    {note.patient?.firstName} {note.patient?.lastName}
                  </h4>
                  <Badge
                    variant={note.shareType === "direct_share" ? "default" : "secondary"}
                    className="text-xs h-5 px-1.5"
                  >
                    {note.shareType === "direct_share" ? "Direct" : "Referral"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>MRN: {note.patient?.mrn || 'N/A'}</span>
                  <span className="capitalize">{note.patient?.gender}</span>
                  <span>{note.patient?.dateOfBirth}</span>
                </div>
              </div>
            </div>
          </div>

          {!selectedAction && (
            <DialogDescription className="text-sm text-muted-foreground">
              Choose an action to take for this shared SOAP note.
            </DialogDescription>
          )}
        </DialogHeader>

        {!selectedAction ? (
          // Action Selection
          <div className="space-y-3">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-muted/50 border-border/50"
                onClick={() => setSelectedAction("assistance")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Provide Medical Assistance</div>
                    <div className="text-sm text-muted-foreground">Give guidance or advice to the patient</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-muted/50 border-border/50"
                onClick={() => setSelectedAction("appointment")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Schedule Appointment</div>
                    <div className="text-sm text-muted-foreground">Book a time slot for consultation</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-muted/50 border-border/50"
                onClick={() => setSelectedAction("referral")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Create Referral</div>
                    <div className="text-sm text-muted-foreground">Refer to another specialist</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          // Action Forms
          <div className="space-y-4">

            {/* Assistance Form */}
            {selectedAction === "assistance" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <Label htmlFor="assistance" className="text-sm font-medium">
                    Medical Assistance Details
                  </Label>
                </div>
                <Textarea
                  id="assistance"
                  placeholder="Describe the guidance, advice, or assistance you're providing to the patient..."
                  value={assistanceText}
                  onChange={(e) => setAssistanceText(e.target.value)}
                  className="min-h-[100px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This assistance will be recorded and the patient will be notified.
                </p>
              </div>
            )}

            {/* Appointment Form */}
            {selectedAction === "appointment" && (
              <div className="space-y-4">
                {/* Visit Reason */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <Label htmlFor="visit-reason" className="text-sm font-medium">
                      Visit Reason
                    </Label>
                  </div>
                  <Input
                    id="visit-reason"
                    placeholder="Reason for the appointment"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Appointment Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType} disabled={isSubmitting}>
                    <SelectTrigger>
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
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium">Select Time Slot</span>
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
                      disabled={isSubmitting}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {showSlotSelector ? "Hide" : "Browse Times"}
                    </Button>
                  </div>

                  {showSlotSelector && (
                    <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
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
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Location Type</Label>
                  <RadioGroup
                    value={locationType}
                    onValueChange={(value: "in_person" | "telemedicine") => setLocationType(value)}
                    disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Referral Form */}
            {selectedAction === "referral" && (
              <div className="space-y-4">
                {/* Doctor Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    <Label className="text-sm font-medium">Select Doctor</Label>
                  </div>

                  {/* Doctor Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search doctors by name or specialty..."
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Doctor List */}
                  {availableDoctors && availableDoctors.length > 0 && (
                    <ScrollArea className="h-40 border rounded-lg">
                      <div className="p-2 space-y-1">
                        {availableDoctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            onClick={() => setSelectedDoctorId(doctor._id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedDoctorId === doctor._id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {doctor.firstName[0]}{doctor.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {doctor.specialization} • {doctor.hospitalAffiliation}
                                </div>
                              </div>
                              {selectedDoctorId === doctor._id && (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {selectedDoctorId && availableDoctors && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30">
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Doctor selected
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          {(() => {
                            const doctor = availableDoctors.find(d => d._id === selectedDoctorId);
                            return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}` : '';
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral Reason */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    <Label htmlFor="referral-reason" className="text-sm font-medium">
                      Referral Reason
                    </Label>
                  </div>
                  <Textarea
                    id="referral-reason"
                    placeholder="Explain why this patient needs to be referred to a specialist..."
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Urgency Level</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Routine referral</SelectItem>
                      <SelectItem value="medium">Medium - Standard priority</SelectItem>
                      <SelectItem value="high">High - Urgent referral</SelectItem>
                      <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground">
                  A referral will be created and both the patient and selected doctor will be notified.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedAction && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (selectedAction === "assistance" && !assistanceText.trim()) ||
                (selectedAction === "appointment" && (!selectedSlotId || !appointmentType || !visitReason.trim())) ||
                (selectedAction === "referral" && (!referralReason.trim() || !selectedDoctorId))
              }
            >
              {isSubmitting ? "Processing..." : 
               selectedAction === "assistance" ? "Provide Assistance" :
               selectedAction === "appointment" ? "Schedule Appointment" :
               "Create Referral"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
