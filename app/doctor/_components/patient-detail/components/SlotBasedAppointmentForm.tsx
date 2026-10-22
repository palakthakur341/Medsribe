import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { APPOINTMENT_TYPES } from "../types";
import type { AppointmentFormProps } from "../types";
import { cn } from "@/lib/utils";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

/**
 * Helper function to embed slot-based appointment data into RAG system
 */
async function embedSlotBasedAppointmentToRAG(
  appointmentId: string,
  context: {
    availableSlots: any[];
    patient: any;
    doctorProfile: any;
    appointmentData: any;
  }
) {
  if (!appointmentId) return;

  const { availableSlots, patient, doctorProfile, appointmentData } = context;

  // Find the selected slot data
  const selectedSlotData = availableSlots?.find(slot => slot._id === appointmentData.slotId);

  if (!selectedSlotData || !patient) {
    console.warn("RAG Embedding: Missing slot or patient data");
    return;
  }

  try {
    // Create appointment date/time from slot data
    const appointmentDateTime = new Date(`${selectedSlotData.date}T${selectedSlotData.time}`).getTime();

    // Validate date/time
    if (isNaN(appointmentDateTime)) {
      console.warn("RAG Embedding: Invalid appointment date/time");
      return;
    }

    // Create patient and doctor names
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    // Embed appointment data into RAG system
    await appointmentRAGHooks.onAppointmentScheduled({
      appointmentId,
      doctorId: doctorProfile._id,
      patientId: patient._id,
      appointmentDateTime,
      appointmentType: appointmentData.appointmentType,
      visitReason: appointmentData.visitReason,
      location: {
        type: appointmentData.locationType,
        address: appointmentData.locationType === "in_person" ? appointmentData.address : undefined,
        room: appointmentData.locationType === "in_person" ? appointmentData.room : undefined,
        meetingLink: appointmentData.locationType === "telemedicine" ? appointmentData.meetingLink : undefined,
      },
      notes: appointmentData.notes,
      patientName,
      doctorName,
    }, {
      scheduledBy: 'doctor',
      bookingMethod: 'online',
      insuranceVerified: appointmentData.insuranceVerified,
      copayAmount: appointmentData.copayAmount ? parseFloat(appointmentData.copayAmount) : undefined,
      timeSlotId: appointmentData.slotId,
    });

  } catch (error) {
    console.error("RAG Embedding failed:", error);
    // Don't fail the appointment creation if RAG embedding fails
  }
}

// Zod validation schema for slot-based appointments
const slotAppointmentFormSchema = z.object({
  slotId: z.string().min(1, "Please select a time slot"),
  appointmentType: z.string().min(1, "Please select an appointment type"),
  visitReason: z.string().min(1, "Please provide a reason for the visit"),
  locationType: z.enum(["in_person", "telemedicine"]),
  address: z.string().optional(),
  room: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  insuranceVerified: z.boolean().optional(),
  copayAmount: z.string().optional(),
});

type SlotAppointmentFormData = z.infer<typeof slotAppointmentFormSchema>;

/**
 * SlotBasedAppointmentForm Component
 *
 * Modern appointment scheduling form using the new slot-based system
 * Provides real-time availability and conflict prevention
 */
export const SlotBasedAppointmentForm = React.memo<AppointmentFormProps>(({
  patientId,
  currentDoctorPatient,
  patient,
  doctorProfile,
  onCancel,
  onSuccess,
  className = "",
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available slots for the selected date
  const availableSlots = useQuery(api.timeSlots.getAvailableSlots,
    doctorProfile ? {
      doctorId: doctorProfile._id,
      date: selectedDate,
    } : "skip"
  );

  // Get slots for the next 7 days for quick date selection
  const weekStartDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEndDate = format(addDays(new Date(), 6), 'yyyy-MM-dd');

  const weekSlots = useQuery(api.timeSlots.getAvailableSlotsInRange,
    doctorProfile ? {
      doctorId: doctorProfile._id,
      startDate: weekStartDate,
      endDate: weekEndDate,
    } : "skip"
  );



  // Create appointment mutation
  const createAppointment = useMutation(api.appointments.createWithSlot);

  // Setup default availability for development/testing
  const setupDefaultAvailability = useMutation(api.devUtils.setupDefaultAvailabilityAndSlots);

  const form = useForm<SlotAppointmentFormData>({
    resolver: zodResolver(slotAppointmentFormSchema),
    defaultValues: {
      slotId: "",
      appointmentType: "",
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

  const onSubmit = async (data: SlotAppointmentFormData) => {
    if (!currentDoctorPatient || !patient || !doctorProfile) {
      toast.error("Required information not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentId = await createAppointment({
        doctorPatientId: currentDoctorPatient._id,
        slotId: data.slotId as Id<"timeSlots">,
        appointmentType: data.appointmentType as any,
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

      // 🔥 Embed appointment data into RAG system
      await embedSlotBasedAppointmentToRAG(appointmentId, {
        availableSlots,
        patient,
        doctorProfile,
        appointmentData: data,
      });

      toast.success("Appointment scheduled successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setup default availability for doctors without configured schedules
  const handleSetupDefaultAvailability = async () => {
    if (!doctorProfile) return;

    try {
      const result = await setupDefaultAvailability({
        doctorId: doctorProfile._id,
      });

      toast.success(`Setup complete! Generated ${result.generatedSlotsCount} time slots`);
    } catch (error) {
      console.error("Error setting up default availability:", error);
      toast.error("Failed to setup availability");
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

  if (!doctorProfile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>

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
            <h3 className="font-medium mb-2">No available time slots</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No appointments available for this date. Try a different date or set up availability.
            </p>
            <div className="max-w-xs mx-auto space-y-3">
              <Button
                onClick={handleSetupDefaultAvailability}
                size="sm"
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Setup Default Schedule
              </Button>
              <p className="text-xs text-muted-foreground">
                Creates Mon-Fri 9AM-5PM availability with 30min slots
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Morning Slots */}
            {availableSlots.filter(slot => {
              const hour = parseInt(slot.time.split(':')[0]);
              return hour < 12;
            }).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Morning
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSlots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour < 12;
                    })
                    .map((slot) => (
                      <div
                        key={slot._id}
                        className={cn(
                          "relative border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm text-center",
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
              </div>
            )}

            {/* Afternoon Slots */}
            {availableSlots.filter(slot => {
              const hour = parseInt(slot.time.split(':')[0]);
              return hour >= 12 && hour < 17;
            }).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Afternoon
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSlots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour >= 12 && hour < 17;
                    })
                    .map((slot) => (
                      <div
                        key={slot._id}
                        className={cn(
                          "relative border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm text-center",
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
              </div>
            )}

            {/* Evening Slots */}
            {availableSlots.filter(slot => {
              const hour = parseInt(slot.time.split(':')[0]);
              return hour >= 17;
            }).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Evening
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSlots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour >= 17;
                    })
                    .map((slot) => (
                      <div
                        key={slot._id}
                        className={cn(
                          "relative border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm text-center",
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Slot Confirmation */}
      {selectedSlot && (
        <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
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
                      <FormItem className="space-y-2">
                        <FormLabel>Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {APPOINTMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{type.label}</span>
                                  {type.description && (
                                    <span className="text-xs text-muted-foreground">{type.description}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
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
                      <FormItem className="space-y-2">
                        <FormLabel>Location Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <RadioGroupItem value="in_person" id="in_person" />
                              <Label htmlFor="in_person" className="flex items-center gap-2 cursor-pointer flex-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">In Person</span>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <RadioGroupItem value="telemedicine" id="telemedicine" />
                              <Label htmlFor="telemedicine" className="flex items-center gap-2 cursor-pointer flex-1">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Telemedicine</span>
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
                    <FormItem className="space-y-2">
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the reason for this appointment..."
                          className="min-h-[80px] resize-none"
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
                    <FormItem className="space-y-2">
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information or special requirements..."
                          className="min-h-[60px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
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
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
});
