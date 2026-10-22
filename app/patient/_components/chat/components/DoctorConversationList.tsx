import React, { useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorConversationListProps } from "../types";

export const DoctorConversationList: React.FC<DoctorConversationListProps> = React.memo(({
  conversations,
  selectedDoctorId,
  onConversationSelect,
  className = "",
  isLoading = false
}) => {
  // Memoize sorted conversations to prevent unnecessary re-renders
  const sortedConversations = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [conversations]);

  // Memoize the conversation select handler
  const handleConversationSelect = useCallback((doctorId: string) => {
    onConversationSelect(doctorId as any);
  }, [onConversationSelect]);

  // Loading state following AppointmentsList pattern
  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-3">
                {/* Doctor Avatar Skeleton */}
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                
                {/* Doctor Info Skeleton */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse flex-shrink-0" />
                  </div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state following AppointmentsList pattern
  if (!sortedConversations || sortedConversations.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No Conversations</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any active conversations with doctors yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header following AppointmentsList pattern */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Your Doctors</h3>
            <p className="text-xs text-muted-foreground">
              {sortedConversations.length} active conversation{sortedConversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-3 space-y-2">
          {sortedConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200 group relative border",
                selectedDoctorId === conversation.doctorId 
                  ? "bg-primary/5 border-primary/20 shadow-sm" 
                  : "border-border/50 hover:border-border hover:bg-accent/30"
              )}
              onClick={() => handleConversationSelect(conversation.doctorId)}
            >
              <div className="flex items-start gap-3">
                {/* Doctor Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    selectedDoctorId === conversation.doctorId
                      ? "bg-primary/10 text-primary border-2 border-primary/20"
                      : "bg-muted text-muted-foreground border-2 border-border/50"
                  )}>
                    {conversation.doctor ?
                      `${conversation.doctor.firstName?.[0] || ''}${conversation.doctor.lastName?.[0] || ''}`.toUpperCase() || 'DR'
                      : 'DR'
                    }
                  </div>
                </div>
                
                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate leading-tight">
                        Dr. {conversation.doctor ?
                          `${conversation.doctor.firstName || ''} ${conversation.doctor.lastName || ''}`.trim() || 'Unknown Doctor'
                          : 'Unknown Doctor'
                        }
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conversation.doctor?.primarySpecialty || 'General Practice'}
                      </p>
                      {(conversation.unreadCount ?? 0) > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            {(conversation.unreadCount ?? 0) > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex flex-col items-end gap-1">
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      )}>
                        Active
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessageAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          ...(new Date(conversation.lastMessageAt).getFullYear() !== new Date().getFullYear() && {
                            year: 'numeric'
                          })
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {selectedDoctorId === conversation.doctorId && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary rounded-r-full" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

DoctorConversationList.displayName = "DoctorConversationList";