/**
 * Example usage of the refactored appointment components
 * 
 * This file demonstrates how to use the new appointment components
 * and hooks in different scenarios.
 */

import React from 'react';
import {
  usePatientAuth,
  usePatientAppointments,
  useAppointmentActions,
  useAppointmentDialogs,
  useAppointmentFormatters,
  AppointmentCard,
  AppointmentList,
  CompactAppointmentList,
  AppointmentActions,
  QuickActionsGrid,
  AppointmentStats,
  CancelDialog,
  RescheduleDialog,
} from './index';

// Example 1: Simple appointment list
export function SimpleAppointmentList() {
  const { patientProfile } = usePatientAuth();
  const { upcomingAppointments } = usePatientAppointments(patientProfile?._id);
  const { cancelAppointment, joinCall } = useAppointmentActions();

  return (
    <AppointmentList
      appointments={upcomingAppointments || []}
      showActions={true}
      onCancel={cancelAppointment}
      onJoin={joinCall}
    />
  );
}

// Example 2: Compact sidebar appointments
export function SidebarAppointments() {
  const { patientProfile } = usePatientAuth();
  const { upcomingAppointments } = usePatientAppointments(patientProfile?._id);

  return (
    <CompactAppointmentList
      appointments={upcomingAppointments || []}
      maxItems={3}
      showActions={false}
    />
  );
}

// Example 3: Individual appointment card
export function AppointmentCardExample({ appointment }: { appointment: any }) {
  const { cancelAppointment, rescheduleAppointment, joinCall } = useAppointmentActions();

  return (
    <AppointmentCard
      appointment={appointment}
      variant="detailed"
      showActions={true}
      onCancel={cancelAppointment}
      onReschedule={rescheduleAppointment}
      onJoin={joinCall}
    />
  );
}

// Example 4: Dashboard with stats
export function AppointmentDashboard() {
  const { patientProfile } = usePatientAuth();
  const { upcomingAppointments, pastAppointments, stats } = usePatientAppointments(patientProfile?._id);
  const { openCancelDialog, openRescheduleDialog } = useAppointmentDialogs();

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <AppointmentStats stats={stats} />
      
      {/* Quick Actions */}
      <QuickActionsGrid variant="default" />
      
      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <AppointmentList
          appointments={upcomingAppointments || []}
          variant="list"
          showActions={true}
          onCancel={openCancelDialog}
          onReschedule={openRescheduleDialog}
        />
      </div>
      
      {/* Past Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
        <CompactAppointmentList
          appointments={pastAppointments || []}
          maxItems={5}
          showActions={false}
        />
      </div>
    </div>
  );
}

// Example 5: Using formatters
export function FormattingExample({ appointment }: { appointment: any }) {
  const {
    formatDate,
    formatTime,
    getAppointmentTypeLabel,
    getStatusLabel,
    getStatusVariant,
  } = useAppointmentFormatters();

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">
        {getAppointmentTypeLabel(appointment.appointmentType)}
      </h3>
      <p>Date: {formatDate(appointment.appointmentDateTime)}</p>
      <p>Time: {formatTime(appointment.appointmentDateTime)}</p>
      <p>Status: {getStatusLabel(appointment.status)}</p>
      <p>Variant: {getStatusVariant(appointment.status)}</p>
    </div>
  );
}

// Example 6: Complete page with dialogs
export function CompleteAppointmentPage() {
  const { isLoading, isAuthenticated, isPatient, patientProfile } = usePatientAuth();
  const { upcomingAppointments, pastAppointments, stats } = usePatientAppointments(patientProfile?._id);
  const { cancelAppointment, rescheduleAppointment, joinCall, loadingStates } = useAppointmentActions();
  const {
    cancelDialog,
    rescheduleDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
  } = useAppointmentDialogs();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isPatient) {
    return <div>Access denied</div>;
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        
        <AppointmentStats stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <AppointmentList
              appointments={upcomingAppointments || []}
              showActions={true}
              onCancel={openCancelDialog}
              onReschedule={openRescheduleDialog}
              onJoin={joinCall}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent</h2>
              <CompactAppointmentList
                appointments={pastAppointments || []}
                maxItems={5}
              />
            </div>
            
            <QuickActionsGrid variant="compact" />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CancelDialog
        open={cancelDialog.open}
        onOpenChange={closeCancelDialog}
        appointmentId={cancelDialog.appointmentId}
        onConfirm={cancelAppointment}
        isLoading={cancelDialog.appointmentId ? loadingStates.cancel[cancelDialog.appointmentId.toString()] : false}
      />

      <RescheduleDialog
        open={rescheduleDialog.open}
        onOpenChange={closeRescheduleDialog}
        appointmentId={rescheduleDialog.appointmentId}
        onConfirm={rescheduleAppointment}
        isLoading={rescheduleDialog.appointmentId ? loadingStates.reschedule[rescheduleDialog.appointmentId.toString()] : false}
      />
    </>
  );
}
