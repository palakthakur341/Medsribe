"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Plus, Clock, User } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  usePatientAuth,
  usePatientAppointments,
  useAppointmentActions,
  useAppointmentDialogs,
  AppointmentList,
  CompactAppointmentList,
  CancelDialog,
  RescheduleDialog,
  QuickActionsGrid,
} from "@/app/patient/_components/appointments";

// Skeleton components following AppointmentsList exact patterns
const AppointmentListSkeleton = () => (
  <div className="divide-y">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Time and Date Skeleton - matches AppointmentsList */}
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
              <div className="h-5 w-14 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
            </div>

            {/* Doctor Info Skeleton - matches AppointmentsList patient info */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-36 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Appointment Details Skeleton - matches AppointmentsList */}
            <div className="space-y-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status and Actions Skeleton - matches AppointmentsList */}
          <div className="flex flex-col items-end gap-2">
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
            <div className="flex gap-1">
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
              <div className="h-7 w-14 bg-muted rounded animate-pulse" />
              <div className="h-7 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CompactAppointmentListSkeleton = () => (
  <div className="divide-y">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Compact time skeleton */}
            <div className="flex flex-col items-center gap-1 min-w-[50px]">
              <div className="h-4 w-10 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>

            {/* Compact info skeleton */}
            <div className="space-y-1">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-3 w-36 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Compact status */}
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const QuickActionsGridSkeleton = () => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-3 space-y-2 text-center border rounded-lg">
        <div className="h-6 w-6 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
      </div>
    ))}
  </div>
);

/**
 * Patient Appointments Page - Following AppointmentsList UI standards
 * Converted to match exact styling patterns and component structure
 */
const PatientAppointmentsPage = React.memo(() => {
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    patientProfile
  } = usePatientAuth();

  const {
    upcomingAppointments,
    pastAppointments,
    isLoading: appointmentsLoading,
  } = usePatientAppointments(patientProfile?._id);

  const {
    cancelAppointment,
    joinCall,
    loadingStates,
  } = useAppointmentActions();

  // Reschedule request mutation
  const createRescheduleRequest = useMutation(api.appointmentRescheduleRequests.createRescheduleRequest);

  const {
    cancelDialog,
    rescheduleDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
  } = useAppointmentDialogs();

  // Memoized authentication check
  const isAuthorized = React.useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );

  // Memoized action handlers for performance
  const handleCancelAppointment = React.useCallback(async (appointmentId: any) => {
    try {
      await cancelAppointment(appointmentId);
      closeCancelDialog();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  }, [cancelAppointment, closeCancelDialog]);

  const handleRescheduleAppointment = React.useCallback(async (requestData: any) => {
    if (!requestData.appointmentId || !requestData.reason) return;

    try {
      await createRescheduleRequest({
        appointmentId: requestData.appointmentId,
        requestedSlotId: requestData.requestedSlotId,
        reason: requestData.reason,
      });

      toast.success("Reschedule request submitted successfully! The doctor's office will review your request.");
      closeRescheduleDialog();
    } catch (error) {
      console.error("Failed to submit reschedule request:", error);
      toast.error("Failed to submit reschedule request. Please try again.");
    }
  }, [createRescheduleRequest, closeRescheduleDialog]);

  // Memoized handlers for dialog actions
  const memoizedOpenCancelDialog = React.useCallback(openCancelDialog, [openCancelDialog]);
  const memoizedOpenRescheduleDialog = React.useCallback(openRescheduleDialog, [openRescheduleDialog]);
  const memoizedJoinCall = React.useCallback(joinCall, [joinCall]);

  // Authentication check
  if (authLoading || !isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="h-full flex flex-col space-y-4 p-4">
        {/* Page Header - Following AppointmentsList header pattern */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">My Appointments</h1>
              <p className="text-xs text-muted-foreground">View and manage your medical appointments</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Appointments - Styled exactly like AppointmentsList */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden")}>
              {/* Header - Exact match to AppointmentsList header */}
              <div className="flex-shrink-0 p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Calendar className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Upcoming Appointments</h3>
                    <p className="text-xs text-muted-foreground">
                      {upcomingAppointments?.length || 0} appointment{(upcomingAppointments?.length || 0) !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointments List - Same ScrollArea pattern */}
              <ScrollArea className="flex-1 overflow-hidden">
                {appointmentsLoading ? (
                  <AppointmentListSkeleton />
                ) : (
                  <AppointmentList
                    appointments={upcomingAppointments || []}
                    showActions={true}
                    onCancel={memoizedOpenCancelDialog}
                    onReschedule={memoizedOpenRescheduleDialog}
                    onJoin={memoizedJoinCall}
                  />
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Right Sidebar - Past Appointments & Quick Actions */}
          <div className="flex flex-col space-y-4 min-h-0">
            {/* Past Appointments - Same structure as main appointments */}
            <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden")}>
              {/* Header - Same pattern */}
              <div className="flex-shrink-0 p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Clock className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Past Appointments</h3>
                    <p className="text-xs text-muted-foreground">
                      {pastAppointments?.length || 0} completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 overflow-hidden">
                {appointmentsLoading ? (
                  <CompactAppointmentListSkeleton />
                ) : (
                  <div className="divide-y overflow-hidden">
                    <div className="p-4">
                      <CompactAppointmentList
                        appointments={pastAppointments || []}
                        maxItems={8}
                        showActions={false}
                      />
                      {(pastAppointments?.length || 0) > 8 && (
                        <div className="pt-3 border-t border-border/50 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-8 hover:bg-muted/50"
                            onClick={() => window.location.href = "/patient/appointments/history"}
                          >
                            View all {pastAppointments?.length} appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Quick Actions - Following AppointmentsList container pattern */}
            <div className={cn("border rounded-xl flex flex-col")}>
              {/* Header - Same pattern as other sections */}
              <div className="flex-shrink-0 p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
                    <p className="text-xs text-muted-foreground">Common appointment tasks</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {appointmentsLoading ? (
                  <QuickActionsGridSkeleton />
                ) : (
                  <QuickActionsGrid variant="compact" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs - Keep original functionality */}
      <CancelDialog
        open={cancelDialog.open}
        onOpenChange={closeCancelDialog}
        appointmentId={cancelDialog.appointmentId}
        appointment={
          cancelDialog.appointmentId
            ? [...(upcomingAppointments || []), ...(pastAppointments || [])]
                .find(apt => apt._id === cancelDialog.appointmentId)
            : undefined
        }
        onConfirm={handleCancelAppointment}
        isLoading={cancelDialog.appointmentId ? loadingStates.cancel[cancelDialog.appointmentId.toString()] : false}
      />

      <RescheduleDialog
        open={rescheduleDialog.open}
        onOpenChange={closeRescheduleDialog}
        appointmentId={rescheduleDialog.appointmentId}
        appointment={
          rescheduleDialog.appointmentId
            ? [...(upcomingAppointments || []), ...(pastAppointments || [])]
                .find(apt => apt._id === rescheduleDialog.appointmentId)
            : undefined
        }
        onConfirm={handleRescheduleAppointment}
        isLoading={rescheduleDialog.appointmentId ? loadingStates.reschedule[rescheduleDialog.appointmentId.toString()] : false}
      />
    </>
  );
});

PatientAppointmentsPage.displayName = "PatientAppointmentsPage";

export default PatientAppointmentsPage;