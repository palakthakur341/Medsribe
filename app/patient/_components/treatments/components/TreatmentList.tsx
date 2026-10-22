import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";
import { TreatmentCard } from "./TreatmentCard";
import type { TreatmentListProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * TreatmentList Component
 * 
 * Displays a list of treatments with empty state handling
 * Follows consistent UI standards with AppointmentsList
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  treatments,
  selectedTreatment,
  onSelectTreatment,
  variant = "list",
  emptyState,
  className = "",
  maxItems,
  isLoading = false,
}) => {
  const displayTreatments = maxItems ? treatments.slice(0, maxItems) : treatments;

  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Icon Skeleton */}
                  <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                  
                  {/* Treatment Info Skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Status Skeleton */}
                <div className="flex flex-col items-end gap-2">
                  <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (treatments.length === 0) {
    if (emptyState) {
      return <div className={cn("h-full", className)}>{emptyState}</div>;
    }

    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No treatment plans</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your treatment plans will appear here once your doctor creates them for you.
          </p>
        </div>
      </div>
    );
  }

  // Apply variant-specific styling
  const listClassName = variant === "grid"
    ? "grid grid-cols-1 gap-2 p-4"
    : "divide-y overflow-hidden p-4 space-y-2";

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">My Treatments</h3>
              <p className="text-xs text-muted-foreground">
                {treatments.length} treatment{treatments.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {treatments.length} Total
          </Badge>
        </div>
      </div>

      {/* Treatment List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className={listClassName}>
          {displayTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment._id}
              treatment={treatment}
              isSelected={selectedTreatment?._id === treatment._id}
              onClick={() => onSelectTreatment?.(treatment)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

TreatmentList.displayName = "TreatmentList";