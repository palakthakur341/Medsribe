"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, AlertCircle, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientAuth } from "@/hooks/use-patient-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Hooks
import { usePatientProfile, useDoctorConversations } from "./hooks";

// Components
import {
  ChatPageHeader,
  ChatEmptyState,
  DoctorConversationList,
  DoctorChatInterface,
  ChatErrorBoundary,
} from "./components";

// Individual skeleton components following AppointmentsList patterns
const DoctorConversationListSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Users className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse mt-1" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-hidden">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-12 bg-muted rounded animate-pulse flex-shrink-0" />
                </div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DoctorChatInterfaceSkeleton = () => (
  <div className="h-full border rounded-xl flex flex-col overflow-hidden">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <MessageCircle className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
        </div>
      </div>
    </div>

    {/* Messages Skeleton */}
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
              {i % 2 === 0 && <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />}
              <div className="max-w-[80%] space-y-2">
                <div className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              {i % 2 === 1 && <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>

    {/* Input Skeleton */}
    <div className="flex-shrink-0 p-4 border-t border-border/50">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 w-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const PatientChat: React.FC = () => {
  const router = useRouter();
  const { session, isLoading: authLoading, isAuthenticated } = usePatientAuth();

  // Custom hooks for data and state management
  const { profile: patientProfile, isLoading: profileLoading } = usePatientProfile();
  const {
    conversations,
    selectedDoctorId,
    selectedDoctor,
    isLoading: conversationsLoading,
    selectDoctor,
    clearSelection,
  } = useDoctorConversations(patientProfile);

  // Authentication and authorization
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect if not authenticated
  if (authLoading || !isAuthenticated) {
    return null;
  }

  // Error state for missing patient profile
  if (session?.user?.id && patientProfile === null) {
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Chat with Doctors</h1>
              <p className="text-xs text-muted-foreground">
                Communicate directly with your healthcare providers
              </p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-medium">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load your patient profile. Please contact support.
            </p>
            <Button variant="outline" size="sm" className="rounded-lg">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Chat with Doctors</h1>
              <p className="text-xs text-muted-foreground">
                Communicate directly with your healthcare providers
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full p-4">
          {/* Conversations List Sidebar */}
          <div className="lg:col-span-1 flex flex-col min-h-0 h-full">
            <ChatErrorBoundary>
              {conversationsLoading || profileLoading ? (
                <DoctorConversationListSkeleton />
              ) : (
                <DoctorConversationList
                  conversations={conversations}
                  selectedDoctorId={selectedDoctorId}
                  onConversationSelect={selectDoctor}
                  className="h-full"
                  isLoading={conversationsLoading}
                />
              )}
            </ChatErrorBoundary>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            {conversationsLoading || profileLoading ? (
              <DoctorChatInterfaceSkeleton />
            ) : selectedDoctorId && selectedDoctor && patientProfile ? (
              <ChatErrorBoundary>
                <DoctorChatInterface
                  doctorId={selectedDoctorId}
                  patientId={patientProfile._id}
                  doctorName={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  onClose={clearSelection}
                />
              </ChatErrorBoundary>
            ) : (
              <div className="h-full border rounded-xl flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-medium">Select a Doctor</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a doctor from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default PatientChat;