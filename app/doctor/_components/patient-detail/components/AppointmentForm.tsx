import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
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
import {
  Calendar,
  MapPin,
  Video,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { APPOINTMENT_TYPES, DURATIONS } from "../types";
import type { AppointmentFormProps } from "../types";
import { cn } from "@/lib/utils";

// Zod validation schema
const appointmentFormSchema = z.object({
  appointmentType: z.string().min(1, "Please select an appointment type"),
  visitReason: z.string().min(1, "Please provide a reason for the visit"),
  appointmentDate: z.string().min(1, "Please select a date").refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Please select a future date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  locationType: z.enum(["in_person", "telemedicine"]),
  address: z.string().optional(),
  room: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  insuranceVerified: z.boolean(),
  copayAmount: z.string().optional(),
}).refine((data) => {
  if (data.locationType === "in_person" && !data.address?.trim()) {
    return false;
  }
  if (data.locationType === "telemedicine" && !data.meetingLink?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Please provide location details",
  path: ["address"], // This will show the error on the address field
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      slots.push({ value: time, label });
    }
  }
  return slots;
};

/**
 * AppointmentForm Component
 *
 * Comprehensive appointment scheduling form with React Hook Form and Zod validation
 * Optimized for performance with React.memo
 */
export const AppointmentForm = React.memo<AppointmentFormProps>(({
  patientId: _patientId,
  currentDoctorPatient,
  patient: _patient,
  doctorProfile: _doctorProfile,
  onCancel,
  onSuccess,
  className = "",
}) => {
  const createAppointment = useMutation(api.appointments.create);
  const timeSlots = generateTimeSlots();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: "",
      visitReason: "",
      appointmentDate: "",
      appointmentTime: "",
      duration: 30,
      locationType: "in_person",
      address: "",
      room: "",
      meetingLink: "",
      notes: "",
      insuranceVerified: false,
      copayAmount: "",
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Convert date and time to timestamp
      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`).getTime();

      await createAppointment({
        doctorPatientId: currentDoctorPatient._id,
        appointmentDateTime,
        duration: data.duration,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointmentType: data.appointmentType as any,
        visitReason: data.visitReason,
        location: {
          type: data.locationType,
          address: data.address || undefined,
          room: data.room || undefined,
          meetingLink: data.meetingLink || undefined,
        },
        notes: data.notes || undefined,
        insuranceVerified: data.insuranceVerified,
        copayAmount: data.copayAmount ? parseFloat(data.copayAmount) : undefined,
      });

      toast.success("Appointment scheduled successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    }
  };

  const watchedLocationType = form.watch("locationType");

  return (
    <Card className={cn("flex-1 min-h-0 flex flex-col bg-background border-border", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            Schedule Appointment
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col space-y-6">
            {/* Top Row - Type and Reason */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Reason *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the reason for this appointment..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date, Time, Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((dur) => (
                          <SelectItem key={dur.value} value={dur.value.toString()}>
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Type */}
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={field.value === "in_person" ? "default" : "outline"}
                        onClick={() => field.onChange("in_person")}
                        className="justify-start"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        In-Person
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "telemedicine" ? "default" : "outline"}
                        onClick={() => field.onChange("telemedicine")}
                        className="justify-start"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Virtual
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Details */}
            {watchedLocationType === "in_person" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Clinic address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <FormControl>
                        <Input placeholder="Room number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedLocationType === "telemedicine" && (
              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link *</FormLabel>
                    <FormControl>
                      <Input placeholder="Video call link (Zoom, Teams, etc.)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or special instructions..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insuranceVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Insurance Verified</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Check if insurance has been verified
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copayAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copay Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

AppointmentForm.displayName = "AppointmentForm";
