import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PatientDetailSkeleton Component
 * 
 * Loading skeleton for the patient detail page
 * Matches the layout structure of the actual components
 */
export const PatientDetailSkeleton = React.memo(() => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-px h-6" />
              <div className="text-right">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col lg:flex-row gap-4">
          {/* Treatment List Skeleton */}
          <div className="flex flex-col min-h-0 lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-3">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Skeleton className="h-4 w-32 flex-1" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Details Skeleton */}
          <div className="flex-1 min-h-0 order-1 lg:order-2">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-4">
                <div className="space-y-5">
                  {/* Treatment Plan and Goals Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <Skeleton className="w-2 h-2 rounded-full mt-2" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medications Skeleton */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-7 w-16 ml-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-3 w-full mb-2" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* E-Prescribing Skeleton */}
                  <div className="border border-border rounded-xl p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-28" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

PatientDetailSkeleton.displayName = "PatientDetailSkeleton";
