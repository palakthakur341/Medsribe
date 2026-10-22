"use client";

import React, { useState, useEffect } from "react";
import {
  useDoctorAuth,
  useDoctorAppointments,
  AppointmentsList,
  AppointmentFilters,
  AppointmentsSkeleton,
  AppointmentDetails,
  type AppointmentCategory,
  type Appointment,
} from "@/app/doctor/_components/appointments";
import { useAppointmentActions } from "@/app/doctor/_components/appointments/hooks/useAppointmentActions";
import { RescheduleDialog } from "@/app/doctor/_components/appointments/components/RescheduleDialog";
import { ScheduleAppointmentDialog } from "@/app/doctor/_components/appointments/components/ScheduleAppointmentDialog";
import { appointmentRAGHooks } from "@/lib/services/appointment-rag-hooks";

/**
 * Helper functions for appointment RAG integration
 */
async function embedAppointmentCancellation(appointment: Appointment, reason: string, doctorProfile: any) {
  if (!appointment || !doctorProfile) return;

  try {
    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Unknown Patient';
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    await appointmentRAGHooks.onAppointmentCancelled({
      appointmentId: appointment._id,
      doctorId: doctorProfile._id,
      patientId: appointment.patient?._id || '',
      appointmentDateTime: new Date(appointment.scheduledAt).getTime(),
      appointmentType: appointment.appointmentType || 'consultation',
      visitReason: appointment.visitReason || 'General consultation',
      location: appointment.location,
      notes: appointment.notes,
      patientName,
      doctorName,
    }, reason, 'doctor');
  } catch (error) {
    console.error("RAG Embedding failed for cancellation:", error);
  }
}

async function embedAppointmentReschedule(
  originalAppointment: Appointment,
  newSlotData: any,
  reason: string,
  doctorProfile: any
) {
  if (!originalAppointment || !newSlotData || !doctorProfile) return;

  try {
    const patientName = originalAppointment.patient
      ? `${originalAppointment.patient.firstName} ${originalAppointment.patient.lastName}`
      : 'Unknown Patient';
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    // Create new appointment date/time from slot data
    const newAppointmentDateTime = newSlotData.date && newSlotData.time
      ? new Date(`${newSlotData.date}T${newSlotData.time}`).getTime()
      : newSlotData.startTime
        ? new Date(newSlotData.startTime).getTime()
        : Date.now();

    const originalAppointmentData = {
      appointmentId: originalAppointment._id,
      doctorId: doctorProfile._id,
      patientId: originalAppointment.patient?._id || '',
      appointmentDateTime: new Date(originalAppointment.scheduledAt).getTime(),
      appointmentType: originalAppointment.appointmentType || 'consultation',
      visitReason: originalAppointment.visitReason || 'General consultation',
      location: originalAppointment.location,
      notes: originalAppointment.notes,
      patientName,
      doctorName,
    };

    const newAppointmentData = {
      ...originalAppointmentData,
      appointmentDateTime: newAppointmentDateTime,
    };

    await appointmentRAGHooks.onAppointmentRescheduled(
      originalAppointmentData,
      newAppointmentData,
      reason || 'Rescheduled by doctor',
      'doctor'
    );
  } catch (error) {
    console.error("RAG Embedding failed for reschedule:", error);
  }
}

async function embedAppointmentConfirmation(appointment: Appointment, doctorProfile: any) {
  if (!appointment || !doctorProfile) return;

  try {
    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Unknown Patient';
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    await appointmentRAGHooks.onAppointmentConfirmed({
      appointmentId: appointment._id,
      doctorId: doctorProfile._id,
      patientId: appointment.patient?._id || '',
      appointmentDateTime: new Date(appointment.scheduledAt).getTime(),
      appointmentType: appointment.appointmentType || 'consultation',
      visitReason: appointment.visitReason || 'General consultation',
      location: appointment.location,
      notes: appointment.notes,
      patientName,
      doctorName,
    }, 'doctor');
  } catch (error) {
    console.error("RAG Embedding failed for confirmation:", error);
  }
}

async function embedAppointmentCompletion(
  appointment: Appointment,
  doctorProfile: any,
  duration?: number,
  notes?: string
) {
  if (!appointment || !doctorProfile) return;

  try {
    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Unknown Patient';
    const doctorName = doctorProfile.title
      ? `${doctorProfile.title} ${doctorProfile.lastName}`
      : `Dr. ${doctorProfile.lastName}`;

    await appointmentRAGHooks.onAppointmentCompleted({
      appointmentId: appointment._id,
      doctorId: doctorProfile._id,
      patientId: appointment.patient?._id || '',
      appointmentDateTime: new Date(appointment.scheduledAt).getTime(),
      appointmentType: appointment.appointmentType || 'consultation',
      visitReason: appointment.visitReason || 'General consultation',
      location: appointment.location,
      notes: appointment.notes,
      patientName,
      doctorName,
    }, duration, notes);
  } catch (error) {
    console.error("RAG Embedding failed for completion:", error);
  }
}

/**
 * Doctor Appointments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 * - RAG integration for appointment lifecycle events
 */
const DoctorAppointmentsPage = React.memo(() => {
  // State for selected appointment and dialogs
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile
  } = useDoctorAuth();

  const {
    appointments,
    categorizedAppointments,
    filteredAppointments,
    isLoading: appointmentsLoading,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
  } = useDoctorAppointments(doctorProfile) as any; // Extended return type

  // Additional state management
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  // Appointment actions hook
  const {
    rescheduleAppointmentWithSlot,
    confirmAppointment,
    completeAppointment
  } = useAppointmentActions();

  // Auto-update selected appointment when appointments data changes
  useEffect(() => {
    if (selectedAppointment && appointments) {
      const updatedAppointment = appointments.find((apt: Appointment) => apt._id === selectedAppointment._id);
      if (updatedAppointment && updatedAppointment.status !== selectedAppointment.status) {
        setSelectedAppointment(updatedAppointment);
      }
    }
  }, [appointments, selectedAppointment]);

  // Show loading skeleton while data is loading
  if (authLoading || appointmentsLoading) {
    return <AppointmentsSkeleton />;
  }

  // Redirect if not authenticated (handled by useDoctorAuth)
  if (!isAuthenticated || !isDoctor) {
    return null;
  }



  // Prepare category data for filters
  const categories = [
    { key: "all" as AppointmentCategory, label: "All", count: appointments?.length || 0 },
    { key: "today" as AppointmentCategory, label: "Today", count: categorizedAppointments.today?.length || 0 },
    { key: "tomorrow" as AppointmentCategory, label: "Tomorrow", count: categorizedAppointments.tomorrow?.length || 0 },
    { key: "thisWeek" as AppointmentCategory, label: "This Week", count: categorizedAppointments.thisWeek?.length || 0 },
    { key: "upcoming" as AppointmentCategory, label: "Upcoming", count: categorizedAppointments.upcoming?.length || 0 },
    { key: "past" as AppointmentCategory, label: "Past", count: categorizedAppointments.past?.length || 0 },
  ];

  const handleScheduleNew = () => {
    setShowScheduleDialog(true);
  };

  const handleAppointmentAction = async (action: string, appointmentId: any) => {
    // Find the appointment for RAG integration
    const appointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);

    // If the selected appointment was updated, refresh it
    if (selectedAppointment && selectedAppointment._id === appointmentId) {
      // Find the updated appointment from the appointments list
      const updatedAppointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);
      if (updatedAppointment) {
        setSelectedAppointment(updatedAppointment);
      }
    }

    // Handle specific actions
    switch (action) {
      case "reschedule":
        setShowRescheduleDialog(true);
        break;
      case "cancel":
        // 🔥 Embed cancellation into RAG system
        if (appointment && doctorProfile) {
          await embedAppointmentCancellation(appointment, "Cancelled by doctor", doctorProfile);
        }
        break;
      case "confirm":
        // 🔥 Confirm appointment and embed into RAG system
        if (appointment) {
          await handleConfirmAppointment(appointment._id);
        }
        break;
      case "complete":
        // 🔥 Complete appointment and embed into RAG system
        if (appointment) {
          // You could add duration and notes parameters here if needed
          await handleCompleteAppointment(appointment._id);
        }
        break;
      default:
        // For other actions, the appointment status should be updated automatically
        // via the real-time Convex subscription
        break;
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleReschedule = async (appointmentId: string, newSlotId: string, reason?: string, slotData?: any) => {
    try {
      // Find the original appointment for RAG integration
      const originalAppointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);

      // Call the slot-based reschedule function
      await rescheduleAppointmentWithSlot(
        appointmentId as any,
        newSlotId as any,
        reason
      );

      // 🔥 Embed reschedule into RAG system
      if (originalAppointment && doctorProfile && slotData) {
        await embedAppointmentReschedule(
          originalAppointment,
          slotData,
          reason || "Rescheduled by doctor",
          doctorProfile
        );
      }

    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const appointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);

      if (appointment && doctorProfile) {
        // Call the confirm appointment function (updates status)
        await confirmAppointment(appointmentId as any);

        // Use our enhanced RAG embedding with proper details
        await embedAppointmentConfirmation(appointment, doctorProfile);
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      throw error;
    }
  };

  const handleCompleteAppointment = async (appointmentId: string, duration?: number, notes?: string) => {
    try {
      const appointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);

      if (appointment && doctorProfile) {
        // Call the complete appointment function (updates status)
        await completeAppointment(appointmentId as any);

        // Use our enhanced RAG embedding with proper details
        await embedAppointmentCompletion(appointment, doctorProfile, duration, notes);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      throw error;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-3">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Appointments</h1>
        <p className="text-muted-foreground text-sm">
          Manage your schedule and upcoming appointments
        </p>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <AppointmentFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onScheduleNew={handleScheduleNew}
        />
      </div>

      {/* Split Layout - Appointments List & Details */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Side - Appointments List */}
        <div className="lg:col-span-2 min-h-0">
          <AppointmentsList
            appointments={filteredAppointments}
            isLoading={appointmentsLoading}
            emptyMessage={
              searchTerm
                ? "Try adjusting your search terms"
                : "No appointments in this category"
            }
            onAppointmentAction={handleAppointmentAction}
            onAppointmentSelect={handleAppointmentSelect}
            selectedAppointmentId={selectedAppointment?._id}
          />
        </div>

        {/* Right Side - Selected Appointment Details */}
        <div className="lg:col-span-1 min-h-0">
          <AppointmentDetails
            appointment={selectedAppointment}
            onStatusChange={handleAppointmentAction}
          />
        </div>
      </div>

      {/* Reschedule Dialog */}
      <RescheduleDialog
        appointment={selectedAppointment}
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        onReschedule={handleReschedule}
      />

      {/* Schedule New Appointment Dialog */}
      {doctorProfile && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          doctorProfile={doctorProfile}
        />
      )}
    </div>
  );
});

DoctorAppointmentsPage.displayName = "DoctorAppointmentsPage";

export default DoctorAppointmentsPage;
