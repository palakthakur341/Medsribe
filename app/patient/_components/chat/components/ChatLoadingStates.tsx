import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MessageCircle, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

// Compact loading spinner for chat
export const ChatLoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = React.memo(({ 
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

ChatLoadingSpinner.displayName = "ChatLoadingSpinner";

// Loading state for chat messages
export const ChatMessageLoadingState: React.FC = React.memo(() => (
  <div className="p-4 space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
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
));

ChatMessageLoadingState.displayName = "ChatMessageLoadingState";

// Loading state for conversation list
export const ConversationListLoadingState: React.FC = React.memo(() => (
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
));

ConversationListLoadingState.displayName = "ConversationListLoadingState";

// Empty state for chat
export const ChatEmptyStateComponent: React.FC<{
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

ChatEmptyStateComponent.displayName = "ChatEmptyStateComponent";

// Loading overlay for chat components
export const ChatLoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = React.memo(({ isLoading, children, loadingText = "Loading chat..." }) => (
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

ChatLoadingOverlay.displayName = "ChatLoadingOverlay";

// Typing indicator component
export const TypingIndicator: React.FC<{ doctorName: string }> = React.memo(({ doctorName }) => (
  <div className="flex gap-3 justify-start p-4">
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
      <Stethoscope className="h-4 w-4 text-white" />
    </div>
    <div className="bg-muted rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-muted-foreground">Dr. {doctorName} is typing...</span>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = "TypingIndicator";
