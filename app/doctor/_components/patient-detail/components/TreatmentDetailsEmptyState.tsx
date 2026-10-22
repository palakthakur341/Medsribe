import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatmentDetailsEmptyStateProps {
  className?: string;
}

/**
 * TreatmentDetailsEmptyState Component
 * 
 * Empty state for treatment details when no treatment is selected
 */
export const TreatmentDetailsEmptyState = React.memo<TreatmentDetailsEmptyStateProps>(({
  className,
}) => {
  return (
    <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
      <CardContent className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-semibold text-lg mb-2 text-foreground">
            Select a Treatment Plan
          </h3>

          <p className="text-sm text-muted-foreground">
            Choose a treatment plan to view details and manage medications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

TreatmentDetailsEmptyState.displayName = "TreatmentDetailsEmptyState";
