import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ChatMessage, UseChatReturn, PatientProfile, ChatAPIResponse } from "../types";

interface UseChatProps {
  currentSessionId: Id<"chatSessions"> | null;
  patientProfile?: PatientProfile;
  onSessionCreated?: (sessionId: Id<"chatSessions">) => void;
}

export function useChat({ 
  currentSessionId, 
  patientProfile, 
  onSessionCreated 
}: UseChatProps): UseChatReturn {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const sessionMessages = useQuery(
    api.chatMessages.getSessionMessages,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Mutations
  const createSessionMutation = useMutation(api.chatSessions.createSession);
  const addMessageMutation = useMutation(api.chatMessages.addMessage);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load session messages when session changes
  useEffect(() => {
    if (sessionMessages) {
      const formattedMessages: ChatMessage[] = sessionMessages.map(msg => ({
        id: msg._id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
        contextUsed: msg.contextUsed,
        relevantDocuments: msg.relevantDocuments,
        relevantDocumentsCount: msg.relevantDocumentsCount,
        processingTime: msg.processingTime,
        // Enhanced RAG fields
        ragResponse: msg.ragResponseData,
        structuredResponse: msg.structuredResponse,
        enhancedRelevantDocuments: msg.enhancedRelevantDocuments,
      }));
      setMessages(formattedMessages);
    } else if (!currentSessionId && patientProfile) {
      // Show welcome message when no session is selected
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hello ${patientProfile.firstName || "there"}! I'm your personal medical assistant. I can help you understand your SOAP notes, track shared information with doctors, monitor prescriptions, and manage appointments. What would you like to know?`,
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [sessionMessages, currentSessionId, patientProfile]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || !patientProfile || !session?.user?.id) return;

    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        sessionId = await createSessionMutation({
          userId: session.user.id as any,
          userType: "patient",
          patientId: patientProfile._id,
          title: inputMessage.trim().slice(0, 50) + (inputMessage.length > 50 ? "..." : ""),
        });
        onSessionCreated?.(sessionId);
      } catch (error) {
        console.error("Failed to create session:", error);
        toast.error("Failed to create chat session");
        return;
      }
    }

    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add user message to database
      await addMessageMutation({
        sessionId,
        userId: session.user.id as any,
        content: currentMessage,
        sender: "user",
      });

      // Call AI API
      const response = await fetch("/api/patient/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          patient_id: patientProfile._id
        }),
      });

      const result: ChatAPIResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success && result.data) {
        // Add assistant message to database with enhanced RAG data
        await addMessageMutation({
          sessionId,
          userId: session.user.id as any,
          content: result.data.message || "I received your message but couldn't generate a proper response.",
          sender: "assistant",
          contextUsed: result.data.context_used || false,
          relevantDocuments: result.data.relevant_documents || [],
          relevantDocumentsCount: result.data.relevant_documents_count || 0,
          processingTime: result.data.processing_time,
          // Enhanced RAG fields
          ragResponseData: result.data.rag_response ? {
            role_type: result.data.rag_response.role_type,
            role_id: result.data.rag_response.role_id,
            query: result.data.rag_response.query,
            response: result.data.rag_response.response,
            similarity_threshold: result.data.rag_response.similarity_threshold,
            max_results: result.data.rag_response.max_results,
            generated_at: result.data.rag_response.generated_at,
          } : undefined,
          structuredResponse: result.data.structured_response,
          enhancedRelevantDocuments: result.data.enhanced_relevant_documents,
        });
      } else {
        throw new Error(result.error || "Failed to get response from assistant");
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to send message: ${errorMessage}`);

      // Add error message to database
      if (sessionId) {
        try {
          await addMessageMutation({
            sessionId,
            userId: session.user.id as any,
            content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. If the problem persists, please contact support.",
            sender: "assistant",
          });
        } catch (dbError) {
          console.error("Failed to save error message:", dbError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    isLoading,
    patientProfile,
    session?.user?.id,
    currentSessionId,
    createSessionMutation,
    addMessageMutation,
    onSessionCreated
  ]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return {
    messages,
    inputMessage,
    isLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress,
  };
}
