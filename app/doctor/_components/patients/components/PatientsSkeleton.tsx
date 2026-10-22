import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PatientsSkeletonProps } from "../types";

/**
 * PatientsSkeleton Component
 * 
 * Loading skeleton for the patients page
 * Matches the layout structure of the actual patients page
 */
export const PatientsSkeleton = React.memo<PatientsSkeletonProps>(({
  showHeader = true,
  showFilters = true,
  showStats = false,
  patientCount = 5,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      {showHeader && (
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
      )}

      {/* Search Bar Skeleton */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      )}

      {/* Stats Skeleton */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 bg-background">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      )}

      {/* Patients List Skeleton */}
      <div className="border border-border rounded-xl bg-background">
        <div className="divide-y divide-border">
          {Array.from({ length: patientCount }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-12 w-12 rounded-full" />

                  {/* Patient Info Skeleton */}
                  <div className="space-y-2 flex-1">
                    {/* Name and Badge */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <Skeleton className="h-6 w-full rounded-md" />
                      <Skeleton className="h-6 w-full rounded-md" />
                      <Skeleton className="h-6 w-full rounded-md" />
                      <Skeleton className="h-6 w-full rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

PatientsSkeleton.displayName = "PatientsSkeleton";
