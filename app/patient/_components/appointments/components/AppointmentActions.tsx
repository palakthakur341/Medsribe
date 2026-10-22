"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, X, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentActionsProps } from "../types";

/**
 * Reusable appointment actions component with configurable button sets
 * 
 * Features:
 * - Configurable action buttons (cancel, reschedule, join)
 * - Loading states for each action
 * - Multiple sizes and variants
 * - Conditional rendering based on appointment type and status
 * - Performance optimized with React.memo
 * 
 * @param props - AppointmentActionsProps
 * @returns JSX.Element
 */
export const AppointmentActions = React.memo<AppointmentActionsProps>(({
  appointment,
  onCancel,
  onReschedule,
  onJoin,
  loadingStates,
  size = "sm",
  variant = "default",
  className,
}) => {
  const appointmentId = appointment._id.toString();
  const isTelemedicine = appointment.location?.type === 'telemedicine';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed';
  const canReschedule = appointment.status === 'scheduled' || appointment.status === 'confirmed';
  const canJoin = isTelemedicine && (
    appointment.status === 'confirmed' || 
    appointment.status === 'checked_in' ||
    appointment.status === 'in_progress'
  );

  // Loading states
  const isCancelLoading = loadingStates?.cancel[appointmentId] || false;
  const isRescheduleLoading = loadingStates?.reschedule[appointmentId] || false;
  const isJoinLoading = loadingStates?.join[appointmentId] || false;

  // Button size classes
  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-9 px-4 text-sm",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-4 w-4",
  };

  const buttonClass = sizeClasses[size];
  const iconClass = iconSizeClasses[size];

  // Compact variant - minimal buttons
  if (variant === "compact") {
    return (
      <div className={cn("flex gap-1.5", className)}>
        {canJoin && onJoin && (
          <Button
            size="sm"
            className={cn(buttonClass, "bg-primary hover:bg-primary/90")}
            onClick={() => onJoin(appointment.location?.meetingLink)}
            disabled={isJoinLoading}
            aria-label="Join video call"
          >
            {isJoinLoading ? (
              <Loader2 className={cn(iconClass, "animate-spin")} />
            ) : (
              <Video className={iconClass} />
            )}
          </Button>
        )}

        {canReschedule && onReschedule && (
          <Button
            size="sm"
            variant="outline"
            className={cn(buttonClass, "border-border hover:bg-muted/50")}
            onClick={() => onReschedule(appointment._id)}
            disabled={isRescheduleLoading}
            aria-label="Reschedule appointment"
          >
            {isRescheduleLoading ? (
              <Loader2 className={cn(iconClass, "animate-spin")} />
            ) : (
              <Calendar className={iconClass} />
            )}
          </Button>
        )}

        {canCancel && onCancel && (
          <Button
            size="sm"
            variant="outline"
            className={cn(buttonClass, "border-destructive/20 text-destructive hover:bg-destructive/10")}
            onClick={() => onCancel(appointment._id)}
            disabled={isCancelLoading}
            aria-label="Cancel appointment"
          >
            {isCancelLoading ? (
              <Loader2 className={cn(iconClass, "animate-spin")} />
            ) : (
              <X className={iconClass} />
            )}
          </Button>
        )}
      </div>
    );
  }

  // Default variant - buttons with text
  return (
    <div className={cn("flex gap-2", className)}>
      {canJoin && onJoin && (
        <Button
          size={size}
          onClick={() => onJoin(appointment.location?.meetingLink)}
          disabled={isJoinLoading}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90"
        >
          {isJoinLoading ? (
            <Loader2 className={cn(iconClass, "animate-spin")} />
          ) : (
            <Video className={iconClass} />
          )}
          {size !== "sm" && "Join Call"}
        </Button>
      )}

      {canReschedule && onReschedule && (
        <Button
          size={size}
          variant="outline"
          onClick={() => onReschedule(appointment._id)}
          disabled={isRescheduleLoading}
          className="flex items-center gap-1.5 border-border hover:bg-muted/50"
        >
          {isRescheduleLoading ? (
            <Loader2 className={cn(iconClass, "animate-spin")} />
          ) : (
            <Calendar className={iconClass} />
          )}
          {size !== "sm" && "Reschedule"}
        </Button>
      )}

      {canCancel && onCancel && (
        <Button
          size={size}
          variant="outline"
          onClick={() => onCancel(appointment._id)}
          disabled={isCancelLoading}
          className="flex items-center gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/10"
        >
          {isCancelLoading ? (
            <Loader2 className={cn(iconClass, "animate-spin")} />
          ) : (
            <X className={iconClass} />
          )}
          {size !== "sm" && "Cancel"}
        </Button>
      )}
    </div>
  );
});

AppointmentActions.displayName = "AppointmentActions";
