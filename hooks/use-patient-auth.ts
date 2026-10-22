"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface UsePatientAuthOptions {
  redirectTo?: string;
  showToast?: boolean;
}

export function usePatientAuth(options: UsePatientAuthOptions = {}) {
  const { redirectTo = "/auth/login", showToast = true } = options;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      if (showToast) {
        toast.error("Please log in to access this page");
      }
      router.push(redirectTo);
      return;
    }

    if (session.user.role !== "patient") {
      if (showToast) {
        toast.error("Access denied. Patient account required.");
      }
      router.push(redirectTo);
      return;
    }
  }, [session, status, router, redirectTo, showToast]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session && session.user.role === "patient",
    user: session?.user
  };
}
