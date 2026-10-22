import * as React from "react";
import type { TreatmentStatsProps } from "../types";

/**
 * Treatment Statistics Component
 * Displays treatment and medication statistics
 */
export const TreatmentStats = React.memo<TreatmentStatsProps>(({
  stats,
  isLoading = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground animate-pulse bg-muted rounded w-8 h-8"></div>
          <div className="text-xs text-muted-foreground">Active Plans</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground animate-pulse bg-muted rounded w-8 h-8"></div>
          <div className="text-xs text-muted-foreground">Medications</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-right">
        <div className="text-2xl font-bold text-foreground">{stats.active}</div>
        <div className="text-xs text-muted-foreground">Active Plans</div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="text-right">
        <div className="text-2xl font-bold text-foreground">{stats.activeMedications}</div>
        <div className="text-xs text-muted-foreground">Medications</div>
      </div>
    </div>
  );
});

TreatmentStats.displayName = "TreatmentStats";
