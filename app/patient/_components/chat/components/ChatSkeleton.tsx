import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ChatSkeleton: React.FC = React.memo(() => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 min-h-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations List Skeleton */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface Skeleton */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col p-0">
                {/* Messages Skeleton */}
                <div className="flex-1 min-h-0 p-4">
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                        <div className="max-w-[80%] space-y-2">
                          <Skeleton className="h-16 w-full rounded-lg" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Skeleton */}
                <div className="border-t p-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10" />
                    <Skeleton className="h-10 w-10" />
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

ChatSkeleton.displayName = "ChatSkeleton";
