import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { UseDoctorChatSessionsReturn, DoctorProfile } from "../types";

interface UseDoctorChatSessionsProps {
  doctorProfile?: DoctorProfile;
}

export function useDoctorChatSessions({ 
  doctorProfile 
}: UseDoctorChatSessionsProps): UseDoctorChatSessionsReturn {
  const { data: session } = useSession();
  const [currentSessionId, setCurrentSessionId] = useState<Id<"chatSessions"> | null>(null);

  // Get chat sessions
  const sessions = useQuery(
    api.chatSessions.getUserSessions,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Mutations
  const createSession = useMutation(api.chatSessions.createSession);
  const deleteSessionMutation = useMutation(api.chatSessions.deleteSession);

  // Auto-select first session if available
  useEffect(() => {
    if (sessions && sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0]._id);
    }
  }, [sessions, currentSessionId]);

  const createNewSession = async () => {
    if (!session?.user?.id || !doctorProfile) {
      toast.error("Unable to create session. Please try again.");
      return;
    }

    try {
      const sessionId = await createSession({
        userId: session.user.id as any,
        userType: "doctor",
        doctorId: doctorProfile._id,
        title: `Chat ${new Date().toLocaleDateString()}`,
      });

      setCurrentSessionId(sessionId);
      toast.success("New chat session created");
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create new chat session");
    }
  };

  const selectSession = (sessionId: Id<"chatSessions">) => {
    setCurrentSessionId(sessionId);
  };

  const deleteSession = async (sessionId: Id<"chatSessions">) => {
    try {
      await deleteSessionMutation({ sessionId });
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete chat session");
    }
  };

  return {
    sessions,
    currentSessionId,
    isLoading: sessions === undefined && !!session?.user?.id,
    createNewSession,
    selectSession,
    deleteSession,
  };
}
