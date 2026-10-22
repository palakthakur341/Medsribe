import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageListProps } from "../types";
import { RelevantDocumentsSection } from "./RelevantDocumentsSection";

export const MessageList: React.FC<MessageListProps> = React.memo(({ 
  messages, 
  isLoading, 
  patientProfile 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "assistant" && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
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
              {/* Show relevant documents for assistant messages */}
              {message.sender === "assistant" && (message.relevantDocuments || message.enhancedRelevantDocuments) && (
                <RelevantDocumentsSection
                  documents={message.relevantDocuments}
                  enhancedDocuments={message.enhancedRelevantDocuments}
                  structuredResponse={message.structuredResponse}
                  processingTime={message.processingTime}
                />
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
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching your medical records and health data...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

MessageList.displayName = "MessageList";
