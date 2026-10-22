import React from "react";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from "lucide-react";

interface TreatmentEmptyStateProps {
  onAddTreatment: () => void;
}

/**
 * TreatmentEmptyState Component
 * 
 * Professional empty state for when no treatments exist
 * Encourages action with clear call-to-action
 */
export const TreatmentEmptyState = React.memo<TreatmentEmptyStateProps>(({
  onAddTreatment,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="font-semibold text-lg mb-2 text-foreground">
        No Treatment Plans
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Create treatment plans to manage patient care and track progress.
      </p>

      <Button onClick={onAddTreatment}>
        <Plus className="h-4 w-4 mr-2" />
        Add Treatment Plan
      </Button>
    </div>
  );
});

TreatmentEmptyState.displayName = "TreatmentEmptyState";
