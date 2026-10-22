import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Compact loading spinner
export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = React.memo(({ 
  size = "md", 
  className 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

// Loading state for chat messages
export const MessageLoadingState: React.FC = React.memo(() => (
  <div className="p-4 space-y-4">
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
));

MessageLoadingState.displayName = "MessageLoadingState";

// Loading state for session list
export const SessionListLoadingState: React.FC = React.memo(() => (
  <div className="p-3 space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-2 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
));

SessionListLoadingState.displayName = "SessionListLoadingState";

// Empty state for when no data is available
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = React.memo(({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4 text-muted-foreground">
      {icon || <MessageCircle className="h-12 w-12" />}
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    {description && (
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
    )}
    {action}
  </div>
));

EmptyState.displayName = "EmptyState";

// Loading overlay for full components
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = React.memo(({ isLoading, children, loadingText = "Loading..." }) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">{loadingText}</span>
        </div>
      </div>
    )}
  </div>
));

LoadingOverlay.displayName = "LoadingOverlay";
