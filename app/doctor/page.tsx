"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import {
  Users,
  Calendar,
  Brain,
  FileText,
  Activity,
  Clock,
  Phone,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { api } from "@/convex/_generated/api";
import { ScheduleAppointmentDialog } from "./_components/appointments/components/ScheduleAppointmentDialog";

// Patient List Component - Updated to match AppointmentsList standards
const PatientList = React.memo<{
  patients: any[],
  isLoading: boolean,
  className?: string
}>(({
  patients,
  isLoading,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-3">
                {/* Avatar Skeleton */}
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                
                {/* Content Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-muted rounded-md animate-pulse" />
                    <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Users className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No Patients Yet</h3>
          <p className="text-sm text-muted-foreground">
            Patients will appear here once assigned to you
          </p>
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href="/doctor/patients">
              <Users className="h-4 w-4 mr-1" />
              View Patients
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">My Patients</h3>
              <p className="text-xs text-muted-foreground">
                {patients.length} patient{patients.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>
          <Link href="/doctor/patients">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Users className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </div>

      {/* Patients List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {patients.slice(0, 6).map((relationship) => {
            const patient = relationship.patient;
            const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

            return (
              <div
                key={relationship._id}
                className="p-4 hover:bg-muted/50 transition-colors border-l-2 border-l-primary/20 hover:border-l-primary/50 cursor-pointer"
                onClick={() => window.location.href = `/doctor/patients/${patient._id}`}
              >
                <div className="flex items-start gap-3">
                  {/* Patient Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Patient Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {patient.gender || 'Not specified'} • {age} years old
                        </p>
                      </div>

                      {/* Status Badge */}
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {/* Phone */}
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{patient.primaryPhone || 'No phone'}</span>
                      </div>

                      {/* DOB */}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

PatientList.displayName = "PatientList";

// Appointments Component - Updated to match AppointmentsList standards
const AppointmentsList = React.memo<{
  doctorId: string | undefined;
  isLoading: boolean;
  onScheduleNew?: () => void;
  className?: string;
}>(({ doctorId, isLoading, onScheduleNew, className = "" }) => {
  const weekAppointments = useQuery(
    api.appointments.getWeekByDoctor,
    doctorId ? { doctorId: doctorId as any } : "skip"
  );

  if (isLoading || !doctorId || weekAppointments === undefined) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar Skeleton */}
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                
                {/* Content Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-18 bg-muted rounded animate-pulse" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const appointments = weekAppointments || [];
  const sortedAppointments = appointments
    .filter((appointment: any) => appointment.appointmentDateTime && appointment.patient)
    .sort((a: any, b: any) => a.appointmentDateTime - b.appointmentDateTime)
    .slice(0, 5);

  if (sortedAppointments.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No Appointments This Week</h3>
          <p className="text-sm text-muted-foreground">
            Your schedule is clear for this week
          </p>
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href="/doctor/appointments">
              <Plus className="h-4 w-4 mr-1" />
              Schedule Appointment
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Upcoming Appointments</h3>
              <p className="text-xs text-muted-foreground">
                {sortedAppointments.length} appointment{sortedAppointments.length !== 1 ? 's' : ''} this week
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onScheduleNew && (
              <Button
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={onScheduleNew}
              >
                <Plus className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            )}
            <Link href="/doctor/appointments">
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {sortedAppointments.map((appointment: any) => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            const isToday = appointmentDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={appointment._id}
                className="p-4 hover:bg-muted/50 transition-colors border-l-2 border-l-primary/20 hover:border-l-primary/50"
              >
                <div className="flex items-start gap-3">
                  {/* Patient Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {appointment.patient?.firstName?.[0] || 'P'}{appointment.patient?.lastName?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Appointment Details - Compact 4-line layout */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: Patient Name + Badges */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {appointment.patient?.firstName || 'Patient'} {appointment.patient?.lastName || 'Name'}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {appointment.appointmentType?.replace('_', ' ') || 'consultation'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {appointment.status?.replace('_', ' ') || 'scheduled'}
                        </Badge>
                      </div>
                    </div>

                    {/* Line 2: Visit Reason */}
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {appointment.visitReason || 'General consultation'}
                    </p>

                    {/* Line 3: Date & Time */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {isToday ? 'Today' : appointmentDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' '}
                        {appointmentDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <Activity className="h-3 w-3" />
                      <span>30min</span>
                      <span className="mx-2">•</span>
                      <Phone className="h-3 w-3" />
                      <span>In-person</span>
                    </div>

                    {/* Line 4: Contact Info */}
                    {appointment.patient?.primaryPhone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.patient.primaryPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

AppointmentsList.displayName = "AppointmentsList";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for schedule appointment dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Handler for opening schedule dialog
  const handleScheduleNew = () => {
    setShowScheduleDialog(true);
  };

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get assigned patients for the patient list
  const assignedPatients = useQuery(
    api.doctorPatients.getPatientsByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Convert patients to the expected format
  const patients = assignedPatients?.filter(p => p.patient).map(relationship => ({
    _id: relationship._id,
    patient: {
      _id: relationship.patient!._id,
      firstName: relationship.patient!.firstName,
      lastName: relationship.patient!.lastName,
      dateOfBirth: relationship.patient!.dateOfBirth,
      primaryPhone: relationship.patient!.primaryPhone
    }
  })) || [];

  const isLoading = !doctorProfile;

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back, {doctorProfile?.title ? `${doctorProfile.title} ` : "Dr. "}{doctorProfile?.lastName || "Doctor"}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your patients, appointments, and medical records with AI-powered insights
        </p>
      </div>

      {/* Main Features Layout: 1/2 Patient Management + 1/4 AI Assistant + 1/4 SOAP Review */}
      <div className="flex-shrink-0 grid gap-3 lg:grid-cols-4">
        {/* Patient Management - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4 flex-1" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Users className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        Patient Management Hub
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Comprehensive Care
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Manage your patient roster, view medical histories, track treatment progress, and coordinate care plans all in one centralized location.
                  </p>

                  <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/patients">
                        <Users className="h-4 w-4 mr-2" />
                        View Patients
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/patients">
                        <Activity className="h-4 w-4 mr-2" />
                        Manage Care
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Assistant - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4 flex-1" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        AI Medical Assistant
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Smart Chat
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Chat with AI about patient records, SOAP notes, and medical insights.
                  </p>

                  <div className="flex gap-2 flex-col mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/assistant/history">
                        <Brain className="h-4 w-4 mr-2" />
                        Chat History
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/assistant">
                        <Brain className="h-4 w-4 mr-2" />
                        Chat Assistant
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SOAP Review - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4 flex-1" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-64 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        SOAP Notes Review
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Clinical Records
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Review and manage patient SOAP notes and clinical documentation.
                  </p>

                  <div className="flex gap-2 flex-col mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/shared-soap/history">
                        <FileText className="h-4 w-4 mr-2" />
                        SOAP History
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/shared-soap">
                        <FileText className="h-4 w-4 mr-2" />
                        Review Notes
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Section - 2 Column Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column - Patient List */}
        <div className="flex flex-col min-h-0">
          <PatientList
            patients={patients}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Appointments */}
        <div className="flex flex-col min-h-0">
          <AppointmentsList
            doctorId={doctorProfile?._id}
            isLoading={isLoading}
            onScheduleNew={handleScheduleNew}
          />
        </div>
      </div>

      {/* Schedule New Appointment Dialog */}
      {doctorProfile && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          doctorProfile={doctorProfile}
        />
      )}
    </div>
  );
}
