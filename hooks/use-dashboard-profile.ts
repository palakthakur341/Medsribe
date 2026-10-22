"use client";

import { useSession, signOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface DashboardProfileData {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userRole: "doctor" | "patient";
  isLoading: boolean;
}

export function useDashboardProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch profile data based on user role
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.role === "patient" && session?.user?.id
      ? { userId: session.user.id as Id<"users"> }
      : "skip"
  );

  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.role === "doctor" && session?.user?.id
      ? { userId: session.user.id as Id<"users"> }
      : "skip"
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut({ 
        callbackUrl: "/auth/login",
        redirect: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect
      router.push("/auth/login");
    }
  }, [router]);

  // Construct profile data
  const profileData: DashboardProfileData = {
    userName: "",
    userEmail: session?.user?.email || "",
    userAvatar: session?.user?.image,
    userRole: (session?.user?.role as "doctor" | "patient") || "patient",
    isLoading: status === "loading" || 
               (session?.user?.role === "patient" && patientProfile === undefined) ||
               (session?.user?.role === "doctor" && doctorProfile === undefined)
  };

  // Set display name based on profile data
  if (session?.user?.role === "patient" && patientProfile) {
    profileData.userName = `${patientProfile.firstName} ${patientProfile.lastName}`;
  } else if (session?.user?.role === "doctor" && doctorProfile) {
    const title = doctorProfile.title ? `${doctorProfile.title} ` : "";
    profileData.userName = `${title}${doctorProfile.firstName} ${doctorProfile.lastName}`;
  } else if (session?.user?.name) {
    // Fallback to session name
    profileData.userName = session.user.name;
  } else {
    // Final fallback
    profileData.userName = "User";
  }

  return {
    ...profileData,
    handleLogout,
    session,
    patientProfile,
    doctorProfile
  };
}
