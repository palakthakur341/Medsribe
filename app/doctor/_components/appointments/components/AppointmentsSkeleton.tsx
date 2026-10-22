import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { AppointmentsSkeletonProps } from "../types";

/**
 * AppointmentsSkeleton Component
 * 
 * Loading skeleton for the appointments page
 * Matches the layout structure of the actual appointments page
 */
export const AppointmentsSkeleton = React.memo<AppointmentsSkeletonProps>(({
  showHeader = true,
  showFilters = true,
  showStats = false,
  appointmentCount = 4,
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

        {/* Search and Filters Skeleton */}
        {showFilters && (
          <>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            {/* Category Tabs Skeleton */}
            <div className="flex items-center gap-1 border-b">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
          </>
        )}

        {/* Stats Skeleton */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        )}

        {/* Appointments List Skeleton */}
        <div className="border rounded-xl">
          <div className="divide-y">
            {Array.from({ length: appointmentCount }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Time and Date Skeleton */}
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {/* Patient Info Skeleton */}
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>

                    {/* Appointment Details Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions Skeleton */}
                  <div className="flex flex-col items-end gap-3">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
});

AppointmentsSkeleton.displayName = "AppointmentsSkeleton";
