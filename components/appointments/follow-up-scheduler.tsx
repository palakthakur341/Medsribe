"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays, addWeeks, addMonths, isAfter, isBefore, startOfDay } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";

interface FollowUpSchedulerProps {
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  treatmentId?: Id<"treatmentPlans">;
  suggestedFollowUps?: string[];
  onScheduled?: (appointmentId: string) => void;
  className?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

const FOLLOW_UP_TEMPLATES = [
  { label: "1 Week Follow-up", value: "1week", days: 7 },
  { label: "2 Week Follow-up", value: "2weeks", days: 14 },
  { label: "1 Month Follow-up", value: "1month", days: 30 },
  { label: "3 Month Follow-up", value: "3months", days: 90 },
  { label: "6 Month Follow-up", value: "6months", days: 180 },
  { label: "Annual Follow-up", value: "annual", days: 365 },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export const FollowUpScheduler: React.FC<FollowUpSchedulerProps> = ({
  patientId,
  doctorId,
  treatmentId,
  suggestedFollowUps = [],
  onScheduled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("follow-up");
  const [duration, setDuration] = useState<string>("30");
  const [notes, setNotes] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Mock doctor schedule for now (replace with actual API when available)
  const doctorSchedule = {
    weeklySchedule: {
      1: { isWorking: true, startTime: { hours: 9, minutes: 0 }, endTime: { hours: 17, minutes: 0 }, lunchBreak: { startTime: { hours: 12, minutes: 0 }, endTime: { hours: 13, minutes: 0 } } },
      2: { isWorking: true, startTime: { hours: 9, minutes: 0 }, endTime: { hours: 17, minutes: 0 }, lunchBreak: { startTime: { hours: 12, minutes: 0 }, endTime: { hours: 13, minutes: 0 } } },
      3: { isWorking: true, startTime: { hours: 9, minutes: 0 }, endTime: { hours: 17, minutes: 0 }, lunchBreak: { startTime: { hours: 12, minutes: 0 }, endTime: { hours: 13, minutes: 0 } } },
      4: { isWorking: true, startTime: { hours: 9, minutes: 0 }, endTime: { hours: 17, minutes: 0 }, lunchBreak: { startTime: { hours: 12, minutes: 0 }, endTime: { hours: 13, minutes: 0 } } },
      5: { isWorking: true, startTime: { hours: 9, minutes: 0 }, endTime: { hours: 17, minutes: 0 }, lunchBreak: { startTime: { hours: 12, minutes: 0 }, endTime: { hours: 13, minutes: 0 } } },
      6: { isWorking: false },
      0: { isWorking: false }
    }
  };

  // Mock exceptions (empty for now)
  const doctorExceptions: any[] = [];

  // Get existing appointments for the doctor (we'll filter by date)
  const allAppointments = useQuery(
    api.appointments.getByDoctor,
    doctorId ? { doctorId } : "skip"
  );

  // Filter appointments for the selected date
  const existingAppointments = React.useMemo(() => {
    if (!selectedDate || !allAppointments) return [];

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    return allAppointments.filter(appointment => {
      const appointmentDate = format(new Date(appointment.appointmentDateTime), "yyyy-MM-dd");
      return appointmentDate === selectedDateStr;
    });
  }, [selectedDate, allAppointments]);

  // Create appointment mutation
  const createAppointment = useMutation(api.appointments.create);

  // Get doctor-patient relationship
  const doctorPatientRelationship = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorId && patientId ? { doctorId, patientId } : "skip"
  );

  // Check if a time slot is available
  const isTimeSlotAvailable = useCallback((time: string): { available: boolean; reason?: string } => {
    if (!selectedDate || !doctorSchedule) {
      return { available: false, reason: "No date selected" };
    }

    const dayOfWeek = selectedDate.getDay();
    const daySchedule = doctorSchedule.weeklySchedule?.[dayOfWeek];

    if (!daySchedule || !daySchedule.isWorking) {
      return { available: false, reason: "Doctor not working this day" };
    }

    // Check if time is within working hours
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    const startMinutes = daySchedule.startTime.hours * 60 + daySchedule.startTime.minutes;
    const endMinutes = daySchedule.endTime.hours * 60 + daySchedule.endTime.minutes;

    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
      return { available: false, reason: "Outside working hours" };
    }

    // Check for lunch break
    if (daySchedule.lunchBreak) {
      const lunchStart = daySchedule.lunchBreak.startTime.hours * 60 + daySchedule.lunchBreak.startTime.minutes;
      const lunchEnd = daySchedule.lunchBreak.endTime.hours * 60 + daySchedule.lunchBreak.endTime.minutes;
      
      if (timeMinutes >= lunchStart && timeMinutes < lunchEnd) {
        return { available: false, reason: "Lunch break" };
      }
    }

    // Check for doctor exceptions
    if (doctorExceptions?.some(exception => 
      exception.startTime <= time && exception.endTime > time
    )) {
      return { available: false, reason: "Doctor unavailable" };
    }

    // Check for existing appointments
    const appointmentDuration = parseInt(duration);
    const endTimeMinutes = timeMinutes + appointmentDuration;
    
    const hasConflict = existingAppointments?.some(appointment => {
      const apptStart = appointment.startTime;
      const apptEnd = appointment.endTime;
      const [apptStartHours, apptStartMinutes] = apptStart.split(':').map(Number);
      const [apptEndHours, apptEndMinutes] = apptEnd.split(':').map(Number);
      const apptStartMinutesTotal = apptStartHours * 60 + apptStartMinutes;
      const apptEndMinutesTotal = apptEndHours * 60 + apptEndMinutes;
      
      return (timeMinutes < apptEndMinutesTotal && endTimeMinutes > apptStartMinutesTotal);
    });

    if (hasConflict) {
      return { available: false, reason: "Time slot already booked" };
    }

    return { available: true };
  }, [selectedDate, doctorSchedule, doctorExceptions, existingAppointments, duration]);

  const handleQuickSchedule = (template: typeof FOLLOW_UP_TEMPLATES[0]) => {
    const followUpDate = addDays(new Date(), template.days);
    setSelectedDate(followUpDate);
    setAppointmentType("follow-up");
    setNotes(`${template.label} for treatment follow-up`);
    setIsOpen(true);
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime || !patientId || !doctorId || !doctorPatientRelationship) {
      toast.error("Please fill in all required fields");
      return;
    }

    const timeCheck = isTimeSlotAvailable(selectedTime);
    if (!timeCheck.available) {
      toast.error(`Time slot not available: ${timeCheck.reason}`);
      return;
    }

    setIsScheduling(true);
    try {
      // Create appointment date/time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const appointmentId = await createAppointment({
        doctorPatientId: doctorPatientRelationship._id,
        appointmentDateTime: appointmentDateTime.getTime(),
        duration: parseInt(duration),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointmentType: appointmentType as any,
        visitReason: `Follow-up appointment${treatmentId ? ' for treatment' : ''}`,
        location: {
          type: "in_person",
          address: "Clinic",
        },
        notes,
        insuranceVerified: false,
      });

      toast.success("Follow-up appointment scheduled successfully!");
      onScheduled?.(appointmentId);
      setIsOpen(false);

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setNotes("");
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Schedule Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Quick Schedule Follow-up</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {FOLLOW_UP_TEMPLATES.slice(0, 6).map((template) => (
            <Button
              key={template.value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSchedule(template)}
              className="text-xs"
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {template.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggested Follow-ups */}
      {suggestedFollowUps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Suggested Follow-ups</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedFollowUps.map((suggestion, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Schedule Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Custom Follow-up
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up Appointment</DialogTitle>
            <DialogDescription>
              Schedule a follow-up appointment for this patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="space-y-4">
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => 
                    isBefore(date, startOfDay(new Date())) ||
                    isAfter(date, addMonths(new Date(), 6))
                  }
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="appointment-type">Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="check-up">Check-up</SelectItem>
                    <SelectItem value="review">Treatment Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedDate && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map((time) => {
                      const { available, reason } = isTimeSlotAvailable(time);
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          disabled={!available}
                          onClick={() => setSelectedTime(time)}
                          className="text-xs"
                          title={!available ? reason : undefined}
                        >
                          {available ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for this appointment..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleScheduleAppointment}
                disabled={!selectedDate || !selectedTime || isScheduling}
                className="w-full"
              >
                {isScheduling ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CalendarIcon className="h-4 w-4 mr-2" />
                )}
                {isScheduling ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpScheduler;
