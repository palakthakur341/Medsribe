"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TreatmentPlan {
  _id: string;
  title: string;
  diagnosis: string;
  plan: string;
  goals?: string[];
  status: "active" | "completed" | "discontinued";
  startDate: string;
  endDate?: string;
  createdAt: number;
  updatedAt: number;
  medicationDetails?: any[];
  pharmacy?: any;
  doctor?: any;
  patient?: any;
}

export interface TreatmentViewerConfig {
  showBackButton?: boolean;
  showActions?: boolean;
  showPatientInfo?: boolean;
  showDoctorInfo?: boolean;
  showMetadata?: boolean;
  allowPrint?: boolean;
  allowDownload?: boolean;
  backButtonText?: string;
  documentTitle?: string;
}

export interface TreatmentViewerActions {
  onBack?: () => void;
  onDownload?: (treatment: TreatmentPlan) => void;
  onPrint?: (treatment: TreatmentPlan) => void;
}

export interface TreatmentViewerProps {
  treatment?: TreatmentPlan | null;
  treatmentId?: Id<"treatmentPlans"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: TreatmentViewerConfig;
  actions?: TreatmentViewerActions;
  className?: string;
}

export interface UseTreatmentViewerReturn {
  selectedTreatment: TreatmentPlan | null;
  isOpen: boolean;
  openViewer: (treatment: TreatmentPlan) => void;
  closeViewer: () => void;
  setOpen: (open: boolean) => void;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: TreatmentViewerConfig = {
  showBackButton: true,
  showActions: true,
  showPatientInfo: true,
  showDoctorInfo: true,
  showMetadata: true,
  allowPrint: true,
  allowDownload: true,
  backButtonText: "Back",
  documentTitle: "Treatment Plan"
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const TreatmentUtils = {
  getStatusColor: (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
      case "discontinued":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  },

  getStatusIcon: (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "discontinued":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  },

  formatDate: (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatShortDate: (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

// ============================================================================
// MAIN COMPONENT - EXACT SOAP VIEWER STYLE
// ============================================================================

export const TreatmentViewer = React.memo<TreatmentViewerProps>(({
  treatment: propTreatment,
  treatmentId,
  open,
  onOpenChange,
  config = {},
  actions = {},
  className,
}) => {
  // Fetch detailed treatment data if treatmentId is provided
  const fetchedTreatment = useQuery(
    api.treatmentPlans.getWithDetailsById,
    treatmentId ? { id: treatmentId } : "skip"
  );

  // Fetch prescription orders for this treatment plan
  const prescriptionOrders = useQuery(
    api.prescriptionOrders.getOrdersByTreatmentPlanId,
    treatmentId ? { treatmentPlanId: treatmentId } : "skip"
  );

  // Use fetched treatment if available, otherwise use prop treatment
  const treatment = fetchedTreatment || propTreatment;

  // Merge with default config
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);



  // If not open or no treatment, don't render anything
  if (!open || !treatment) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        "animate-in fade-in-0 duration-300",
        "bg-background",
        className
      )}
      aria-describedby="treatment-plan-document"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={() => onOpenChange(false)}
      />

      {/* Header */}
      {(finalConfig.showBackButton || finalConfig.showActions) && (
        <div className="flex-shrink-0 border-b bg-card px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <div className="flex-shrink-0">
              {finalConfig.showBackButton && actions.onBack && (
                <Button
                  variant="ghost"
                  onClick={actions.onBack}
                  className="flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{finalConfig.backButtonText}</span>
                </Button>
              )}
            </div>

            {/* Title */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {finalConfig.documentTitle}
                </h2>
              </div>
            </div>

            {/* Actions */}
            {finalConfig.showActions && (
              <div className="flex items-center gap-1 sm:gap-2">
                {finalConfig.allowPrint && (
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 h-9 px-2 sm:px-3">
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                )}
                {finalConfig.allowDownload && (
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 h-9 px-2 sm:px-3">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document content area - EXACT SOAP VIEWER STYLE */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-card shadow-2xl mx-auto my-8 border border-border rounded-lg overflow-hidden">
              {/* Professional Document Header - EXACT SOAP STYLE */}
              <div className="bg-muted/30 border-b border-border">
                <div className="p-6 md:p-8">
                  {/* Application Branding */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
                        <Stethoscope className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">MedScribe</span>
                        <span className="text-xs text-muted-foreground font-medium">v2.0 Clinical Platform</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        HIPAA Compliant
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        ID: {treatment._id.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                      {finalConfig.documentTitle}
                    </h1>

                    {/* Patient information for doctor views */}
                    {finalConfig.showPatientInfo && treatment.patient && (
                      <div className="mb-4">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          <FileText className="h-3 w-3 mr-2" />
                          Patient: {treatment.patient.firstName} {treatment.patient.lastName}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Generated on {TreatmentUtils.formatDate(treatment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", TreatmentUtils.getStatusColor(treatment.status))}
                        >
                          {TreatmentUtils.getStatusIcon(treatment.status)}
                          <span className="ml-1">{treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content - EXACT SOAP STYLE */}
              <div className="p-6 md:p-8 bg-card">
                {/* Enhanced Treatment content sections with professional typography */}
                <div className="space-y-8">
                  {/* Document Overview */}
                  <div className="space-y-3">
                    {/* Treatment Status Indicator */}
                    <div className="p-3 bg-muted/30 border border-border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Treatment Status
                      </h4>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="text-foreground">
                          <span className="font-medium">Status:</span> {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                        </div>
                        <div className="text-foreground">
                          <span className="font-medium">Start Date:</span> {TreatmentUtils.formatDate(treatment.startDate)}
                        </div>
                        {treatment.endDate && (
                          <div className="text-foreground">
                            <span className="font-medium">End Date:</span> {TreatmentUtils.formatDate(treatment.endDate)}
                          </div>
                        )}
                        {finalConfig.showDoctorInfo && treatment.doctor && (
                          <div className="text-foreground">
                            <span className="font-medium">Prescribing Doctor:</span> Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Diagnosis Section - EXACT SOAP STYLE */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Primary Diagnosis
                    </h2>
                    <div className="p-3 bg-muted/30 border border-border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2 text-sm">Clinical Diagnosis</h4>
                      <p className="text-foreground text-xs leading-relaxed">{treatment.diagnosis}</p>
                    </div>
                  </div>

                  {/* Treatment Plan Section - EXACT SOAP STYLE */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Treatment Plan
                    </h2>
                    <div className="p-3 bg-muted/30 border border-border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2 text-sm">Therapeutic Approach</h4>
                      <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{treatment.plan}</p>
                    </div>
                  </div>

                  {/* Treatment Goals Section - EXACT SOAP STYLE */}
                  {treatment.goals && treatment.goals.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Treatment Goals
                      </h2>
                      <div className="space-y-3">
                        {treatment.goals.map((goal, index) => (
                          <div key={index} className="p-3 bg-muted/30 border border-border rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2 text-sm">Goal {index + 1}</h4>
                            <p className="text-foreground text-xs leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medications Section - EXACT SOAP STYLE */}
                  {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Prescribed Medications
                      </h2>
                      <div className="space-y-3">
                        {treatment.medicationDetails.map((medication: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/30 border border-border rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2 text-sm">{medication.name}</h4>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              {medication.genericName && (
                                <div className="text-foreground">
                                  <span className="font-medium">Generic Name:</span> {medication.genericName}
                                </div>
                              )}
                              <div className="text-foreground">
                                <span className="font-medium">Strength:</span> {medication.strength}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Dosage Form:</span> {medication.dosageForm}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Quantity:</span> {medication.quantity}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Frequency:</span> {medication.frequency}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Refills:</span> {medication.refills}
                              </div>
                              {medication.duration && (
                                <div className="text-foreground">
                                  <span className="font-medium">Duration:</span> {medication.duration}
                                </div>
                              )}
                              <div className="text-foreground">
                                <span className="font-medium">Instructions:</span> {medication.instructions}
                              </div>
                              {medication.ndc && (
                                <div className="text-foreground">
                                  <span className="font-medium">NDC:</span> {medication.ndc}
                                </div>
                              )}
                              {medication.rxcui && (
                                <div className="text-foreground">
                                  <span className="font-medium">RxCUI:</span> {medication.rxcui}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescription Orders Section - EXACT SOAP STYLE */}
                  {prescriptionOrders && prescriptionOrders.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Prescription Orders
                      </h2>
                      <div className="space-y-3">
                        {prescriptionOrders.map((order: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/30 border border-border rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2 text-sm">Order #{order.orderNumber || order._id.slice(-8)}</h4>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              <div className="text-foreground">
                                <span className="font-medium">Medication:</span> {order.medicationDetails?.name || 'Medication Order'}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Status:</span> {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                              </div>
                              {order.medicationDetails?.quantity && (
                                <div className="text-foreground">
                                  <span className="font-medium">Quantity:</span> {order.medicationDetails.quantity}
                                </div>
                              )}
                              {order.pharmacy && (
                                <div className="text-foreground">
                                  <span className="font-medium">Pharmacy:</span> {order.pharmacy.name}
                                </div>
                              )}
                              <div className="text-foreground">
                                <span className="font-medium">Delivery Method:</span> {order.deliveryMethod || 'pickup'}
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">Order Date:</span> {new Date(order.createdAt || order._creationTime).toLocaleDateString()}
                              </div>
                              {order.estimatedReadyTime && (
                                <div className="text-foreground">
                                  <span className="font-medium">Estimated Ready:</span> {new Date(order.estimatedReadyTime).toLocaleDateString()}
                                </div>
                              )}
                              {order.pharmacyNotes && (
                                <div className="text-foreground">
                                  <span className="font-medium">Pharmacy Notes:</span> {order.pharmacyNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Information Section - EXACT SOAP STYLE */}
                  {finalConfig.showDoctorInfo && treatment.doctor && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Prescribing Doctor
                      </h2>
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Doctor Information</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="text-foreground">
                            <span className="font-medium">Name:</span> Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                          </div>
                          {treatment.doctor.primarySpecialty && (
                            <div className="text-foreground">
                              <span className="font-medium">Specialty:</span> {treatment.doctor.primarySpecialty}
                            </div>
                          )}
                          {treatment.doctor.licenseNumber && (
                            <div className="text-foreground">
                              <span className="font-medium">License Number:</span> {treatment.doctor.licenseNumber}
                            </div>
                          )}
                          {treatment.doctor.email && (
                            <div className="text-foreground">
                              <span className="font-medium">Email:</span> {treatment.doctor.email}
                            </div>
                          )}
                          {treatment.doctor.phone && (
                            <div className="text-foreground">
                              <span className="font-medium">Phone:</span> {treatment.doctor.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient Information Section - EXACT SOAP STYLE */}
                  {finalConfig.showPatientInfo && treatment.patient && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Patient Information
                      </h2>
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Patient Details</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="text-foreground">
                            <span className="font-medium">Name:</span> {treatment.patient.firstName} {treatment.patient.lastName}
                          </div>
                          {treatment.patient.dateOfBirth && (
                            <div className="text-foreground">
                              <span className="font-medium">Date of Birth:</span> {new Date(treatment.patient.dateOfBirth).toLocaleDateString()}
                            </div>
                          )}
                          {treatment.patient.gender && (
                            <div className="text-foreground">
                              <span className="font-medium">Gender:</span> {treatment.patient.gender.charAt(0).toUpperCase() + treatment.patient.gender.slice(1)}
                            </div>
                          )}
                          {treatment.patient.email && (
                            <div className="text-foreground">
                              <span className="font-medium">Email:</span> {treatment.patient.email}
                            </div>
                          )}
                          {treatment.patient.primaryPhone && (
                            <div className="text-foreground">
                              <span className="font-medium">Phone:</span> {treatment.patient.primaryPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Footer - EXACT SOAP STYLE */}
                  {finalConfig.showMetadata && (
                    <div className="space-y-3 pt-8 border-t border-border">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                        Document Information
                      </h2>
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Compliance & Metadata</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="text-foreground">
                            <span className="font-medium">Document ID:</span> {treatment._id.slice(-8)}
                          </div>
                          <div className="text-foreground">
                            <span className="font-medium">Generated:</span> {TreatmentUtils.formatDate(treatment.createdAt)}
                          </div>
                          <div className="text-foreground">
                            <span className="font-medium">Last Updated:</span> {TreatmentUtils.formatDate(treatment.updatedAt)}
                          </div>
                          <div className="text-foreground">
                            <span className="font-medium">Platform:</span> MedScribe v2.0 Clinical Platform
                          </div>
                          <div className="text-foreground">
                            <span className="font-medium">Compliance:</span> HIPAA, SOC 2 Type II, ISO 27001, GDPR
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Professional Footer - EXACT SOAP STYLE */}
                {finalConfig.showMetadata && (
                  <div className="mt-8 pt-6 border-t border-border text-center">
                    <div className="flex justify-center gap-2 flex-wrap mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        HIPAA Compliant
                      </Badge>
                      <Badge variant="outline" className="text-xs">SOC 2 Type II</Badge>
                      <Badge variant="outline" className="text-xs">ISO 27001</Badge>
                      <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This document was generated automatically by MedScribe AI Clinical Platform
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      © {new Date().getFullYear()} MedScribe. All rights reserved.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

TreatmentViewer.displayName = "TreatmentViewer";

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useTreatmentViewer(): UseTreatmentViewerReturn {
  const [selectedTreatment, setSelectedTreatment] = React.useState<TreatmentPlan | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openViewer = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatment(treatment);
    setIsOpen(true);
  }, []);

  const closeViewer = React.useCallback(() => {
    setIsOpen(false);
    setSelectedTreatment(null);
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      closeViewer();
    }
  }, [closeViewer]);

  return {
    selectedTreatment,
    isOpen,
    openViewer,
    closeViewer,
    setOpen,
  };
}