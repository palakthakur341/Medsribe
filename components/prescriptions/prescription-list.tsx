"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Pill,
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Search,
  Filter
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PrescriptionListProps {
  patientId: Id<"patients">;
  className?: string;
}

export function PrescriptionList({ patientId, className }: PrescriptionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "filled" | "cancelled">("all");

  const prescriptions = useQuery(api.prescriptions.getByPatientId, { patientId });

  // Filter prescriptions based on search term and filter
  const filteredPrescriptions = useMemo(() => {
    if (!prescriptions) return [];

    let filtered = [...prescriptions];

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(prescription => prescription.status === selectedFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(prescription => {
        return (
          (prescription.medication.name?.toLowerCase().includes(search)) ||
          (prescription.medication.genericName?.toLowerCase().includes(search)) ||
          (prescription.dosage.instructions?.toLowerCase().includes(search))
        );
      });
    }

    return filtered;
  }, [prescriptions, searchTerm, selectedFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "received":
        return <CheckCircle className="h-4 w-4" />;
      case "filled":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          className: "bg-muted text-muted-foreground border-border",
          label: "Pending"
        };
      case "sent":
        return {
          icon: <Send className="h-4 w-4" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Sent"
        };
      case "received":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Received"
        };
      case "filled":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Filled"
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Cancelled"
        };
      case "error":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Error"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          className: "bg-muted text-muted-foreground border-border",
          label: "Unknown"
        };
    }
  };

  const handleSendPrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch("/api/prescriptions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Prescription sent successfully!");
      } else {
        toast.error(result.message || "Failed to send prescription");
      }
    } catch (error) {
      console.error("Send prescription error:", error);
      toast.error("Failed to send prescription");
    }
  };

  // Loading state
  if (!prescriptions) {
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        {/* Loading Skeleton */}
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border bg-muted/20 flex-shrink-0">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex-1 min-h-0 p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
          <div className="relative px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Medications
              </h3>
              <p className="text-xs text-muted-foreground">
                Prescriptions and medications
              </p>
            </div>
            <Badge variant="secondary">
              {filteredPrescriptions.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-border bg-muted/20 flex-shrink-0">
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", icon: <Pill className="h-4 w-4" /> },
              { key: "pending", label: "Pending", icon: <Clock className="h-4 w-4" /> },
              { key: "filled", label: "Filled", icon: <CheckCircle className="h-4 w-4" /> },
              { key: "cancelled", label: "Cancelled", icon: <XCircle className="h-4 w-4" /> }
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={selectedFilter === filter.key ? "default" : "ghost"}
                className="px-3"
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {filteredPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Pill className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-base mb-2 text-foreground">
                  {searchTerm ? "No matching medications" : "No medications found"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No prescriptions have been created yet"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => {
                  const statusConfig = getStatusConfig(prescription.status);

                  return (
                    <div key={prescription._id} className="p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
                      {/* Prescription Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                            {prescription.medication.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <span className="bg-muted/50 px-2 py-0.5 rounded">
                              {prescription.medication.strength}
                            </span>
                            <span className="bg-muted/50 px-2 py-0.5 rounded">
                              {prescription.medication.dosageForm}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("px-2 flex items-center gap-1", statusConfig.className)}
                        >
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </div>

                      {/* Instructions */}
                      {prescription.dosage.instructions && (
                        <div className="mb-3 p-3 bg-muted/30 rounded text-sm text-foreground">
                          <p className="line-clamp-2">{prescription.dosage.instructions}</p>
                        </div>
                      )}

                      {/* Footer with Dosage and Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          <span className="bg-muted/50 px-2 py-0.5 rounded">{prescription.dosage.quantity}</span>
                          <span className="bg-muted/50 px-2 py-0.5 rounded">{prescription.dosage.frequency}</span>
                        </div>
                        {prescription.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendPrescription(prescription._id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
