"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UsePatientAuthReturn } from "../types";

/**
 * Custom hook for handling patient authentication and session management
 *
 * Features:
 * - Session validation and loading states
 * - Automatic redirection for unauthenticated users
 * - Role-based access control for patients
 * - Patient profile fetching
 * - Memoized computed values for performance
 *
 * @returns {UsePatientAuthReturn} Authentication state and utilities
 */
export function usePatientAuth(): UsePatientAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Memoized computed values for performance
  const isLoading = useMemo(() =>
    status === "loading" || (session?.user?.id && patientProfile === undefined),
    [status, session?.user?.id, patientProfile]
  );

  const isAuthenticated = useMemo(() => status === "authenticated" && !!session, [status, session]);
  const isPatient = useMemo(() =>
    isAuthenticated && session?.user?.role === "patient",
    [isAuthenticated, session?.user?.role]
  );

  // Memoized redirect function
  const redirectToLogin = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  // Handle authentication and authorization
  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect if not authenticated
    if (!session) {
      redirectToLogin();
      return;
    }

    // Redirect if not a patient
    if (session.user.role !== "patient") {
      redirectToLogin();
      return;
    }
  }, [session, status, isLoading, redirectToLogin]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isPatient,
    user: session?.user,
    patientProfile,
    redirectToLogin,
  };
}
