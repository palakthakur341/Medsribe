"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles } from "lucide-react";
import { DoctorPatientChat } from "@/components/doctor/doctor-patient-chat";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Reuse components from assistant
import {
  AssistantSkeleton,
  ErrorBoundary,
  LoadingOverlay,
} from "@/app/patient/_components/assistant/components";

// Import new chat components
import { PatientChatList, PatientChatFeatures } from "@/app/doctor/_components/chat";

export default function DoctorChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Get doctor conversations
  const conversations = useQuery(
    api.doctorPatientConversations.getDoctorConversations,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  const selectedPatient = conversations?.find(conv => conv.patientId === selectedPatientId)?.patient;

  // Authentication check
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Patient Communication</h1>
          <p className="text-muted-foreground text-sm">
            Secure messaging and communication with your patients
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Patient Chat Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-3 min-h-0">

            {/* Patient Chat List */}
            <PatientChatList
              conversations={conversations}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              isLoading={!conversations}
            />

            {/* Patient Chat Features */}
            <PatientChatFeatures />

          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0">
            {selectedPatientId && selectedPatient && doctorProfile ? (
              <DoctorPatientChat
                doctorId={doctorProfile._id}
                patientId={selectedPatientId}
                patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                onClose={() => setSelectedPatientId(null)}
              />
            ) : (
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="p-4 pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                        <MessageCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground">Patient Communication</h3>
                        <p className="text-xs text-muted-foreground">Secure messaging with patients</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      HIPAA Secure
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Select a Patient</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a patient from the list to start chatting
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay for async operations */}
      {(!conversations && doctorProfile) && <LoadingOverlay />}
    </ErrorBoundary>
  );
}
