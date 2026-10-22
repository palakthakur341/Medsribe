import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { UseReferralsAuthReturn } from "../types";

/**
 * Custom hook for managing referrals authentication and doctor profile validation
 * 
 * Features:
 * - Handles session authentication
 * - Validates doctor role
 * - Fetches doctor profile
 * - Manages redirects for unauthorized access
 * 
 * @returns {UseReferralsAuthReturn} Authentication state and profile data
 */
export function useReferralsAuth(): UseReferralsAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Handle authentication redirects
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

  // Determine loading state
  const isLoading = useMemo(() => {
    return status === "loading" || (session?.user?.id && doctorProfile === undefined);
  }, [status, session?.user?.id, doctorProfile]);

  // Determine authentication state
  const isAuthenticated = useMemo(() => {
    return !!session && session.user.role === "doctor";
  }, [session]);

  // Determine if user is a doctor
  const isDoctor = useMemo(() => {
    return session?.user?.role === "doctor";
  }, [session?.user?.role]);

  return {
    isLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile,
  };
}
