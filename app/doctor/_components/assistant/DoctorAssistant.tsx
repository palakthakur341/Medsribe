"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Hooks
import { useDoctorProfile, useDoctorChatSessions, useDoctorChat } from "./hooks";

// Reuse patient assistant components
import {
  AssistantSkeleton,
  SessionList,
  ErrorBoundary,
  LoadingOverlay,
} from "@/app/patient/_components/assistant/components";

// Doctor-specific components
import { DoctorAssistantFeatures } from "./components/DoctorAssistantFeatures";
import { DoctorChatInterface } from "./components/DoctorChatInterface";

// Types
import { Id } from "@/convex/_generated/dataModel";

export default function DoctorAssistant() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Doctor-specific hooks
  const { profile: doctorProfile, isLoading: profileLoading } = useDoctorProfile();
  
  const {
    sessions,
    currentSessionId,
    isLoading: sessionsLoading,
    createNewSession,
    selectSession,
    deleteSession,
  } = useDoctorChatSessions({ doctorProfile });

  const {
    messages,
    inputMessage,
    isLoading: chatLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress,
  } = useDoctorChat({
    currentSessionId,
    doctorProfile,
    onSessionCreated: selectSession,
  });

  // Authentication check
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && profileLoading)) {
    return <AssistantSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col p-4 space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">AI Medical Assistant</h1>
          <p className="text-muted-foreground text-sm">
            Get AI-powered insights about your patients, SOAP notes, and medical records
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Assistant Info Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-3 min-h-0">
            
            {/* Chat History - Reusing SessionList from patient assistant */}
            <SessionList
              sessions={sessions as any}
              currentSessionId={currentSessionId}
              onSelectSession={selectSession}
              onDeleteSession={deleteSession}
              onNewSession={createNewSession}
              isLoading={sessionsLoading}
            />

            {/* Doctor Assistant Features */}
            <DoctorAssistantFeatures />

          </div>

          {/* Chat Interface - Using doctor-specific ChatInterface */}
          <div className="lg:col-span-3 min-h-0">
            <DoctorChatInterface
              messages={messages}
              inputMessage={inputMessage}
              isLoading={chatLoading}
              doctorProfile={doctorProfile}
              onInputChange={setInputMessage}
              onSendMessage={sendMessage}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
      </div>

      {/* Loading overlay for async operations */}
      {(profileLoading || sessionsLoading) && <LoadingOverlay />}
    </ErrorBoundary>
  );
}
