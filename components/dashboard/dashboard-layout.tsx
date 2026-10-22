"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { FloatingChatWidget } from "./floating-chat-widget";
import { getNavigationForRole, findCurrentRoute } from "@/lib/navigation";
import { api } from "@/convex/_generated/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Fetch profile data based on user role
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.role === "patient" && session?.user?.id
      ? { userId: session.user.id as any }
      : "skip"
  );

  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.role === "doctor" && session?.user?.id
      ? { userId: session.user.id as any }
      : "skip"
  );

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRole = session.user.role as "doctor" | "patient";
  const navigation = getNavigationForRole(userRole);
  const currentRoute = findCurrentRoute(navigation, pathname);

  // Construct display name from profile data
  let displayName = "";
  if (userRole === "patient" && patientProfile) {
    displayName = `${patientProfile.firstName} ${patientProfile.lastName}`;
  } else if (userRole === "doctor" && doctorProfile) {
    const title = doctorProfile.title ? `${doctorProfile.title} ` : "";
    displayName = `${title}${doctorProfile.firstName} ${doctorProfile.lastName}`;
  }

  return (
    <SidebarProvider>
      <DashboardSidebar
        navigation={navigation}
        userRole={userRole}
        currentPath={pathname}
      />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={userRole === "patient" ? "/patient" : `/${userRole}/dashboard`}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentRoute?.item && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">{currentRoute?.item}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4">
            <DashboardHeader user={session.user} displayName={displayName} />
          </div>
        </header>
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 p-6 pt-4">
            {children}
          </div>
        </div>
      </SidebarInset>
      <FloatingChatWidget userRole={userRole} />
    </SidebarProvider>
  );
}
