import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { AppointmentCard } from "./AppointmentCard";
import { useAppointmentActions } from "../hooks";
import type { AppointmentsListProps, Appointment } from "../types";
import { cn } from "@/lib/utils";

/**
 * AppointmentsList Component
 * 
 * Displays a list of appointments with empty state handling
 * Integrates with appointment actions automatically
 */
interface ExtendedAppointmentsListProps extends AppointmentsListProps {
  onAppointmentSelect?: (appointment: Appointment) => void;
  selectedAppointmentId?: string;
}

export const AppointmentsList = React.memo<ExtendedAppointmentsListProps>(({
  appointments,
  isLoading = false,
  emptyMessage = "No appointments found",
  onAppointmentAction,
  onAppointmentSelect,
  selectedAppointmentId,
  className = "",
}) => {
  const {
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    joinCall,
    loadingStates,
  } = useAppointmentActions();

  // Handle appointment actions
  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId as any);
      onAppointmentAction?.("cancel", appointmentId as any);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId as any);
      onAppointmentAction?.("confirm", appointmentId as any);
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleStart = async (appointmentId: string) => {
    try {
      await startAppointment(appointmentId as any);
      onAppointmentAction?.("start", appointmentId as any);
    } catch (error) {
      console.error("Failed to start appointment:", error);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      await completeAppointment(appointmentId as any);
      onAppointmentAction?.("complete", appointmentId as any);
    } catch (error) {
      console.error("Failed to complete appointment:", error);
    }
  };

  const handleJoinCall = (appointment: any) => {
    joinCall(appointment);
  };

  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Time and Date Skeleton */}
                  <div className="flex flex-col items-center gap-1 min-w-[70px]">
                    <div className="h-5 w-14 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-10 bg-muted rounded animate-pulse" />
                  </div>

                  {/* Patient Info Skeleton */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-36 bg-muted rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Appointment Details Skeleton */}
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Status and Actions Skeleton */}
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
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No appointments found</h3>
          <p className="text-sm text-muted-foreground">
            {emptyMessage}
          </p>
          <Button variant="outline" size="sm" className="rounded-lg">
            <Plus className="h-4 w-4 mr-1" />
            Schedule Appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Today's Appointments</h3>
            <p className="text-xs text-muted-foreground">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {appointments.map((appointment) => {
            const appointmentId = appointment._id;
            const isActionLoading = Object.keys(loadingStates).some(key =>
              key.startsWith(appointmentId) && loadingStates[key]
            );

            return (
              <AppointmentCard
                key={appointmentId}
                appointment={appointment}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onStart={handleStart}
                onComplete={handleComplete}
                onJoinCall={handleJoinCall}
                isLoading={isActionLoading}
                onSelect={onAppointmentSelect}
                isSelected={selectedAppointmentId === appointmentId}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

AppointmentsList.displayName = "AppointmentsList";
