import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AssistantSkeletonProps } from "../types";

export const AssistantSkeleton: React.FC<AssistantSkeletonProps> = React.memo(() => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 h-full">
          {/* Chat History Skeleton */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-2 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Skeleton */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-3 w-3 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface Skeleton */}
        <div className="lg:col-span-3 min-h-0 h-full">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col p-0">
              {/* Messages Skeleton */}
              <div className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
                      {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                      <div className="max-w-[80%] space-y-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        {i % 2 === 0 && <Skeleton className="h-3 w-24" />}
                      </div>
                      {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Skeleton */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

AssistantSkeleton.displayName = "AssistantSkeleton";
