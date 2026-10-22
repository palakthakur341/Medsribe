import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { UseDoctorAuthReturn } from "../types";

/**
 * Custom hook for doctor authentication and profile management
 * 
 * Features:
 * - Session validation and loading states
 * - Automatic redirection for unauthenticated users
 * - Role-based access control for doctors
 * - Doctor profile fetching and completion checking
 * - Memoized computed values for performance
 * 
 * @returns {UseDoctorAuthReturn} Authentication state and utilities
 */
export function useDoctorAuth(): UseDoctorAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Handle authentication redirects
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Memoized computed values
  const isLoading = useMemo(() => {
    return Boolean(status === "loading" || (session?.user?.id && doctorProfile === undefined));
  }, [status, session?.user?.id, doctorProfile]);

  const isAuthenticated = useMemo(() => {
    return !!session && session.user.role === "doctor";
  }, [session]);

  const isDoctor = useMemo(() => {
    return Boolean(session?.user?.role === "doctor");
  }, [session?.user?.role]);

  return {
    isLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile,
  };
}
