"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageSquare, Sparkles } from "lucide-react";

// Hooks
import { usePatientProfile, useChatSessions, useOptimizedChat } from "./hooks";

// Components
import {
  SessionList,
  AssistantFeatures,
  ChatInterface,
  ErrorBoundary,
} from "./components";

// Individual skeleton components following AppointmentsList pattern
const SessionListSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="h-7 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-hidden">
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AssistantFeaturesSkeleton = () => (
  <div className="border rounded-xl flex flex-col overflow-hidden">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse mt-1" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-3 w-3 bg-muted rounded animate-pulse mt-0.5 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ChatInterfaceSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>

    {/* Messages */}
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />}
              <div className="max-w-[80%] space-y-2">
                <div className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                {i % 2 === 0 && <div className="h-3 w-24 bg-muted rounded animate-pulse" />}
              </div>
              {i % 2 === 1 && <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>

    {/* Input */}
    <div className="flex-shrink-0 p-4 border-t border-border/50">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 w-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const PatientAssistant: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Custom hooks for data and state management
  const { profile: patientProfile, isLoading: profileLoading } = usePatientProfile();
  const {
    sessions: chatSessions,
    currentSessionId,
    isLoading: sessionsLoading,
    createNewSession,
    selectSession,
    deleteSession,
  } = useChatSessions(patientProfile);

  const {
    messages,
    inputMessage,
    isLoading: chatLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress,
  } = useOptimizedChat({
    currentSessionId,
    patientProfile,
    onSessionCreated: selectSession,
  });

  // Authentication and authorization
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Redirect if not authenticated or wrong role
  if (status === "loading" || !session || session.user.role !== "patient") {
    return null;
  }

  // Show main assistant interface
  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col space-y-4">
        {/* Header following AppointmentsList pattern */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">AI Medical Assistant</h1>
              <p className="text-xs text-muted-foreground">
                Get AI-powered insights about your medical records, SOAP notes, and health information
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Sidebar - Full Height */}
          <div className="lg:col-span-1 flex flex-col min-h-0 gap-4">
            {/* Session List - Takes most of the space */}
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                {sessionsLoading || profileLoading ? (
                  <SessionListSkeleton />
                ) : (
                  <SessionList
                    sessions={chatSessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={selectSession}
                    onDeleteSession={deleteSession}
                    onNewSession={createNewSession}
                    isLoading={sessionsLoading}
                  />
                )}
              </ErrorBoundary>
            </div>

            {/* Assistant Features - Compact at bottom */}
            <div className="flex-shrink-0">
              <ErrorBoundary>
                {profileLoading ? (
                  <AssistantFeaturesSkeleton />
                ) : (
                  <AssistantFeatures />
                )}
              </ErrorBoundary>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0">
            <ErrorBoundary>
              {profileLoading ? (
                <ChatInterfaceSkeleton />
              ) : (
                <ChatInterface
                  messages={messages}
                  inputMessage={inputMessage}
                  isLoading={chatLoading}
                  patientProfile={patientProfile}
                  onInputChange={setInputMessage}
                  onSendMessage={sendMessage}
                  onKeyPress={handleKeyPress}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PatientAssistant;