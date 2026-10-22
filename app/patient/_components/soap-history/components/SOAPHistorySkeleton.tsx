"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SOAPHistorySkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for SOAP History page
 * Matches the actual layout structure for smooth loading experience
 */
export const SOAPHistorySkeleton = React.memo<SOAPHistorySkeletonProps>(({ 
  className 
}) => {
  return (
    <div className={cn("h-full flex flex-col space-y-4", className)}>
      {/* Header Skeleton */}
      <div className="flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
      </div>



      {/* SOAP Notes Grid Skeleton */}
      <div className="flex-1 min-h-0">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-3">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-2">
                    {/* Chief Complaint/Primary Diagnosis */}
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

                  {/* Processing Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-16" />
                      </div>
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

SOAPHistorySkeleton.displayName = "SOAPHistorySkeleton";
