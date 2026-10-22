"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Clock, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentCardProps } from "../types";
import { useAppointmentFormatters } from "../hooks";
import { AppointmentActions } from "./AppointmentActions";

/**
 * Reusable appointment card component with configurable layouts and actions
 * 
 * Features:
 * - Multiple variants (default, compact, detailed)
 * - Configurable actions (cancel, reschedule, join)
 * - Performance optimized with React.memo
 * - Responsive design
 * - Accessibility support
 * 
 * @param props - AppointmentCardProps
 * @returns JSX.Element
 */
export const AppointmentCard = React.memo<AppointmentCardProps>(({
  appointment,
  variant = "default",
  showActions = true,
  onCancel,
  onReschedule,
  onJoin,
  className,
}) => {
  const {
    formatDate,
    formatTime,
    getAppointmentTypeLabel,
    getStatusLabel,
    getStatusVariant,
    getDurationLabel,
  } = useAppointmentFormatters();

  // Derived data
  const doctorName = appointment.doctor
    ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : 'Unknown Doctor';
  
  const doctorInitials = appointment.doctor
    ? `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}`
    : 'UD';
  
  const isTelemedicine = appointment.location?.type === 'telemedicine';
  const locationText = isTelemedicine
    ? 'Online Meeting'
    : appointment.location?.address || 'Medical Center';

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn(
        "p-3 hover:bg-muted/50 transition-colors rounded-lg border",
        className
      )}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">{doctorName}</h4>
              <div className="text-xs text-muted-foreground">
                {formatDate(appointment.appointmentDateTime)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground truncate">
                {appointment.doctor?.primarySpecialty || 'General Practice'}
              </p>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs h-5 px-2">
                  {getAppointmentTypeLabel(appointment.appointmentType)}
                </Badge>
                <StatusIndicator
                  status={getStatusVariant(appointment.status)}
                  label={getStatusLabel(appointment.status)}
                  variant="pill"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default and detailed variants
  return (
    <div className={cn(
      "p-4 hover:bg-muted/50 transition-colors border rounded-lg",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Date & Time Section */}
        <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 min-w-[70px]">
          <div className="text-xs font-medium">
            {formatDate(appointment.appointmentDateTime)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(appointment.appointmentDateTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {getDurationLabel(appointment.duration)}
          </div>
        </div>

        {/* Doctor Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">{doctorName}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {appointment.doctor?.primarySpecialty || 'General Practice'}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {isTelemedicine ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span className="truncate">{locationText}</span>
              </div>
              {variant === "detailed" && appointment.visitReason && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {appointment.visitReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status & Actions Section */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs h-6 px-2">
              {getAppointmentTypeLabel(appointment.appointmentType)}
            </Badge>
            <StatusIndicator
              status={getStatusVariant(appointment.status)}
              label={getStatusLabel(appointment.status)}
              variant="pill"
              size="sm"
            />
          </div>
          {showActions && (
            <AppointmentActions
              appointment={appointment}
              onCancel={onCancel}
              onReschedule={onReschedule}
              onJoin={onJoin}
              size="sm"
              variant="compact"
            />
          )}
        </div>
      </div>
    </div>
  );
});

AppointmentCard.displayName = "AppointmentCard";
