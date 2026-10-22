import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UseDoctorConversationsReturn, Patient, DoctorConversation } from "../types";

export function useDoctorConversations(patientProfile?: Patient): UseDoctorConversationsReturn {
  const [selectedDoctorId, setSelectedDoctorId] = useState<Id<"doctors"> | null>(null);
  
  // Get patient conversations
  const conversations = useQuery(
    api.doctorPatientConversations.getPatientConversations,
    patientProfile ? { patientId: patientProfile._id } : "skip"
  );

  // Memoize selected doctor to prevent unnecessary re-renders
  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId || !conversations) return undefined;
    return conversations.find(conv => conv.doctorId === selectedDoctorId)?.doctor;
  }, [selectedDoctorId, conversations]);

  // Memoize handlers
  const selectDoctor = useCallback((doctorId: Id<"doctors">) => {
    setSelectedDoctorId(doctorId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDoctorId(null);
  }, []);

  // Auto-select first conversation if available and none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedDoctorId) {
      // Optionally auto-select the most recent conversation
      const mostRecent = conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt)[0];
      if (mostRecent) {
        setSelectedDoctorId(mostRecent.doctorId);
      }
    }
  }, [conversations, selectedDoctorId]);

  return {
    conversations: conversations as DoctorConversation[] | undefined,
    selectedDoctorId,
    selectedDoctor,
    isLoading: conversations === undefined && !!patientProfile,
    selectDoctor,
    clearSelection,
  };
}
