import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UsePatientProfileReturn } from "../types";

export function usePatientProfile(): UsePatientProfileReturn {
  const { data: session } = useSession();
  
  const profile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  return {
    profile,
    isLoading: profile === undefined && !!session?.user?.id,
    error: null, // Convex handles errors differently, could be enhanced
  };
}
