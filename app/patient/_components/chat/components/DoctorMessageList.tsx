import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Stethoscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorMessageListProps } from "../types";

export const DoctorMessageList: React.FC<DoctorMessageListProps> = React.memo(({ 
  messages, 
  isLoading, 
  doctorName,
  patientName,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Start a conversation</h3>
          <p className="text-sm text-muted-foreground">
            Send a message to start chatting with Dr. {doctorName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isPatient = message.senderType === "patient";
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div
              key={message._id}
              className={cn(
                "flex gap-3",
                isPatient ? "justify-end" : "justify-start"
              )}
            >
              {!isPatient && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Stethoscope className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  isPatient
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className={cn(
                  "mt-2 pt-2 text-xs opacity-70",
                  isPatient
                    ? "border-t border-primary-foreground/30"
                    : "border-t border-border/50"
                )}>
                  <div className="flex items-center justify-between">
                    <span>
                      {isPatient ? (patientName || "You") : `Dr. ${doctorName}`}
                    </span>
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {isPatient && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                <Stethoscope className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending message...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

DoctorMessageList.displayName = "DoctorMessageList";
