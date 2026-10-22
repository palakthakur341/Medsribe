import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Phone,
  Mail,
  User,
  MessageCircle,
  Plus,
  Pill,
  FileText,
} from "lucide-react";
import { usePatientDetailFormatters } from "../hooks";
import type { PatientHeaderProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientHeader Component
 *
 * Displays patient information header with quick actions
 * Optimized for performance with React.memo
 */
export const PatientHeader = React.memo<Omit<PatientHeaderProps, 'patient'> & { patient: PatientHeaderProps['patient'] | null; isLoading?: boolean }>(({
  patient,
  onChatToggle,
  onAppointmentClick,
  onAddTreatment,
  onSOAPHistoryToggle,
  showChat,
  showSOAPHistory = false,
  isLoading = false,
  className = "",
}) => {
  const { calculateAge, getInitials } = usePatientDetailFormatters();

  // Show skeleton loading state
  if (isLoading || !patient) {
    return (
      <div className={cn("flex-shrink-0 space-y-1", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.dateOfBirth);
  const initials = getInitials(patient.firstName, patient.lastName);

  return (
    <div className={cn("flex-shrink-0", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-background">
            <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {age} years old
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {patient.gender}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {patient.primaryPhone}
              </span>
              {patient.email && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {patient.email}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onChatToggle}
            className="h-8 px-3 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {showChat ? 'Hide Chat' : 'Chat'}
          </Button>

          {onSOAPHistoryToggle && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSOAPHistoryToggle}
              className="h-8 px-3 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              {showSOAPHistory ? 'Hide SOAP' : 'SOAP History'}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onAppointmentClick}
            className="h-8 px-3 text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Set Appointment
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onAddTreatment}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Treatment
          </Button>


        </div>
      </div>
    </div>
  );
});

PatientHeader.displayName = "PatientHeader";
