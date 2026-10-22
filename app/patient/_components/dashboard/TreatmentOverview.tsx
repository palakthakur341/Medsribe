"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
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
  Pill,
  Calendar,
  ChevronDown,
  Info
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TreatmentOverviewProps {
  patientId: string;
  gradient?: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    itemBg: string;
    itemBorder: string;
  };
  className?: string;
}

export const TreatmentOverview = React.memo<TreatmentOverviewProps>(({ 
  patientId, 
  gradient, 
  className = "" 
}) => {
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  const toggleTreatmentExpansion = (treatmentId: string) => {
    setExpandedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const activeTreatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId: patientId as any }
  );

  const activePrescriptions = useQuery(
    api.prescriptions.getByPatientId,
    { patientId: patientId as any }
  );

  // Group prescriptions by treatment plan
  const prescriptionsByTreatment = new Map();
  const standalonePrescriptions: any[] = [];

  if (activePrescriptions) {
    activePrescriptions.forEach((prescription: any) => {
      if (prescription.treatmentPlanId) {
        if (!prescriptionsByTreatment.has(prescription.treatmentPlanId)) {
          prescriptionsByTreatment.set(prescription.treatmentPlanId, []);
        }
        prescriptionsByTreatment.get(prescription.treatmentPlanId).push(prescription);
      } else {
        standalonePrescriptions.push(prescription);
      }
    });
  }

  const isLoading = activeTreatments === undefined || activePrescriptions === undefined;

  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-7 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasActiveTreatments = activeTreatments && activeTreatments.length > 0;
  const hasStandalonePrescriptions = standalonePrescriptions.length > 0;
  const hasAnyActive = hasActiveTreatments || hasStandalonePrescriptions;

  // Filter treatments that have prescriptions or are active
  const activeFilteredTreatments = activeTreatments?.filter((treatment: any) =>
    treatment.status === 'active' || prescriptionsByTreatment.has(treatment._id)
  ) || [];

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Active Treatments</h3>
              <p className="text-xs text-muted-foreground">Your current treatment plans</p>
            </div>
          </div>
          <Link href="/patient/treatments">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-3 text-xs",
                gradient && `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                gradient && `hover:bg-black/5 dark:hover:bg-white/5`
              )}
            >
              <Activity className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {!hasAnyActive ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mx-auto">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No Active Treatments</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  You don't have any active treatments at the moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {hasActiveTreatments && activeFilteredTreatments.map((treatment) => {
                const treatmentPrescriptions = prescriptionsByTreatment.get(treatment._id) || [];

                return (
                  <div
                    key={treatment._id}
                    className="p-4 hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            gradient?.textColor || "text-foreground"
                          )}>
                            {treatment.title}
                          </h4>
                          <p className={cn(
                            "text-xs mt-1 line-clamp-2",
                            gradient?.textColor || "text-muted-foreground"
                          )}>
                            {treatment.plan}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs flex-shrink-0",
                            gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : ""
                          )}
                        >
                          {treatment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className={cn(
                            "h-3 w-3",
                            gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            gradient?.textColor || "text-muted-foreground"
                          )}>
                            {new Date(treatment.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {treatment.endDate && (
                          <>
                            <span className={cn(
                              gradient?.textColor || "text-muted-foreground"
                            )}>-</span>
                            <span className={cn(
                              gradient?.textColor || "text-muted-foreground"
                            )}>
                              {new Date(treatment.endDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {treatmentPrescriptions.length > 0 && (
                        <div className="border-t border-border/50 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Pill className={cn(
                                "h-3 w-3",
                                gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-primary"
                              )} />
                              <span className={cn(
                                "text-xs font-medium",
                                gradient?.textColor || "text-muted-foreground"
                              )}>
                                Prescriptions ({treatmentPrescriptions.length})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTreatmentExpansion(treatment._id)}
                              className={cn(
                                "h-6 px-2 text-xs",
                                gradient?.textColor || "text-muted-foreground",
                                "hover:bg-black/5 dark:hover:bg-white/5"
                              )}
                            >
                              {expandedTreatments.has(treatment._id) ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1 rotate-180 transition-transform" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1 transition-transform" />
                                  Show
                                </>
                              )}
                            </Button>
                          </div>
                          {expandedTreatments.has(treatment._id) && (
                            <div className="space-y-2">
                              {treatmentPrescriptions.map((prescription: any, index: number) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : "bg-muted/30 border-border/30"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className={cn(
                                        "font-medium text-xs truncate",
                                        gradient?.textColor || "text-foreground"
                                      )}>
                                        {prescription.medicationName}
                                      </div>
                                      <div className={cn(
                                        "text-xs mt-1 space-y-0.5",
                                        gradient?.textColor || "text-muted-foreground"
                                      )}>
                                        <div>Dosage: {prescription.dosage}</div>
                                        <div>Frequency: {prescription.frequency}</div>
                                        {prescription.instructions && (
                                          <div>Instructions: {prescription.instructions}</div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs h-4 flex-shrink-0",
                                        gradient && `border-${gradient.border.replace('border-', '').replace('200', '300')} ${gradient.textColor}`
                                      )}
                                    >
                                      Active
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!hasActiveTreatments && hasStandalonePrescriptions && (
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className={cn(
                          "h-4 w-4",
                          gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-primary"
                        )} />
                        <h3 className={cn(
                          "font-medium text-sm",
                          gradient?.textColor || "text-foreground"
                        )}>
                          Current Medications
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              gradient?.textColor || "text-muted-foreground",
                              "hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            <Info className="h-3 w-3 mr-1" />
                            View All ({standalonePrescriptions.length})
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {standalonePrescriptions.map((prescription) => (
                            <DropdownMenuItem key={prescription._id} className="flex-col items-start p-3">
                              <div className="font-medium text-sm">{prescription.medicationName}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <div>Dosage: {prescription.dosage}</div>
                                <div>Frequency: {prescription.frequency}</div>
                                {prescription.instructions && (
                                  <div className="mt-1">Instructions: {prescription.instructions}</div>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg border text-center",
                      gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : "border-border/50 bg-muted/30"
                    )}>
                      <p className={cn(
                        "text-xs",
                        gradient?.textColor || "text-muted-foreground"
                      )}>
                        {standalonePrescriptions.length} active prescription{standalonePrescriptions.length > 1 ? 's' : ''} • Click "View All" for details
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

TreatmentOverview.displayName = "TreatmentOverview";