"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  Sparkles,
  Loader2,
  FileText,
  ChevronDown,
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  contextUsed?: boolean;
  relevantDocuments?: Array<{
    id: string;
    event_type: string;
    content_preview: string;
    similarity_score: number;
    created_at: string;
    metadata: any;
  }>;
  relevantDocumentsCount?: number;
  processingTime?: number;
  // Enhanced RAG fields
  ragResponseData?: any;
  structuredResponse?: any;
  enhancedRelevantDocuments?: Array<{
    id: string;
    role_type: string;
    role_id: string;
    event_type: string;
    content: string;
    content_chunk?: string;
    metadata: any;
    created_at: string;
    similarity_score: number;
  }>;
}

// Component to display relevant documents
const RelevantDocumentsDisplay: React.FC<{
  documents: ChatMessage['relevantDocuments'];
  enhancedDocuments?: ChatMessage['enhancedRelevantDocuments'];
  structuredResponse?: ChatMessage['structuredResponse'];
  count: number;
  processingTime?: number;
}> = ({ documents, enhancedDocuments, structuredResponse, count, processingTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStructured, setShowStructured] = useState(false);

  // Use enhanced documents if available, fallback to regular documents
  const displayDocuments = enhancedDocuments || documents;

  if (!displayDocuments || displayDocuments.length === 0) return null;

  return (
    <div className="mt-2 border-t pt-2 space-y-2">
      {/* Structured Response Display */}
      {structuredResponse && (
        <Collapsible open={showStructured} onOpenChange={setShowStructured}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
              {showStructured ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
              <Sparkles className="h-3 w-3 mr-1" />
              AI Analysis: {structuredResponse.type?.replace(/_/g, ' ')}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/50 rounded p-2 text-xs">
              <div className="font-medium mb-1">{structuredResponse.summary}</div>
              <div className="text-muted-foreground">
                {typeof structuredResponse.data === 'object'
                  ? JSON.stringify(structuredResponse.data, null, 2)
                  : String(structuredResponse.data)
                }
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Documents Section */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
            {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <FileText className="h-3 w-3 mr-1" />
            {count} relevant document{count !== 1 ? 's' : ''} found
            {processingTime && (
              <span className="ml-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {processingTime.toFixed(1)}s
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-2">
            {displayDocuments.map((doc, index) => (
              <div key={doc.id} className="bg-muted/50 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {doc.event_type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-muted-foreground">
                    {(doc.similarity_score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2">
                  {('content_preview' in doc ? doc.content_preview : doc.content?.substring(0, 200) + "...")}
                </p>
                <div className="text-muted-foreground mt-1">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface FloatingChatWidgetProps {
  userRole: "doctor" | "patient";
}

export function FloatingChatWidget({ userRole }: FloatingChatWidgetProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<Id<"chatSessions"> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    userRole === "patient" && session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    userRole === "doctor" && session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get chat sessions
  const chatSessions = useQuery(
    api.chatSessions.getUserSessions,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get messages for current session
  const sessionMessages = useQuery(
    api.chatMessages.getSessionMessages,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Mutations
  const createSession = useMutation(api.chatSessions.createSession);
  const addMessage = useMutation(api.chatMessages.addMessage);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when session changes
  useEffect(() => {
    if (sessionMessages && currentSessionId) {
      const formattedMessages: ChatMessage[] = sessionMessages.map((msg) => ({
        id: msg._id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
        contextUsed: msg.contextUsed,
        relevantDocuments: msg.relevantDocuments,
        relevantDocumentsCount: msg.relevantDocumentsCount,
        processingTime: msg.processingTime,
        // Enhanced RAG fields
        ragResponseData: msg.ragResponseData,
        structuredResponse: msg.structuredResponse,
        enhancedRelevantDocuments: msg.enhancedRelevantDocuments,
      }));
      setMessages(formattedMessages);

      // Calculate unread messages when chat is closed
      if (!isOpen && lastReadMessageId) {
        const lastReadIndex = formattedMessages.findIndex(msg => msg.id === lastReadMessageId);
        const newMessages = lastReadIndex >= 0 ? formattedMessages.slice(lastReadIndex + 1) : formattedMessages;
        const assistantMessages = newMessages.filter(msg => msg.sender === "assistant");
        setUnreadCount(assistantMessages.length);
      }
    } else if (!currentSessionId && isOpen) {
      // Show welcome message
      const profile = userRole === "patient" ? patientProfile : doctorProfile;
      if (profile) {
        const welcomeName = userRole === "patient"
          ? profile.firstName || "there"
          : `Dr. ${profile.lastName || "Doctor"}`;

        const welcomeMessage: ChatMessage = {
          id: "welcome",
          content: `Hello ${welcomeName}! I'm your AI medical assistant. How can I help you today?`,
          sender: "assistant",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [sessionMessages, currentSessionId, patientProfile, doctorProfile, userRole, isOpen, lastReadMessageId]);

  // Auto-select first session if available
  useEffect(() => {
    if (chatSessions && chatSessions.length > 0 && !currentSessionId && isOpen) {
      setCurrentSessionId(chatSessions[0]._id);
    }
  }, [chatSessions, currentSessionId, isOpen]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setLastReadMessageId(lastMessage.id);
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session?.user?.id || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Create session if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        const profile = userRole === "patient" ? patientProfile : doctorProfile;
        if (!profile) {
          toast.error("Profile not found");
          return;
        }

        sessionId = await createSession({
          userId: session.user.id as any,
          userType: userRole,
          patientId: userRole === "patient" ? (profile as any)._id : undefined,
          doctorId: userRole === "doctor" ? (profile as any)._id : undefined,
          title: userMessage.substring(0, 50),
        });
        setCurrentSessionId(sessionId);
      }

      // Add user message
      await addMessage({
        sessionId,
        userId: session.user.id as any,
        content: userMessage,
        sender: "user",
      });

      // Call AI API
      const apiEndpoint = userRole === "patient" 
        ? "/api/patient/assistant/chat"
        : "/api/doctor/assistant/chat";
      
      const profileId = userRole === "patient" ? patientProfile?._id : doctorProfile?._id;
      const requestBody = userRole === "patient"
        ? { message: userMessage, patient_id: profileId }
        : { message: userMessage, doctor_id: profileId };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const result = await response.json();
      const data = result.data || result; // Handle both new and legacy response formats

      // Add assistant message with enhanced RAG data
      await addMessage({
        sessionId,
        userId: session.user.id as any,
        content: data.message || data.response, // Handle both response formats
        sender: "assistant",
        contextUsed: data.context_used,
        relevantDocuments: data.relevant_documents,
        relevantDocumentsCount: data.relevant_documents_count,
        processingTime: data.processing_time,
        // Enhanced RAG fields
        ragResponseData: data.rag_response ? {
          role_type: data.rag_response.role_type,
          role_id: data.rag_response.role_id,
          query: data.rag_response.query,
          response: data.rag_response.response,
          similarity_threshold: data.rag_response.similarity_threshold,
          max_results: data.rag_response.max_results,
          generated_at: data.rag_response.generated_at,
        } : undefined,
        structuredResponse: data.structured_response,
        enhancedRelevantDocuments: data.enhanced_relevant_documents,
      });

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session?.user) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              onClick={() => {
                setIsOpen(true);
                setUnreadCount(0);
              }}
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              size="icon"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
          <Card className={cn(
            "shadow-xl border transition-all duration-300 ease-in-out",
            isMinimized ? "w-80 h-16 pt-0" : "w-96 h-[520px]"
          )}>
            {/* Header */}
            <CardHeader className="py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  <CardTitle className="text-sm font-medium truncate">AI Assistant</CardTitle>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                    <Sparkles className="h-2.5 w-2.5" />
                  </Badge>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <CardContent className="flex-1 min-h-0 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0 p-4 scrollbar-hide">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
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

                        {/* Show relevant documents for assistant messages */}
                        {message.sender === "assistant" && (message.relevantDocuments || message.enhancedRelevantDocuments) && (
                          <RelevantDocumentsDisplay
                            documents={message.relevantDocuments}
                            enhancedDocuments={message.enhancedRelevantDocuments}
                            structuredResponse={message.structuredResponse}
                            count={message.relevantDocumentsCount || 0}
                            processingTime={message.processingTime}
                          />
                        )}

                        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.sender === "assistant" && message.contextUsed && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-2 w-2 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-medium">
                            {userRole === "patient"
                              ? patientProfile?.firstName?.[0] || "P"
                              : doctorProfile?.firstName?.[0] || "D"
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            {userRole === "doctor"
                              ? "Searching clinical records and patient data..."
                              : "Analyzing your medical records and health data..."
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={userRole === "patient"
                        ? "Ask me about your SOAP notes, care plans, symptoms, medications..."
                        : "Ask me about patient records, clinical insights, documentation..."
                      }
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {userRole === "patient" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("What is my latest care plan?")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Latest Care Plan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Show me my recent symptoms")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Recent Symptoms
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("What medications am I taking?")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Current Medications
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Summarize recent patient activities")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Patient Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Review shared SOAP notes")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Shared Notes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Show treatment recommendations")}
                          disabled={isLoading}
                          className="text-xs h-6"
                        >
                          Treatments
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
          </Card>
        </div>
      )}
    </>
  );
}
