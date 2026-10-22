"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
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
  Activity,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TreatmentDetailsHeader } from "./TreatmentDetailsHeader";
import { TreatmentDetailsContent } from "./TreatmentDetailsContent";

interface TreatmentDetailsProps {
  treatmentId: string;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: any;
  doctorProfile: any;
}

// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
  appointmentType: z.string().min(1, "Please select an appointment type"),
  visitReason: z.string().min(1, "Please provide a visit reason").min(10, "Visit reason must be at least 10 characters"),
  notes: z.string().optional(),
  selectedSlotId: z.string().min(1, "Please select a time slot"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
/**
 * ScheduleAppointmentDialog Component
 * 
 * Fixed overflow scroll issues with proper container heights and ScrollArea implementation
 */
const ScheduleAppointmentDialog = React.memo<ScheduleAppointmentDialogProps>(({
  open,
  onOpenChange,
  treatment,
  doctorProfile,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // React Hook Form setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: "follow_up",
      visitReason: "",
      notes: "",
      selectedSlotId: "",
    },
  });

  const { handleSubmit, formState: { isSubmitting }, reset, setValue, watch } = form;
  const selectedSlotId = watch("selectedSlotId");

  // Use the same mutation as SlotBasedAppointmentForm
  const createAppointmentWithSlot = useMutation(api.appointments.createWithSlot);

  // Get doctor-patient relationship
  const patientId = treatment?.patient?._id;
  const doctorPatientRelationship = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    treatment && doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId
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

  const onSubmit = async (values: AppointmentFormValues) => {
    if (!treatment || !doctorProfile || !doctorPatientRelationship) {
      toast.error("Missing required data. Please try again.");
      return;
    }

    try {
      await createAppointmentWithSlot({
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

      toast.success("Follow-up appointment scheduled successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Schedule Follow-up Appointment
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new appointment for this treatment plan
              </p>
            </div>
          </div>

          {/* Treatment Info Card */}
          {treatment && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground">
                      {treatment.title}
                    </h4>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      Treatment Plan
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Status: {treatment.status}</span>
                    <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content with Form */}
        <div className="flex-1 overflow-auto">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="flex-1 px-6 py-4 space-y-6">
                {/* Visit Reason */}
                <FormField
                  control={form.control}
                  name="visitReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Visit Reason
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the reason for this follow-up appointment..."
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
                      <FormLabel className="text-sm font-medium text-foreground">
                        Appointment Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="border-border/50 focus:border-primary/50">
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  render={({ field: _ }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Select Time Slot
                      </FormLabel>
                      
                      <div className="border rounded-xl p-4 bg-muted/30">
                        <PatientSlotSelector
                          doctorId={doctorProfile._id}
                          onSlotSelect={handleSlotSelect}
                          selectedSlotId={selectedSlotId}
                          showNextAvailable={true}
                        />
                      </div>

                      {selectedSlot && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
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
                      <FormLabel className="text-sm font-medium text-foreground">
                        Additional Notes
                      </FormLabel>
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
              </div>

              {/* Form Actions - Inside form for proper submission */}
              <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
                <div className="flex justify-end gap-3">
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
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
});
/**
 * TreatmentDetails Component
 * 
 * Updated to follow AppointmentsList UI patterns and standards
 * Maintains all functionality while improving visual consistency
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatmentId,
  onView,
  onStatusChange,
  className = "",
}) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Get session for doctor profile
  const { data: session } = useSession();

  // Fetch treatment details with all related data
  const treatment = useQuery(
    api.treatmentPlans.getWithDetailsById,
    treatmentId ? { id: treatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Fetch prescription orders for this treatment plan
  const prescriptionOrders = useQuery(
    api.prescriptionOrders.getOrdersByTreatmentPlanId,
    treatmentId ? { treatmentPlanId: treatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Get current doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Loading state - Following AppointmentsList skeleton pattern
  if (treatment === undefined) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
        {/* Header Skeleton */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Info grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-full bg-muted rounded animate-pulse" />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-32 w-full bg-muted rounded animate-pulse" />
              <div className="h-32 w-full bg-muted rounded animate-pulse" />
            </div>
            <div className="h-48 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Treatment not found - Following empty state pattern
  if (!treatment) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Treatment Details</h3>
              <p className="text-xs text-muted-foreground">
                View and manage treatment plan
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-medium">Treatment not found</h3>
            <p className="text-sm text-muted-foreground">
              The requested treatment plan could not be found.
            </p>
            <Button variant="outline" size="sm" className="rounded-lg">
              <Plus className="h-4 w-4 mr-1" />
              Create Treatment Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header - Following AppointmentsList header pattern */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Treatment Details</h3>
            <p className="text-xs text-muted-foreground">
              View and manage treatment plan
            </p>
          </div>
        </div>
      </div>

      {/* Content Area - Following ScrollArea pattern */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Treatment Header Component */}
            <TreatmentDetailsHeader
              treatment={treatment}
              onView={onView}
              onStatusChange={onStatusChange}
            />

            {/* Treatment Content Component */}
            <TreatmentDetailsContent
              treatment={treatment}
              prescriptionOrders={prescriptionOrders || []}
              onScheduleAppointment={() => setScheduleDialogOpen(true)}
            />


          </div>
        </ScrollArea>
      </div>

      {/* Schedule Appointment Dialog */}
      {doctorProfile && (
        <ScheduleAppointmentDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          treatment={treatment}
          doctorProfile={doctorProfile}
        />
      )}
    </div>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";