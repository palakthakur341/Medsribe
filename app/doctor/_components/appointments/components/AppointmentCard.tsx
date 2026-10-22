import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  XCircle,
  Video,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { useAppointmentFormatters } from "../hooks";
import type { AppointmentCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * AppointmentCard Component
 * 
 * Displays a single appointment with patient info, timing, and action buttons
 * Optimized for performance with React.memo
 */
interface ExtendedAppointmentCardProps extends AppointmentCardProps {
  onSelect?: (appointment: any) => void;
  isSelected?: boolean;
}

export const AppointmentCard = React.memo<ExtendedAppointmentCardProps>(({
  appointment,
  onCancel,
  onConfirm,
  onStart,
  onComplete,
  onJoinCall,
  isLoading = false,
  onSelect,
  isSelected = false,
  className = "",
}) => {
  const { formatTime, formatDate, getStatusColor, getStatusIcon } = useAppointmentFormatters();

  const handleCancel = () => {
    onCancel?.(appointment._id);
  };

  const handleConfirm = () => {
    onConfirm?.(appointment._id);
  };

  const handleStart = () => {
    onStart?.(appointment._id);
  };

  const handleComplete = () => {
    onComplete?.(appointment._id);
  };

  const handleJoinCall = () => {
    onJoinCall?.(appointment);
  };

  const handleSelect = () => {
    onSelect?.(appointment);
  };

  const patientAge = appointment.patient?.dateOfBirth 
    ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()
    : 'N/A';

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/30 transition-colors border-l-2 border-l-transparent hover:border-l-primary/20 cursor-pointer overflow-hidden",
        isLoading && "opacity-50 pointer-events-none",
        isSelected && "bg-primary/5 border-l-primary",
        className
      )}
      onClick={handleSelect}
    >
      <div className="flex items-center justify-between">
        {/* Left: Time and Patient Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Time */}
          <div className="text-center min-w-[50px]">
            <div className="text-sm font-medium">
              {formatTime(appointment.appointmentDateTime)}
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.duration}m
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate max-w-[580px] block">
                  {appointment.visitReason && appointment.visitReason.length > 100
                    ? `${appointment.visitReason}...`
                    : appointment.visitReason}
                </span>
                {appointment.location?.type === "telemedicine" && (
                  <>
                    <span className="flex-shrink-0">•</span>
                    <Video className="h-3 w-3 flex-shrink-0" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status */}
        <div className="flex-shrink-0">
          <Badge
            variant="secondary"
            className={cn("text-xs", getStatusColor(appointment.status))}
          >
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </div>
  );
});

AppointmentCard.displayName = "AppointmentCard";
