import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageListProps, ChatMessage } from "../types";
import { RelevantDocumentsSection } from "./RelevantDocumentsSection";

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: ChatMessage[];
    patientProfile?: any;
  };
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ index, style, data }) => {
  const { messages, patientProfile } = data;
  const message = messages[index];

  return (
    <div style={style} className="px-4">
      <div
        className={cn(
          "flex gap-3 py-2",
          message.sender === "user" ? "justify-end" : "justify-start"
        )}
      >
        {message.sender === "assistant" && (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
        <div
          className={cn(
            "max-w-[80%] rounded-lg p-3 text-sm",
            message.sender === "user"
              ? "bg-primary text-primary-foreground ml-12"
              : "bg-muted"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.sender === "assistant" && (
            <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.contextUsed && (
                  <Badge variant="outline" className="text-xs">
                    Context: {message.relevantDocumentsCount || 0} docs
                  </Badge>
                )}
              </div>
            </div>
          )}
          {message.sender === "assistant" && message.relevantDocuments && message.relevantDocuments.length > 0 && (
            <RelevantDocumentsSection documents={message.relevantDocuments} />
          )}
        </div>
        {message.sender === "user" && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-primary-foreground font-medium">
              {patientProfile?.firstName?.[0] || "P"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export const VirtualizedMessageList: React.FC<MessageListProps> = React.memo(({ 
  messages, 
  isLoading, 
  patientProfile 
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
    patientProfile
  }), [messages, patientProfile]);

  // Calculate item height (approximate)
  const getItemSize = useCallback((index: number) => {
    const message = messages[index];
    // Base height + content estimation + relevant docs
    let height = 80; // Base message height
    if (message.content.length > 100) height += 20;
    if (message.relevantDocuments?.length) height += 40;
    return height;
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
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
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing your medical records...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VirtualizedMessageList.displayName = "VirtualizedMessageList";
