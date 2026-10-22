"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface TreatmentListProps {
  patientId: string;
  selectedTreatmentId?: string | null;
  onSelectTreatment?: (treatmentId: string | null) => void;
  onViewTreatment?: (treatmentId: string) => void;
  onAddTreatment?: () => void;
  onStatusChange?: (treatmentId: string, status: string) => void;
  className?: string;
}

// Treatment Card Component - Compact listing for narrow widths
const TreatmentCard = React.memo<{
  treatment: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
}>(({ treatment, isSelected, onSelect, onView, onStatusChange }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Active"
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
          label: "Completed"
        };
      case "discontinued":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Discontinued"
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          className: "bg-muted text-muted-foreground border-border",
          label: "Unknown"
        };
    }
  };

  const statusConfig = getStatusConfig(treatment.status);

  return (
    <div
      className={cn(
        "p-3 cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isSelected ? "bg-primary/5" : ""
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        {/* Status Indicator */}
        <div className={cn("h-4 w-4 rounded flex items-center justify-center mt-0.5", statusConfig.className)}>
          {statusConfig.icon}
        </div>

        {/* Treatment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground line-clamp-1">
                {treatment.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {treatment.diagnosis}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn("px-1.5 py-0.5 text-xs flex-shrink-0", statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Pill className="h-3 w-3" />
                {treatment.medicationDetails?.length || 0} meds
              </span>
              <span>
                {new Date(treatment.startDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            {isSelected && (
              <div className="flex gap-1">
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                
                {onStatusChange && treatment.status === "active" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange("completed");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange("discontinued");
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Discontinue Treatment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TreatmentCard.displayName = "TreatmentCard";

/**
 * TreatmentList Component
 * Compact listing with no search/filters for narrow widths
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  patientId,
  selectedTreatmentId,
  onSelectTreatment,
  onViewTreatment,
  onAddTreatment,
  onStatusChange,
  className = "",
}) => {
  // Fetch treatments for the patient
  const treatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Loading state - Compact skeleton
  if (!treatments) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3">
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (treatments.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No treatments found</h3>
          <p className="text-sm text-muted-foreground">
            No treatment plans have been created yet
          </p>
          {onAddTreatment && (
            <Button variant="outline" size="sm" className="rounded-lg" onClick={onAddTreatment}>
              <Plus className="h-4 w-4 mr-1" />
              Add Treatment
            </Button>
          )}
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
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Treatment Plans</h3>
            <p className="text-xs text-muted-foreground">
              {treatments.length} treatment{treatments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Treatments List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {treatments.map((treatment) => {
            const isSelected = selectedTreatmentId === treatment._id;
            return (
              <TreatmentCard
                key={treatment._id}
                treatment={treatment}
                isSelected={isSelected}
                onSelect={() => onSelectTreatment?.(isSelected ? null : treatment._id)}
                onView={() => onViewTreatment?.(treatment._id)}
                onStatusChange={(status) => onStatusChange?.(treatment._id, status)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

TreatmentList.displayName = "TreatmentList";