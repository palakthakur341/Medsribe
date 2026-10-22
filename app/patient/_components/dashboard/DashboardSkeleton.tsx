"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DashboardSkeletonProps {
  showHeader?: boolean;
  showFeatureCards?: boolean;
  showQuickActions?: boolean;
  showAppointments?: boolean;
  showTreatments?: boolean;
  className?: string;
}

export function DashboardSkeleton({
  showHeader = true,
  showFeatureCards = true,
  showQuickActions = true,
  showAppointments = true,
  showTreatments = true,
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {/* Main Features Layout Skeleton */}
      {showFeatureCards && (
        <div className="flex-shrink-0 grid gap-4 lg:grid-cols-4">
          {/* SOAP Generation - 2 columns */}
          <div className="lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* AI Assistant - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* Order Medication - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Additional Actions & Weather Tips Skeleton */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Treatment Section Skeleton */}
        {showTreatments && (
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Skeleton */}
        {showQuickActions && (
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <Skeleton className="h-6 w-28" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Appointments Skeleton */}
        {showAppointments && (
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <Skeleton className="h-6 w-36" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
