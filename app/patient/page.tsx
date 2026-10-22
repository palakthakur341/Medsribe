"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { Calendar, Mic, History, Bot, Sparkles, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FeatureCard,
  AppointmentSection,
  TreatmentOverview,
  type Appointment
} from "@/app/patient/_components/dashboard";
import { api } from "@/convex/_generated/api";



export default function PatientDashboard() {
  const { data: session } = useSession();

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );



  // Fetch upcoming appointments
  const upcomingAppointments = useQuery(
    api.appointments.getUpcomingByPatient,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Show loading skeleton while session or profile is loading
  if (session?.user?.id && patientProfile === undefined) {
    return (
      <div className="h-full flex flex-col p-4 space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Features Layout Skeleton */}
        <div className="flex-shrink-0 grid gap-4 lg:grid-cols-4">
          {/* SOAP Generation - 2 columns */}
          <div className="lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* AI Assistant - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* Order Medication - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
          {/* Left Column - Treatment Overview */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>

          {/* Right Column - Appointments */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (!session?.user?.id) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load user session</p>
        </div>
      </div>
    );
  }

  if (patientProfile === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Patient profile not found</p>
        </div>
      </div>
    );
  }



  // Convert appointments to the expected format
  const appointments: Appointment[] = upcomingAppointments?.map(appointment => ({
    _id: appointment._id,
    doctor: appointment.doctor ? {
      firstName: appointment.doctor.firstName,
      lastName: appointment.doctor.lastName
    } : undefined,
    appointmentDateTime: appointment.appointmentDateTime.toString(),
    status: appointment.status,
    reason: (appointment as any).reason || undefined
  })) || [];



  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back, {patientProfile?.firstName || "Patient"}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your health records and generate SOAP notes with AI-powered features
        </p>
      </div>

      {/* Main Features Layout: 1/2 SOAP + 1/4 AI Assistant + 1/4 Order Medication */}
      <div className="flex-shrink-0 grid gap-3 lg:grid-cols-4">
        {/* SOAP Generation - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          {patientProfile ? (
            <FeatureCard
              title="Generate SOAP Notes with AI"
              description="Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality."
              icon={<Sparkles className="h-5 w-5 text-primary-foreground" />}
              badge="AI-Powered"
              gradient={{
                from: "bg-background",
                to: "",
                border: "border-border",
                iconBg: "bg-primary",
                textColor: "text-foreground",
                badgeColor: "bg-secondary text-secondary-foreground"
              }}
              actions={{
                secondary: {
                  label: "View History",
                  href: "/patient/soap/history",
                  icon: <History className="h-4 w-4 mr-2" />
                },
                primary: {
                  label: "Generate SOAP",
                  href: "/patient/soap/generate",
                  icon: <Mic className="h-4 w-4 mr-2" />
                }
              }}
            />
          ) : (
            <Skeleton className="h-48 w-full rounded-lg" />
          )}
        </div>

        {/* AI Medical Assistant - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          {patientProfile ? (
            <FeatureCard
              title="AI Medical Assistant"
              description="Chat with your personal AI assistant for medical insights, health questions, symptom analysis, and personalized health recommendations with advanced AI capabilities."
              icon={<Brain className="h-5 w-5 text-primary-foreground" />}
              badge="Smart Chat"
              gradient={{
                from: "bg-background",
                to: "",
                border: "border-border",
                iconBg: "bg-primary",
                textColor: "text-foreground",
                badgeColor: "bg-secondary text-secondary-foreground"
              }}
              actions={{
                secondary: {
                  label: "Chat History",
                  href: "/patient/assistant/history",
                  icon: <History className="h-4 w-4 mr-2" />
                },
                primary: {
                  label: "Chat with Assistant",
                  href: "/patient/assistant",
                  icon: <Bot className="h-4 w-4 mr-2" />
                }
              }}
            />
          ) : (
            <Skeleton className="h-48 w-full rounded-lg" />
          )}
        </div>
      </div>

      {/* New 2-Column Grid: Takes full remaining space */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
        {/* Left Column - Treatment Overview */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {patientProfile ? (
              <TreatmentOverview
                patientId={patientProfile._id}
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground",
                  itemBg: "bg-muted",
                  itemBorder: "border-border"
                }}
              />
            ) : (
              <Skeleton className="h-full w-full rounded-lg" />
            )}
          </div>
        </div>

        {/* Right Column - Appointments Only */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {patientProfile ? (
              <AppointmentSection
                appointments={appointments}
                title="Upcoming Appointments"
                description="Your scheduled visits"
                icon={<Calendar className="h-4 w-4 text-primary-foreground" />}
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground",
                  itemBg: "bg-muted",
                  itemBorder: "border-border"
                }}
                emptyState={{
                  icon: <Calendar className="h-8 w-8" />,
                  message: "No upcoming appointments",
                  actionLabel: "Book Appointment",
                  actionHref: "/patient/appointments/book"
                }}
                viewAllHref="/patient/appointments"
                maxItems={3}
              />
            ) : (
              <Skeleton className="h-full w-full rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}