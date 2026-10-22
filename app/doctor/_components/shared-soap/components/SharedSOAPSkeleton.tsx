import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * SharedSOAPSkeleton Component
 * 
 * Provides loading skeleton for the shared SOAP notes page
 * Matches the layout structure of the actual content
 */
export const SharedSOAPSkeleton = React.memo(() => {
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Modern Header Skeleton */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Input */}
          <Skeleton className="h-10 w-full" />

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-wrap gap-2 flex-1">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>

          {/* Active Filters Summary */}
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </Card>

      {/* Notes List Skeleton */}
      <div className="flex-1 min-h-0">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />

                  {/* Content Skeleton */}
                  <div className="flex-1 space-y-2">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-8" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>

                    {/* SOAP Preview */}
                    <div className="space-y-2">
                      {/* Chief Complaint */}
                      <div className="p-2 bg-muted/30 border border-border rounded-lg">
                        <Skeleton className="h-3 w-20 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>

                      {/* SOAP Preview Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/30 border border-border rounded-lg">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <div className="p-2 bg-muted/30 border border-border rounded-lg">
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>

                      {/* Safety & Quality Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/30 border border-border rounded-lg">
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="p-2 bg-muted/30 border border-border rounded-lg">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-7 w-20" />
                      </div>
                      <Skeleton className="h-7 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});

SharedSOAPSkeleton.displayName = "SharedSOAPSkeleton";
