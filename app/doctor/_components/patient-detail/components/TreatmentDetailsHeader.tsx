"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Calendar,
  FileText,
  Target,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatmentDetailsHeaderProps {
  treatment: any;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
}

export const TreatmentDetailsHeader = React.memo<TreatmentDetailsHeaderProps>(({
  treatment,
  onView,
  onStatusChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="h-4 w-4 mr-2" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case "discontinued":
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      default:
        return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Treatment Header - Enhanced with Better Visual Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{treatment.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-11">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Started {formatLongDate(treatment.startDate)}
              </span>
              {treatment.endDate && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Ends {formatLongDate(treatment.endDate)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs px-2.5 py-1 font-medium", getStatusColor(treatment.status))}
            >
              {getStatusIcon(treatment.status)}
              <span className="capitalize">{treatment.status}</span>
            </Badge>

            {onView && (
              <Button variant="outline" size="sm" onClick={onView} className="gap-1.5">
                <Eye className="h-4 w-4" />
                View
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {treatment.status === "active" && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange?.("completed")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.("discontinued")}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Discontinue
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Enhanced Information Grid - Matching AppointmentsList Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Primary Diagnosis */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Primary Diagnosis</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground leading-relaxed">{treatment.diagnosis}</p>
            <p className="text-xs text-muted-foreground">Medical condition identified</p>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Treatment Plan</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground leading-relaxed">{treatment.plan}</p>
            <p className="text-xs text-muted-foreground">Therapeutic approach and interventions</p>
          </div>
        </div>

        {/* Pharmacy Information */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pharmacy</span>
          </div>
          {treatment.pharmacy ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{treatment.pharmacy.name}</p>
              {treatment.pharmacy.chainName && (
                <p className="text-xs text-muted-foreground">{treatment.pharmacy.chainName}</p>
              )}
              {treatment.pharmacy.address && (
                <p className="text-xs text-muted-foreground">
                  {treatment.pharmacy.address.street}, {treatment.pharmacy.address.city}, {treatment.pharmacy.address.state} {treatment.pharmacy.address.zipCode}
                </p>
              )}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">
                  {treatment.medicationDetails?.length || 0} prescription{(treatment.medicationDetails?.length || 0) !== 1 ? 's' : ''} sent
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No pharmacy selected</p>
              <p className="text-xs text-muted-foreground">Pharmacy can be assigned later</p>
            </div>
          )}
        </div>

        {/* Treatment Goals */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center",
              treatment.goals && treatment.goals.length > 0 
                ? "bg-primary/10" 
                : "bg-muted/20"
            )}>
              <Target className={cn(
                "h-3.5 w-3.5",
                treatment.goals && treatment.goals.length > 0 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Treatment Goals</span>
          </div>
          {treatment.goals && treatment.goals.length > 0 ? (
            <div className="space-y-2">
              {treatment.goals.slice(0, 2).map((goal: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                </div>
              ))}
              {treatment.goals.length > 2 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  <p className="text-xs text-muted-foreground">
                    +{treatment.goals.length - 2} more goal{treatment.goals.length - 2 !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No goals set</p>
              <p className="text-xs text-muted-foreground">Treatment goals can be added</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TreatmentDetailsHeader.displayName = "TreatmentDetailsHeader";