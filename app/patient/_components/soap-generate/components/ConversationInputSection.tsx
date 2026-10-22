/**
 * Conversation Input Section Component
 * Chat-like interface for conversational SOAP generation
 */

"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Stethoscope
} from "lucide-react";

import { ConversationInputSectionProps } from "../types";

// Mock conversation data for demonstration
const MOCK_CONVERSATION = [
  {
    id: 1,
    type: 'agent' as const,
    message: "Hello! I'm your AI medical assistant. I'll help you create a comprehensive SOAP note through our conversation. Let's start with your chief complaint - what brings you in today?",
    category: "Chief Complaint",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 2,
    type: 'patient' as const,
    message: "I'm having chest pain. It started about 2 hours ago while I was mowing the lawn.",
    timestamp: new Date(Date.now() - 280000),
  },
  {
    id: 3,
    type: 'agent' as const,
    message: "I need to understand this chest pain better. Can you describe exactly what it feels like and point to where you feel it most?",
    category: "History of Present Illness",
    analysis: "Category: Chief Complaint ✓ | Clinical Priority: HIGH - chest pain requires immediate characterization",
    timestamp: new Date(Date.now() - 260000),
  },
  {
    id: 4,
    type: 'patient' as const,
    message: "It's like a heavy pressure right in the center of my chest, like someone is sitting on me. It doesn't move around.",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: 5,
    type: 'agent' as const,
    message: "On a scale of 1-10, how would you rate this pain? And does it spread anywhere else - to your arms, neck, jaw, or back?",
    category: "History of Present Illness",
    analysis: "Quality: pressure | Location: central chest | Clinical Alert: Central chest pressure - cardiac risk",
    timestamp: new Date(Date.now() - 220000),
  },
];

interface ConversationMessage {
  id: number;
  type: 'agent' | 'patient';
  message: string;
  category?: string;
  analysis?: string;
  timestamp: Date;
}



export function ConversationInputSection({
  onProcess,
  isProcessing,
  disabled = false,
  className,
}: ConversationInputSectionProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>(MOCK_CONVERSATION);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing || disabled) return;

    const newPatientMessage: ConversationMessage = {
      id: messages.length + 1,
      type: 'patient',
      message: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newPatientMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const mockAgentResponse: ConversationMessage = {
        id: messages.length + 2,
        type: 'agent',
        message: "Thank you for that information. Based on what you've told me, I'm getting a clearer picture. Let me ask about any associated symptoms - are you experiencing shortness of breath, nausea, sweating, or lightheadedness?",
        category: "History of Present Illness",
        analysis: "Severity: 7/10 | Radiation: left arm, jaw | Clinical Alert: Classic anginal pattern - URGENT",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, mockAgentResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const renderMessage = (message: ConversationMessage) => {
    const isAgent = message.type === 'agent';
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 mb-4",
          isAgent ? "justify-start" : "justify-end"
        )}
      >
        {isAgent && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}
        
        <div className={cn(
          "max-w-[80%] space-y-2",
          isAgent ? "items-start" : "items-end"
        )}>
          <div className={cn(
            "rounded-lg px-4 py-3 text-sm",
            isAgent 
              ? "bg-muted text-foreground" 
              : "bg-primary text-primary-foreground"
          )}>
            {message.message}
          </div>
          
          {/* Category and Analysis for Agent messages */}
          {isAgent && (message.category || message.analysis) && (
            <div className="space-y-1">
              {message.category && (
                <Badge variant="secondary" className="text-xs">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  {message.category}
                </Badge>
              )}
              {message.analysis && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                  {message.analysis}
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        {!isAgent && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col border border-border rounded-lg", className)}>
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">AI Medical Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Conversational SOAP generation
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map(renderMessage)}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI is analyzing...</span>
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={disabled || isProcessing || isTyping}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || disabled || isProcessing || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-muted-foreground">
            Press Enter to send • Shift+Enter for new line
          </div>
          <Button
            onClick={onProcess}
            disabled={disabled || isProcessing || messages.length < 6}
            className="flex items-center gap-2"
            size="sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating SOAP...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Generate SOAP Notes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
