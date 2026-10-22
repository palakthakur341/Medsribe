import { useState, useCallback, useMemo } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { 
  UseAppointmentSchedulingReturn, 
  AppointmentFormData, 
  DoctorPatient, 
  Patient, 
  Doctor 
} from "../types";

const initialFormData: AppointmentFormData = {
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
};

/**
 * Custom hook for appointment scheduling
 * 
 * Features:
 * - Manages appointment form state
 * - Handles appointment creation
 * - Generates time slots
 * - Sends email notifications
 * - Form validation
 * 
 * @param currentDoctorPatient - Doctor-patient relationship
 * @param patient - Patient information
 * @param doctorProfile - Doctor information
 * @param onSuccess - Success callback
 * @returns {UseAppointmentSchedulingReturn} Appointment scheduling utilities
 */
export function useAppointmentScheduling(
  currentDoctorPatient: DoctorPatient | null,
  patient: Patient | null,
  doctorProfile: Doctor | null,
  onSuccess?: () => void
): UseAppointmentSchedulingReturn {
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);
  const [isCreating, setIsCreating] = useState(false);

  const createAppointment = useMutation(api.appointments.create);
  const scheduleEmail = useMutation(api.emailAutomation.scheduleEmail);

  // Update form data
  const updateFormData = useCallback((
    field: keyof AppointmentFormData, 
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  // Generate time slots (9 AM to 5 PM in 15-minute intervals)
  const timeSlots = useMemo(() => {
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
  }, []);

  // Handle appointment creation
  const handleCreateAppointment = useCallback(async (): Promise<void> => {
    const { appointmentType, visitReason, appointmentDate, appointmentTime } = formData;

    // Validation
    if (!appointmentType || !visitReason.trim() || !appointmentDate || !appointmentTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentDoctorPatient || !patient || !doctorProfile) {
      toast.error("Missing patient or doctor information");
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
      // Create the appointment
      await createAppointment({
        doctorPatientId: currentDoctorPatient._id as any,
        appointmentDateTime: dateTime.getTime(),
        duration: formData.duration,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointmentType: appointmentType as any,
        visitReason,
        location: {
          type: formData.locationType,
          address: formData.locationType === "in_person" ? formData.address : undefined,
          room: formData.locationType === "in_person" ? formData.room : undefined,
          meetingLink: formData.locationType === "telemedicine" ? formData.meetingLink : undefined,
        },
        notes: formData.notes.trim() || undefined,
        insuranceVerified: formData.insuranceVerified || undefined,
        copayAmount: formData.copayAmount ? parseFloat(formData.copayAmount) : undefined,
      });

      // Send immediate appointment confirmation email
      await scheduleEmail({
        userId: patient.userId,
        emailType: "appointment_reminder_24h",
        scheduledFor: Date.now(), // Send immediately
        relatedRecordId: "new_appointment",
        relatedRecordType: "appointment",
        emailData: {
          to: patient.email,
          subject: "Appointment Confirmed - MedScribe",
          templateData: {
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
            appointmentDetails: {
              date: dateTime.toLocaleDateString(),
              time: dateTime.toLocaleTimeString(),
              type: appointmentType,
              visitReason,
              location: { 
                type: formData.locationType, 
                address: formData.locationType === "in_person" ? formData.address : "Virtual" 
              },
              duration: formData.duration,
            },
          },
        },
      });

      // Schedule reminder email 1 hour before appointment
      const reminderTime = dateTime.getTime() - (60 * 60 * 1000); // 1 hour before
      if (reminderTime > Date.now()) {
        await scheduleEmail({
          userId: patient.userId,
          emailType: "appointment_reminder_1h",
          scheduledFor: reminderTime,
          relatedRecordId: "new_appointment",
          relatedRecordType: "appointment",
          emailData: {
            to: patient.email,
            subject: "URGENT: Appointment in 1 Hour - MedScribe",
            templateData: {
              patientName: `${patient.firstName} ${patient.lastName}`,
              doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
              appointmentDetails: {
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString(),
                type: appointmentType,
                visitReason,
                location: { 
                  type: formData.locationType, 
                  address: formData.locationType === "in_person" ? formData.address : "Virtual" 
                },
                duration: formData.duration,
              },
            },
          },
        });
      }

      toast.success("Appointment scheduled successfully!");
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }, [
    formData, 
    currentDoctorPatient, 
    patient, 
    doctorProfile, 
    createAppointment, 
    scheduleEmail, 
    resetForm, 
    onSuccess
  ]);

  return {
    formData,
    updateFormData,
    resetForm,
    handleCreateAppointment,
    isCreating,
    timeSlots,
  };
}
