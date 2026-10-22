import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Phone,
  Mail,
  Activity,
  Eye,
  UserMinus,
} from "lucide-react";
import { usePatientFormatters } from "../hooks";
import type { PatientCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientCard Component
 * 
 * Displays a single patient with their info and action buttons
 * Optimized for performance with React.memo
 */
export const PatientCard = React.memo<PatientCardProps>(({
  relationship,
  onView,
  onRemove,
  isLoading = false,
  className = "",
}) => {
  const { 
    calculateAge, 
    formatAssignmentType, 
    formatPatientName,
    getAssignmentBadgeVariant 
  } = usePatientFormatters();

  const patient = relationship.patient;
  
  if (!patient) {
    return null;
  }

  const handleView = () => {
    onView?.(patient._id);
  };

  const handleRemove = () => {
    onRemove?.(relationship._id);
  };

  const age = calculateAge(patient.dateOfBirth);
  const patientName = formatPatientName(patient);

  return (
    <div
      className={cn(
        "group p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary/30",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      onClick={handleView}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Patient Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary group-hover:bg-primary/20">
              {patient.firstName[0]}{patient.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {patientName}
              </h3>
              <Badge
                variant={getAssignmentBadgeVariant(relationship.assignedBy)}
                className="text-xs flex-shrink-0"
              >
                {formatAssignmentType(relationship.assignedBy)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3" />
                {age} years
              </span>
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md truncate">
                <Phone className="h-3 w-3" />
                {patient.primaryPhone}
              </span>
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md truncate">
                <Mail className="h-3 w-3" />
                {patient.email}
              </span>
              <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                <Activity className="h-3 w-3" />
                {patient.mrn}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isLoading}
          >
            <UserMinus className="h-4 w-4" />
          </Button>

          {/* View Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            disabled={isLoading}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
});

PatientCard.displayName = "PatientCard";
