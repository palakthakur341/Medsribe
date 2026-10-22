"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddTreatmentForm } from "@/app/doctor/_components/patient-detail/components/AddTreatmentForm";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { Activity, Pill, Calendar } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useTreatmentViewer, TreatmentViewer, type TreatmentPlan } from "@/components/ui/treatment-viewer";
import ErrorBoundary from "@/components/error/error-boundary";
import {
  usePatientDetail,
  useTreatmentManagement,
  PatientHeader,
  PatientChat,
  type ActiveView,
} from "@/app/doctor/_components/patient-detail";
import { TreatmentList, TreatmentDetails } from "@/app/doctor/_components/patient-detail";
import { SlotBasedAppointmentForm } from "@/app/doctor/_components/patient-detail/components/SlotBasedAppointmentForm";
import { PatientSOAPHistory } from "@/app/doctor/_components/patient-detail/components/PatientSOAPHistory";

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Patient Detail Page - Refactored with UI standards
 * 
 * Features:
 * - Consistent UI styling following AppointmentsList standards
 * - Performance optimized with React.memo and useCallback
 * - Proper loading states and empty states
 * - Comprehensive error handling
 * - Accessibility support
 */
const PatientDetailPage = React.memo<PatientDetailPageProps>(({ params }) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [showChat, setShowChat] = useState(false);
  const [showSOAPHistory, setShowSOAPHistory] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    patient,
    doctorProfile,
    currentDoctorPatient,
    isLoading: patientLoading,
    error: patientError,
  } = usePatientDetail(params);

  // Redirect if invalid patient ID
  useEffect(() => {
    if (patientError === "Invalid patient ID") {
      router.replace("/doctor/patients");
    }
  }, [patientError, router]);

  const {
    selectedTreatmentId,
    setSelectedTreatmentId,
    handleTreatmentStatusUpdate,
  } = useTreatmentManagement(patient?._id || null);

  // TreatmentViewer state management
  const treatmentViewer = useTreatmentViewer();

  // Fetch detailed treatment data for viewer
  const selectedTreatmentDetails = useQuery(
    api.treatmentPlans.getWithDetailsById,
    selectedTreatmentId ? { id: selectedTreatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Memoized handlers with mutual exclusivity
  const handleChatToggle = useCallback(() => {
    setShowChat(prev => {
      const newShowChat = !prev;
      if (newShowChat) {
        setShowSOAPHistory(false);
      }
      return newShowChat;
    });
  }, []);

  const handleSOAPHistoryToggle = useCallback(() => {
    setShowSOAPHistory(prev => {
      const newShowSOAPHistory = !prev;
      if (newShowSOAPHistory) {
        setShowChat(false);
      }
      return newShowSOAPHistory;
    });
  }, []);

  const handleAppointmentClick = useCallback(() => {
    setActiveView("appointment-form");
  }, []);

  const handleAddTreatment = useCallback(() => {
    setActiveView("treatment-form");
  }, []);

  const handleBackToOverview = useCallback(() => {
    setActiveView("overview");
  }, []);

  const handleViewTreatment = useCallback(() => {
    if (selectedTreatmentId && selectedTreatmentDetails) {
      treatmentViewer.openViewer(selectedTreatmentDetails);
    }
  }, [selectedTreatmentId, selectedTreatmentDetails, treatmentViewer]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = ({ icon: Icon, title, description, actionText, onAction }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <div className="border rounded-xl flex items-center justify-center p-6 h-full">
      <div className="text-center space-y-4">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {actionText && onAction && (
          <Button variant="outline" size="sm" className="rounded-lg" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Patient Header */}
      <PatientHeader
        patient={patient}
        onChatToggle={handleChatToggle}
        onAppointmentClick={handleAppointmentClick}
        onAddTreatment={handleAddTreatment}
        onSOAPHistoryToggle={handleSOAPHistoryToggle}
        showChat={showChat}
        showSOAPHistory={showSOAPHistory}
        isLoading={patientLoading || !patient || !doctorProfile || !currentDoctorPatient}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {activeView === "treatment-form" ? (
          <div className="h-full border rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Activity className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Add Treatment</h3>
                    <p className="text-xs text-muted-foreground">
                      Create a new treatment plan for the patient
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-6">
                <AddTreatmentForm
                  patientId={patient?._id || ""}
                  onSuccess={handleBackToOverview}
                  onCancel={handleBackToOverview}
                />
              </div>
            </ScrollArea>
          </div>
        ) : activeView === "prescription-form" ? (
          <div className="h-full border rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Pill className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Add Prescription</h3>
                    <p className="text-xs text-muted-foreground">
                      Create a new prescription for the patient
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-6">
                {patient ? (
                  <PrescriptionForm
                    patientId={patient._id}
                    treatmentPlanId={selectedTreatmentId as any}
                    onSuccess={handleBackToOverview}
                    onCancel={handleBackToOverview}
                  />
                ) : (
                  <LoadingSkeleton />
                )}
              </div>
            </ScrollArea>
          </div>
        ) : activeView === "appointment-form" ? (
          <div className="h-full border rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                    <Calendar className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Schedule Appointment</h3>
                    <p className="text-xs text-muted-foreground">
                      Book a new appointment with the patient
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-6">
                {patient && currentDoctorPatient && doctorProfile ? (
                  <SlotBasedAppointmentForm
                    patientId={patient._id}
                    currentDoctorPatient={currentDoctorPatient}
                    patient={patient}
                    doctorProfile={doctorProfile}
                    onCancel={handleBackToOverview}
                    onSuccess={handleBackToOverview}
                  />
                ) : (
                  <LoadingSkeleton />
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex flex-col lg:flex-row gap-4">
            {/* Left Side: Treatment List */}
            <div className="flex flex-col min-h-0 lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
              {patient ? (
                <ErrorBoundary context="Treatment List">
                  <TreatmentList
                    patientId={patient._id}
                    selectedTreatmentId={selectedTreatmentId || undefined}
                    onSelectTreatment={setSelectedTreatmentId}
                    onViewTreatment={handleViewTreatment}
                    onStatusChange={(treatmentId: string, status: string) => {
                      handleTreatmentStatusUpdate(treatmentId, status);
                    }}
                  />
                </ErrorBoundary>
              ) : (
                <div className="border rounded-xl flex flex-col overflow-hidden">
                  <div className="flex-shrink-0 p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                        <Activity className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Treatment Plans</h3>
                        <p className="text-xs text-muted-foreground">Loading treatments...</p>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 overflow-hidden">
                    <div className="p-4">
                      <LoadingSkeleton />
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Right Side: Treatment Details, Chat, and SOAP History */}
            <div className="flex-1 min-h-0 order-1 lg:order-2">
              {showChat || showSOAPHistory ? (
                <div className={cn(
                  "h-full grid gap-4",
                  showChat && showSOAPHistory
                    ? "grid-cols-1 lg:grid-cols-3"
                    : "grid-cols-1 lg:grid-cols-2"
                )}>
                  {/* Treatment Details */}
                  <div className="flex flex-col min-h-0">
                    {patient ? (
                      selectedTreatmentId ? (
                        <ErrorBoundary context="Treatment Details">
                          <TreatmentDetails
                            treatmentId={selectedTreatmentId}
                            onView={handleViewTreatment}
                            onStatusChange={(status) => {
                              if (selectedTreatmentId) {
                                handleTreatmentStatusUpdate(selectedTreatmentId, status);
                              }
                            }}
                          />
                        </ErrorBoundary>
                      ) : (
                        <EmptyState
                          icon={Activity}
                          title="Select a Treatment"
                          description="Choose a treatment from the list to view details"
                        />
                      )
                    ) : (
                      <div className="border rounded-xl flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 overflow-hidden">
                          <div className="p-4">
                            <LoadingSkeleton />
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {/* Chat Interface */}
                  {showChat && patient && doctorProfile && (
                    <div className="h-full flex flex-col">
                      <PatientChat
                        doctorId={doctorProfile._id}
                        patientId={patient._id}
                        patientName={`${patient.firstName} ${patient.lastName}`}
                        onClose={() => setShowChat(false)}
                      />
                    </div>
                  )}

                  {/* SOAP History Interface */}
                  {showSOAPHistory && patient && doctorProfile && (
                    <div className="h-full flex flex-col">
                      <PatientSOAPHistory
                        patientId={patient._id}
                        doctorId={doctorProfile._id}
                        onClose={() => setShowSOAPHistory(false)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Full width Treatment Details */
                <div className="h-full">
                  {patient ? (
                    selectedTreatmentId ? (
                      <TreatmentDetails
                        treatmentId={selectedTreatmentId}
                        onView={handleViewTreatment}
                        onStatusChange={(status) => {
                          if (selectedTreatmentId) {
                            handleTreatmentStatusUpdate(selectedTreatmentId, status);
                          }
                        }}
                      />
                    ) : (
                      <EmptyState
                        icon={Activity}
                        title="Select a Treatment"
                        description="Choose a treatment from the list to view details and manage patient care"
                      />
                    )
                  ) : (
                    <div className="border rounded-xl flex flex-col overflow-hidden">
                      <ScrollArea className="flex-1 overflow-hidden">
                        <div className="p-4">
                          <LoadingSkeleton />
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Treatment Viewer */}
      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true,
          showDoctorInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          backButtonText: "Back to Patient",
          documentTitle: "Treatment Plan - Doctor View"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
          onDownload: (treatment: TreatmentPlan) => {
            console.log("Downloading treatment:", treatment.title);
          },
        }}
      />
    </div>
  );
});

PatientDetailPage.displayName = "PatientDetailPage";

export default PatientDetailPage;