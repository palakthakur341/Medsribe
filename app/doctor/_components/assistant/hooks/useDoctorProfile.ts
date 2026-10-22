import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { UseDoctorProfileReturn } from "../types";

export function useDoctorProfile(): UseDoctorProfileReturn {
  const { data: session } = useSession();
  
  const profile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  return {
    profile,
    isLoading: profile === undefined && !!session?.user?.id,
    error: null, // Convex handles errors differently, could be enhanced
  };
}
