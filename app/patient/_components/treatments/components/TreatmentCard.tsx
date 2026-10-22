import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Pause, 
  Pill, 
  Target 
} from "lucide-react";
import type { TreatmentCardProps } from "../types";

/**
 * Compact Treatment Card Component for Sidebar
 * Displays treatment information in a compact, clickable format
 */
export const TreatmentCard = React.memo<TreatmentCardProps>(({
  treatment,
  variant = "default",
  isSelected = false,
  onClick,
  className = "",
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-primary" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-primary" />;
      case "discontinued":
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Pause className="h-3 w-3 text-muted-foreground" />;
    }
  };

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

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      } ${className}`}
      onClick={onClick}
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
      </div>
    </div>
  );
});

TreatmentCard.displayName = "TreatmentCard";
