"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  usePatientAuth,
  usePatientTreatments,
  type TreatmentFilters as TreatmentFiltersType,
  type TreatmentPlan,
} from "@/app/patient/_components/treatments";
import { TreatmentList } from "@/app/patient/_components/treatments/components/TreatmentList";
import { TreatmentDetails } from "@/app/patient/_components/treatments/components/TreatmentDetails";
import { TreatmentStats } from "@/app/patient/_components/treatments/components/TreatmentStats";
import { TreatmentFilters } from "@/app/patient/_components/treatments/components/TreatmentFilters";
import { TreatmentViewer, useTreatmentViewer } from "@/components/ui/treatment-viewer";
import { cn } from "@/lib/utils";



// Individual skeleton components
const TreatmentListSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-6 bg-muted rounded animate-pulse" />
      </div>
    </div>
    <div className="flex-1 min-h-0 p-3 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-3 space-y-2 border border-border rounded-lg bg-muted/50">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-5 w-12 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TreatmentDetailsSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
      </div>
    </div>
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="p-4 space-y-5">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2 border border-border rounded-lg bg-muted/50">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
);

const TreatmentStatsSkeleton = () => (
  <div className="flex items-center gap-3">
    <div className="text-right">
      <div className="h-8 w-8 bg-muted rounded animate-pulse mb-1" />
      <div className="h-3 w-16 bg-muted rounded animate-pulse" />
    </div>
    <div className="w-px h-8 bg-border" />
    <div className="text-right">
      <div className="h-8 w-8 bg-muted rounded animate-pulse mb-1" />
      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
    </div>
  </div>
);

const TreatmentFiltersSkeleton = () => (
  <div className="flex-shrink-0">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <div className="h-9 w-full bg-muted rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Patient Treatments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 * - Individual skeleton loading states
 */
const PatientTreatmentsPage = React.memo(() => {
  // State for selected treatment and filters
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPlan | null>(null);
  const [filters, setFilters] = useState<TreatmentFiltersType>({
    status: [],
    searchTerm: "",
  });

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    patientProfile
  } = usePatientAuth();

  const {
    treatmentsWithMedications,
    standaloneMedications,
    isLoading: treatmentsLoading,
    stats,
  } = usePatientTreatments(patientProfile?._id);

  // Treatment viewer hook
  const treatmentViewer = useTreatmentViewer();

  // Memoized authentication check
  const isAuthorized = useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );



  // Filter treatments based on current filters
  const filteredTreatments = useMemo(() => {
    return treatmentsWithMedications.filter(treatment => {
      const matchesStatus = filters.status.length === 0 || filters.status.includes(treatment.status);
      const matchesSearch = filters.searchTerm === "" ||
        treatment.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        treatment.diagnosis.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        treatment.medications?.some((med: any) =>
          med.medicationName.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
  }, [treatmentsWithMedications, filters]);

  // Auto-select first treatment if none selected
  React.useEffect(() => {
    if (filteredTreatments.length > 0 && !selectedTreatment) {
      setSelectedTreatment(filteredTreatments[0]);
    }
  }, [filteredTreatments, selectedTreatment]);

  // Memoized handlers for performance
  const handleSelectTreatment = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatment(treatment);
  }, []);

  const handleFiltersChange = React.useCallback((newFilters: TreatmentFiltersType) => {
    setFilters(newFilters);
  }, []);

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<TreatmentPlan["_id"] | null>(null);

  const handleViewTreatment = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatmentId(treatment._id);
    treatmentViewer.setOpen(true);
  }, [treatmentViewer]);

  // Authentication check
  if (authLoading || !isAuthorized) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Treatment Overview</h1>
              <p className="text-xs text-muted-foreground">View and manage your treatment plans and medications</p>
            </div>
          </div>
          {treatmentsLoading ? (
            <TreatmentStatsSkeleton />
          ) : (
            <TreatmentStats stats={stats} isLoading={treatmentsLoading} />
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {treatmentsLoading ? (
        <TreatmentFiltersSkeleton />
      ) : (
        <TreatmentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          stats={stats}
        />
      )}

      {/* Main Content Grid - Reverse Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Treatment List - Small on large screens (1/4 width) */}
        <div className="lg:col-span-1 lg:order-1 order-2 flex flex-col min-h-0">
          {treatmentsLoading ? (
            <TreatmentListSkeleton />
          ) : (
            <TreatmentList
              treatments={filteredTreatments}
              selectedTreatment={selectedTreatment}
              onSelectTreatment={handleSelectTreatment}
            />
          )}
        </div>

        {/* Treatment Details - Large on large screens (3/4 width) */}
        <div className="lg:col-span-3 lg:order-2 order-1 flex flex-col min-h-0">
          {treatmentsLoading ? (
            <TreatmentDetailsSkeleton />
          ) : (
            <TreatmentDetails
              treatment={selectedTreatment}
              standaloneMedications={standaloneMedications}
              onViewTreatment={handleViewTreatment}
            />
          )}
        </div>
      </div>

      {/* Treatment Viewer for full-screen document view */}
      <TreatmentViewer
        treatmentId={selectedTreatmentId}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: false,
          showDoctorInfo: true,
          showMetadata: false,
          allowPrint: true,
          allowDownload: true,
          backButtonText: "Back to My Treatments",
          documentTitle: "My Treatment Plan"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
        }}
      />
    </div>
  );
});

PatientTreatmentsPage.displayName = "PatientTreatmentsPage";

export default PatientTreatmentsPage;