import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Stethoscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorMessageListProps, DoctorChatMessage } from "../types";

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: DoctorChatMessage[];
    doctorName: string;
    patientName?: string;
    currentUserId?: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ index, style, data }) => {
  const { messages, doctorName, patientName, currentUserId } = data;
  const message = messages[index];
  const isPatient = message.senderType === "patient";

  return (
    <div style={style} className="px-4">
      <div
        className={cn(
          "flex gap-3 py-2",
          isPatient ? "justify-end" : "justify-start"
        )}
      >
        {!isPatient && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-500 text-white text-xs">
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
          <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-70">
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
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export const VirtualizedDoctorMessageList: React.FC<DoctorMessageListProps> = React.memo(({ 
  messages, 
  isLoading, 
  doctorName,
  patientName,
  currentUserId
}) => {
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, "end");
    }
  }, [messages.length]);

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages,
    doctorName,
    patientName,
    currentUserId
  }), [messages, doctorName, patientName, currentUserId]);

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
    <div className="flex-1 min-h-0 flex flex-col">
      {messages.length > 0 && (
        <List
          ref={listRef}
          height={400} // This should be dynamic based on container
          itemCount={messages.length}
          itemSize={120} // Average message height
          itemData={itemData}
          className="flex-1"
        >
          {MessageItem}
        </List>
      )}
      
      {isLoading && (
        <div className="p-4">
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
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
        </div>
      )}
    </div>
  );
});

VirtualizedDoctorMessageList.displayName = "VirtualizedDoctorMessageList";
