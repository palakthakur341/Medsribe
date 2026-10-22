/**
 * SOAP Generate Skeleton Component
 * Loading skeleton for the SOAP generation page
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { SOAPGenerateSkeletonProps } from "../types";

export function SOAPGenerateSkeleton({
  className,
}: SOAPGenerateSkeletonProps) {
  return (
    <div className={cn("h-full flex flex-col min-h-0", className)}>
      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        {/* Input Section - 3 columns */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {/* Input Area Skeleton */}
            <div className="space-y-8 flex flex-col items-center justify-center py-12">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>

              <div className="flex items-center gap-4 w-full max-w-xs">
                <Skeleton className="flex-1 h-px" />
                <Skeleton className="h-3 w-6" />
                <Skeleton className="flex-1 h-px" />
              </div>

              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>

        {/* Guidelines Section - 1 column */}
        <div className="flex flex-col min-h-0 space-y-4">
          {/* Mode Selection Buttons Skeleton - Fixed at top */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Guidelines Card - Scrollable content */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3">
              {/* AI Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 rounded-lg">
                    <div className="p-1.5 bg-muted rounded-md">
                      <Skeleton className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Practices */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-md border border-border/50">
                    <Skeleton className="h-1.5 w-1.5 rounded-full mt-1.5" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
