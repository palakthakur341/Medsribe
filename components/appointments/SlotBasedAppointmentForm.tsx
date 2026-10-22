"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Clock, MapPin, Video, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

const appointmentFormSchema = z.object({
  slotId: z.string().min(1, "Please select a time slot"),
  appointmentType: z.enum(
    [
      "new_patient",
      "follow_up",
      "consultation",
      "procedure",
      "telemedicine",
      "emergency",
    ],
    { required_error: "Please select appointment type" },
  ),
  visitReason: z.string().min(1, "Please provide a reason for visit"),
  locationType: z.enum(["in_person", "telemedicine"]),
  address: z.string().optional(),
  room: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  insuranceVerified: z.boolean().optional(),
  copayAmount: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface SlotBasedAppointmentFormProps {
  doctorId: Id<"doctors">;
  doctorPatientId: Id<"doctorPatients">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SlotBasedAppointmentForm: React.FC<SlotBasedAppointmentFormProps> = ({
  doctorId,
  doctorPatientId,
  onSuccess,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      slotId: "",
      appointmentType: undefined,
      visitReason: "",
      locationType: "in_person",
      address: "",
      room: "",
      meetingLink: "",
      notes: "",
      insuranceVerified: false,
      copayAmount: "",
    },
  });

  // Update form when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      form.setValue("slotId", selectedSlot);
    }
  }, [selectedSlot, form]);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      const appointmentId = await createAppointment({
        doctorPatientId,
        slotId: data.slotId as Id<"timeSlots">,
        appointmentType: data.appointmentType,
        visitReason: data.visitReason,
        location: {
          type: data.locationType,
          address: data.locationType === "in_person" ? data.address : undefined,
          room: data.locationType === "in_person" ? data.room : undefined,
          meetingLink: data.locationType === "telemedicine" ? data.meetingLink : undefined,
        },
        notes: data.notes,
        insuranceVerified: data.insuranceVerified,
        copayAmount: data.copayAmount ? parseFloat(data.copayAmount) : undefined,
      });

      // Get the selected slot details for appointment date/time
      const selectedSlotData = availableSlots?.find(slot => slot._id === data.slotId);
      const appointmentDateTime = selectedSlotData
        ? new Date(`${selectedSlotData.date}T${selectedSlotData.time}`).getTime()
        : Date.now();

      // 🔥 Embed appointment data into RAG system with patient and doctor names
      if (doctorPatientRelation?.patient && doctorPatientRelation?.doctor && appointmentId) {
        const patientName = `${doctorPatientRelation.patient.firstName} ${doctorPatientRelation.patient.lastName}`;
        const doctorName = `${doctorPatientRelation.doctor.firstName} ${doctorPatientRelation.doctor.lastName}`;

        appointmentRAGHooks.onAppointmentScheduled({
          appointmentId: appointmentId,
          doctorId: doctorId,
          patientId: doctorPatientRelation.patient._id,
          appointmentDateTime,
          appointmentType: data.appointmentType,
          visitReason: data.visitReason,
          location: {
            type: data.locationType,
            address: data.locationType === "in_person" ? data.address : undefined,
            room: data.locationType === "in_person" ? data.room : undefined,
            meetingLink: data.locationType === "telemedicine" ? data.meetingLink : undefined,
          },
          notes: data.notes || undefined,
          patientName,
          doctorName,
        }, {
          scheduledBy: 'doctor',
          bookingMethod: 'online',
          insuranceVerified: data.insuranceVerified,
          copayAmount: data.copayAmount ? parseFloat(data.copayAmount) : undefined,
          timeSlotId: data.slotId,
        });
      }

      toast.success("Appointment scheduled successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium">Select Date</Label>
          <p className="text-sm text-muted-foreground">Choose an available date</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {availableDates.map((dateInfo) => (
            <div
              key={dateInfo.date}
              className={cn(
                "relative border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm",
                selectedDate === dateInfo.date
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50",
                dateInfo.availableCount === 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => dateInfo.availableCount > 0 && setSelectedDate(dateInfo.date)}
            >
              <div className="text-center space-y-1">
                <div className="text-xs font-medium opacity-80">
                  {dateInfo.dayName.toUpperCase()}
                </div>
                <div className="text-lg font-bold">
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
            </div>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Available Times
          </Label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {availableSlots === undefined ? (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">No available slots</p>
            <p className="text-sm text-muted-foreground">
              Please select a different date
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {availableSlots.map((slot) => (
              <div
                key={slot._id}
                className={cn(
                  "border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm text-center",
                  selectedSlot === slot._id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => setSelectedSlot(slot._id)}
              >
                <div className="font-medium text-sm">{formatTime(slot.time)}</div>
                <div className={cn(
                  "text-xs",
                  selectedSlot === slot._id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {formatTime(slot.endTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Slot Confirmation */}
      {selectedSlot && (
        <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium">Time slot selected</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedDate), 'EEEE, MMMM d')} at {formatTime(availableSlots?.find(s => s._id === selectedSlot)?.time || "")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Form */}
      {selectedSlot && (
        <div className="border rounded-lg p-4 bg-card">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Appointment Details</Label>
              <p className="text-sm text-muted-foreground">
                Provide information about this appointment
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new_patient">New Patient</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="telemedicine">Telemedicine</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="in_person" id="in_person" />
                              <Label htmlFor="in_person" className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                In Person
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="telemedicine" id="telemedicine" />
                              <Label htmlFor="telemedicine" className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Telemedicine
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="visitReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the reason for your visit..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};
