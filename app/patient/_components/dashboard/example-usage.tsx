"use client";

import React from "react";
import { 
  FeatureCard, 
  AppointmentSection, 
  QuickActionGrid, 
  HealthTipCard, 
  DashboardSkeleton 
} from "./index";
import { 
  Sparkles, 
  Brain, 
  Pill, 
  Calendar, 
  CloudSun, 
  MessageCircle, 
  FileText, 
  UserCheck, 
  Mic, 
  History, 
  Bot 
} from "lucide-react";

// Example usage of the extracted dashboard components
export function ExampleDashboardUsage() {
  // Example data
  const appointments = [
    {
      _id: "1",
      doctor: { firstName: "John", lastName: "Smith" },
      appointmentDateTime: "2024-01-15T10:00:00Z",
      status: "confirmed",
      reason: "Regular checkup"
    },
    {
      _id: "2", 
      doctor: { firstName: "Jane", lastName: "Doe" },
      appointmentDateTime: "2024-01-20T14:30:00Z",
      status: "pending",
      reason: "Follow-up consultation"
    }
  ];

  const quickActions = [
    {
      title: "Chat with Doctors",
      description: "Direct messaging",
      icon: <MessageCircle className="h-4 w-4" />,
      href: "/patient/chat"
    },
    {
      title: "Book Appointment", 
      description: "Schedule visit",
      icon: <Calendar className="h-4 w-4" />,
      href: "/patient/appointments/book"
    },
    {
      title: "Medical Records",
      description: "View history", 
      icon: <FileText className="h-4 w-4" />,
      href: "/patient/records"
    },
    {
      title: "Profile Settings",
      description: "Update info",
      icon: <UserCheck className="h-4 w-4" />,
      href: "/patient/settings/profile"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard Components Example</h1>
      
      {/* Feature Cards */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* SOAP Generation Feature */}
        <div className="lg:col-span-2">
          <FeatureCard
            title="Generate SOAP Notes with AI"
            description="Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality."
            icon={<Sparkles className="h-5 w-5 text-white" />}
            badge="AI-Powered"
            gradient={{
              from: "from-blue-50",
              to: "to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
              border: "border-blue-200 dark:border-blue-800",
              iconBg: "bg-blue-500",
              textColor: "text-blue-900 dark:text-blue-100",
              badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
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
        </div>

        {/* AI Assistant Feature */}
        <div className="lg:col-span-1">
          <FeatureCard
            title="AI Medical Assistant"
            description="Chat with your personal AI assistant for medical insights."
            icon={<Brain className="h-4 w-4 text-white" />}
            badge="Smart Chat"
            size="compact"
            gradient={{
              from: "from-purple-50",
              to: "to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
              border: "border-purple-200 dark:border-purple-800",
              iconBg: "bg-purple-500",
              textColor: "text-purple-900 dark:text-purple-100",
              badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            }}
            actions={{
              primary: {
                label: "Chat with Assistant",
                href: "/patient/assistant",
                icon: <Bot className="h-3 w-3 mr-2" />
              }
            }}
          />
        </div>

        {/* Order Medication Feature */}
        <div className="lg:col-span-1">
          <FeatureCard
            title="Order Medication"
            description="Order basic medications from your preferred pharmacy."
            icon={<Pill className="h-4 w-4 text-white" />}
            badge="Pharmacy"
            size="compact"
            gradient={{
              from: "from-green-50",
              to: "to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
              border: "border-green-200 dark:border-green-800",
              iconBg: "bg-green-500",
              textColor: "text-green-900 dark:text-green-100",
              badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            }}
            actions={{
              secondary: {
                label: "Coming Soon",
                href: "#",
                icon: <Pill className="h-3 w-3 mr-2" />,
                disabled: true
              }
            }}
          />
        </div>
      </div>

      {/* Health Tip Card */}
      <HealthTipCard
        title="Health Tips"
        subtitle="72°F • Good air quality"
        tip="Perfect weather for outdoor activities. Stay hydrated and enjoy the fresh air!"
        icon={<CloudSun className="h-4 w-4 text-white" />}
        gradient={{
          from: "from-sky-50",
          to: "to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20",
          border: "border-sky-200 dark:border-sky-800",
          iconBg: "bg-sky-500",
          textColor: "text-sky-900 dark:text-sky-100"
        }}
      />

      {/* Appointment Section */}
      <AppointmentSection
        appointments={appointments}
        title="Appointments & Records"
        description="Quick access to your healthcare"
        icon={<Calendar className="h-4 w-4 text-white" />}
        gradient={{
          from: "from-orange-50",
          to: "to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
          border: "border-orange-200 dark:border-orange-800",
          iconBg: "bg-orange-500",
          textColor: "text-orange-900 dark:text-orange-100",
          itemBg: "bg-orange-100/50 dark:bg-orange-900/20",
          itemBorder: "border-orange-200 dark:border-orange-700"
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

      {/* Quick Actions Grid */}
      <QuickActionGrid
        title="Quick Actions"
        actions={quickActions}
        columns={2}
        variant="compact"
      />

      {/* Dashboard Skeleton Example */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Loading State Example</h3>
        <div className="h-96 overflow-hidden">
          <DashboardSkeleton
            showHeader={true}
            showFeatureCards={true}
            showQuickActions={true}
            showAppointments={true}
            showTreatments={true}
          />
        </div>
      </div>
    </div>
  );
}
