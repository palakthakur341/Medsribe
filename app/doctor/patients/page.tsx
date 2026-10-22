"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorAuth,
  useDoctorPatients,
  PatientsList,
  PatientFilters,
  AddPatientDialog,
} from "@/app/doctor/_components/patients";

// Individual skeleton components
const PatientFiltersSkeletonComponent = () => (
  <div className="flex items-center gap-4">
    <div className="relative flex-1">
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
    <Skeleton className="h-10 w-28 rounded-lg" />
  </div>
);

const PatientsListSkeletonComponent = () => (
  <div className="h-full border border-border rounded-xl flex flex-col bg-background">
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Doctor Patients Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 * - Individual skeleton loading states
 */
const DoctorPatientsPage = React.memo(() => {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile
  } = useDoctorAuth();

  const {
    filteredPatients,
    isLoading: patientsLoading,
    searchTerm,
    setSearchTerm,
  } = useDoctorPatients(doctorProfile);

  // Memoized handlers for performance - MUST be called before any conditional returns
  const handleAddPatient = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  const handlePatientAction = useCallback((action: string, patientId: any) => {
    if (action === "view") {
      router.push(`/doctor/patients/${patientId}`);
    }
    // Additional handling if needed
    console.log(`Patient ${action}:`, patientId);
  }, [router]);

  const handleAddPatientSuccess = useCallback(() => {
    // Optionally refresh the patients list or show a success message
    console.log("Patient added successfully!");
  }, []);

  // Redirect if not authenticated (handled by useDoctorAuth)
  if (authLoading || !isAuthenticated || !isDoctor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          My Patients
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage and view all patients under your care
        </p>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        {patientsLoading ? (
          <PatientFiltersSkeletonComponent />
        ) : (
          <PatientFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPatient={handleAddPatient}
          />
        )}
      </div>

      {/* Patients List - Takes remaining height */}
      <div className="flex-1 min-h-0">
        {patientsLoading ? (
          <PatientsListSkeletonComponent />
        ) : (
          <PatientsList
            patients={filteredPatients}
            isLoading={false}
            emptyMessage={
              searchTerm
                ? "No patients match your search criteria."
                : "You don't have any assigned patients yet."
            }
            onPatientAction={handlePatientAction}
          />
        )}
      </div>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddPatientSuccess}
      />
    </div>
  );
});

DoctorPatientsPage.displayName = "DoctorPatientsPage";

export default DoctorPatientsPage;
