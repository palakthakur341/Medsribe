"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  User,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorProfile: any;
}

// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentType: z.string().min(1, "Please select an appointment type"),
  visitReason: z.string().min(1, "Please provide a visit reason").min(10, "Visit reason must be at least 10 characters"),
  notes: z.string().optional(),
  selectedSlotId: z.string().min(1, "Please select a time slot"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

/**
 * Helper function to embed appointment data into RAG system
 */
async function embedAppointmentToRAG(
  appointmentId: string,
  context: {
    doctorProfile: any;
    selectedPatientId: string;
    selectedSlot: any;
    appointmentData: AppointmentFormValues;
    doctorPatients: any[];
  }
) {
  if (!appointmentId) return;

  const { doctorProfile, selectedPatientId, selectedSlot, appointmentData, doctorPatients } = context;

  // Get patient data from the doctorPatients list
  const selectedPatientData = doctorPatients?.find(dp => dp.patient?._id === selectedPatientId)?.patient;

  if (!selectedPatientData || !selectedSlot) {
    console.warn("RAG Embedding: Missing patient or slot data");
    return;
  }

  try {
    // Create appointment date/time from slot data
    const appointmentDateTime = selectedSlot.date && selectedSlot.time
      ? new Date(`${selectedSlot.date}T${selectedSlot.time}`).getTime()
      : selectedSlot.startTime
        ? new Date(selectedSlot.startTime).getTime()
        : Date.now();

    // Validate date/time
    if (isNaN(appointmentDateTime)) {
      console.warn("RAG Embedding: Invalid appointment date/time");
      return;
    }

    // Create patient and doctor names
    const patientName = `${selectedPatientData.firstName} ${selectedPatientData.lastName}`;
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    // Embed appointment data into RAG system
    await appointmentRAGHooks.onAppointmentScheduled({
      appointmentId,
      doctorId: doctorProfile._id,
      patientId: selectedPatientData._id,
      appointmentDateTime,
      appointmentType: appointmentData.appointmentType,
      visitReason: appointmentData.visitReason,
      location: {
        type: "in_person",
        address: "Clinic",
      },
      notes: appointmentData.notes,
      patientName,
      doctorName,
    }, {
      scheduledBy: 'doctor',
      bookingMethod: 'online',
      insuranceVerified: false,
      timeSlotId: appointmentData.selectedSlotId,
    });

  } catch (error) {
    console.error("RAG Embedding failed:", error);
    // Don't fail the appointment creation if RAG embedding fails
  }
}

/**
 * ScheduleAppointmentDialog Component
 *
 * Beautiful UI for scheduling appointments with patient selection
 * Reuses the proven appointment creation logic with elegant design
 */
export const ScheduleAppointmentDialog = React.memo<ScheduleAppointmentDialogProps>(({
  open,
  onOpenChange,
  doctorProfile,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);



  // React Hook Form setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      appointmentType: "follow_up",
      visitReason: "",
      notes: "",
      selectedSlotId: "",
    },
  });

  const { handleSubmit, formState: { isSubmitting }, reset, setValue, watch } = form;
  const selectedSlotId = watch("selectedSlotId");
  const selectedPatientId = watch("patientId");

  // Use the same mutation as other appointment forms
  const createAppointmentWithSlot = useMutation(api.appointments.createWithSlot);

  // Get doctor's patients for selection
  const doctorPatients = useQuery(
    api.doctorPatients.getPatientsByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Get doctor-patient relationship for selected patient
  const doctorPatientRelationship = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && selectedPatientId ? { 
      doctorId: doctorProfile._id, 
      patientId: selectedPatientId as Id<"patients">
    } : "skip"
  );

  const handleSlotSelect = (slotId: string, slotInfo: any) => {
    setValue("selectedSlotId", slotId);
    setSelectedSlot(slotInfo);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleClose = () => {
    reset();
    setSelectedSlot(null);
    onOpenChange(false);
  };

  // Use the exact same appointment creation logic
  const onSubmit = async (values: AppointmentFormValues) => {
    if (!doctorProfile || !doctorPatientRelationship) {
      toast.error("Missing required data. Please try again.");
      return;
    }

    try {
      const appointmentId = await createAppointmentWithSlot({
        doctorPatientId: doctorPatientRelationship._id,
        slotId: values.selectedSlotId as Id<"timeSlots">,
        appointmentType: values.appointmentType as any,
        visitReason: values.visitReason,
        location: {
          type: "in_person",
          address: "Clinic",
        },
        notes: values.notes,
        insuranceVerified: false,
      });

      // 🔥 Embed appointment into RAG system
      await embedAppointmentToRAG(appointmentId, {
        doctorProfile,
        selectedPatientId,
        selectedSlot,
        appointmentData: values,
        doctorPatients: doctorPatients || [],
      });

      toast.success("Appointment scheduled successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to schedule appointment. Please try again.");
    }
  };

  // Get selected patient info for display
  const selectedPatient = doctorPatients?.find(dp => dp.patient?._id === selectedPatientId)?.patient;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-6 pb-4">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-lg">Schedule New Appointment</DialogTitle>
            </div>

            {/* Selected Patient Info Card */}
            {selectedPatient && (
              <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h4>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        Patient
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
                      <span>Phone: {selectedPatient.primaryPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogDescription className="text-sm text-muted-foreground">
              Schedule a new appointment by selecting a patient and available time slot.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area with Beautiful Form */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 pb-6">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Patient Selection */}
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <FormLabel className="text-sm font-medium">
                            Select Patient
                          </FormLabel>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a patient..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctorPatients?.filter(dp => dp.patient).map((doctorPatient) => (
                              <SelectItem key={doctorPatient.patient!._id} value={doctorPatient.patient!._id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {doctorPatient.patient!.firstName} {doctorPatient.patient!.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {doctorPatient.patient!.primaryPhone}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Visit Reason */}
                  <FormField
                    control={form.control}
                    name="visitReason"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <FormLabel className="text-sm font-medium">
                            Visit Reason
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the reason for this appointment..."
                            className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Appointment Type */}
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new_patient">New Patient</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="telemedicine">Telemedicine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Slot Selection */}
                  <FormField
                    control={form.control}
                    name="selectedSlotId"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <FormLabel className="text-sm font-medium">Select Time Slot</FormLabel>
                              {selectedSlot && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                  Time selected
                                </div>
                              )}
                            </div>
                          </div>

                          {doctorProfile && (
                            <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                              <PatientSlotSelector
                                doctorId={doctorProfile._id}
                                onSlotSelect={handleSlotSelect}
                                selectedSlotId={selectedSlotId}
                                showNextAvailable={true}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes for the appointment..."
                            className="min-h-[60px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Optional notes that will be included with the appointment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ScheduleAppointmentDialog.displayName = "ScheduleAppointmentDialog";
