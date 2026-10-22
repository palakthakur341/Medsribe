import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { UsePatientAuthReturn } from "../types";

/**
 * Custom hook for patient authentication and profile management
 * Handles session management, role verification, and profile fetching
 */
export function usePatientAuth(): UsePatientAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Memoized computed values
  const isLoading = useMemo(() => status === "loading", [status]);
  const isAuthenticated = useMemo(() => status === "authenticated" && !!session, [status, session]);
  const isPatient = useMemo(() => session?.user?.role === "patient", [session?.user?.role]);
  const user = useMemo(() => session?.user, [session?.user]);

  // Redirect to login function
  const redirectToLogin = useMemo(() => () => {
    router.push("/auth/login");
  }, [router]);

  // Auto-redirect if not authenticated or wrong role
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      redirectToLogin();
    }
  }, [session, status, redirectToLogin]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isPatient,
    user,
    patientProfile,
    redirectToLogin,
  };
}
