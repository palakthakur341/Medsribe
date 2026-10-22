"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Pill,
  Target,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface TreatmentCardProps {
  treatment: any; // Using any for now to handle the complex API response structure
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * TreatmentCard Component
 * 
 * Individual treatment card component for displaying treatment information
 * Similar to SOAPNoteCard but for treatments
 */
export const TreatmentCard = React.memo<TreatmentCardProps>(({
  treatment,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onStatusChange,
  compact = false,
  showActions = true,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-primary" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-primary" />;
      case "discontinued":
        return <AlertTriangle className="h-3 w-3 text-destructive" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };



  // Compact version for list views - matching patient style
  if (compact) {
    return (
      <div
        className={cn(
          "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          className
        )}
        onClick={onSelect}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate flex-1">{treatment.title}</h4>
            <Badge variant="outline" className={`${getStatusColor(treatment.status)} text-xs h-5 px-2`}>
              {getStatusIcon(treatment.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {treatment.diagnosis}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Pill className="h-3 w-3" />
                {treatment.medicationDetails?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {treatment.goals?.length || 0}
              </span>
            </div>
            <span className="text-xs">
              {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Action buttons for selected state */}
          {isSelected && showActions && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Status Actions */}
              {onStatusChange && treatment.status === "active" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
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
    );
  }

  // Default to compact version
  return (
    <div
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        className
      )}
      onClick={onSelect}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate flex-1">{treatment.title}</h4>
          <Badge variant="outline" className={`${getStatusColor(treatment.status)} text-xs h-5 px-2`}>
            {getStatusIcon(treatment.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {treatment.diagnosis}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3" />
              {treatment.medicationDetails?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {treatment.goals?.length || 0}
            </span>
          </div>
          <span className="text-xs">
            {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Action buttons for selected state */}
        {isSelected && showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {/* Status Actions */}
            {onStatusChange && treatment.status === "active" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
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
  );
});

TreatmentCard.displayName = "TreatmentCard";
