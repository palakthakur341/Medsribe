import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionListProps } from "../types";

export const SessionList: React.FC<SessionListProps> = React.memo(({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  isLoading,
  className = ""
}) => {
  const handleSessionClick = useCallback((sessionId: string) => {
    onSelectSession(sessionId as any);
  }, [onSelectSession]);

  const handleDeleteClick = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId as any);
  }, [onDeleteSession]);

  // Empty state following AppointmentsList pattern
  if (!sessions || sessions.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No Chat History</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation to see your chat history
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg"
            onClick={onNewSession}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Start New Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header following AppointmentsList pattern */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Chat History</h3>
              <p className="text-xs text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs rounded-lg"
            onClick={onNewSession}
            disabled={isLoading}
          >
            <Plus className="h-3 w-3 mr-1" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-3 space-y-2">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200 group relative border",
                currentSessionId === session._id 
                  ? "bg-primary/5 border-primary/20 shadow-sm" 
                  : "border-border/50 hover:border-border hover:bg-accent/30"
              )}
              onClick={() => handleSessionClick(session._id)}
            >
              <div className="flex items-start gap-3">
                {/* Chat Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  currentSessionId === session._id 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <MessageCircle className="h-4 w-4" />
                </div>
                
                {/* Session Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate leading-tight">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {session.messageCount} msg
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.lastMessageAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      onClick={(e) => handleDeleteClick(e, session._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {currentSessionId === session._id && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary rounded-r-full" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

SessionList.displayName = "SessionList";