import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { UseDoctorChatReturn, DoctorChatMessage, Patient } from "../types";

interface UseDoctorChatProps {
  doctorId: Id<"doctors"> | null;
  patientProfile?: Patient;
}

export function useDoctorChat({ 
  doctorId, 
  patientProfile 
}: UseDoctorChatProps): UseDoctorChatReturn {
  const { data: session } = useSession();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mutations
  const createOrGetConversation = useMutation(api.doctorPatientConversations.createOrGetConversation);
  const sendMessageMutation = useMutation(api.doctorPatientConversations.sendMessage);
  const markAsReadMutation = useMutation(api.doctorPatientConversations.markMessagesAsRead);

  // Get existing conversation
  const conversation = useQuery(
    api.doctorPatientConversations.getConversation,
    patientProfile && doctorId ? { doctorId, patientId: patientProfile._id } : "skip"
  );

  // Get messages for current conversation
  const conversationMessages = useQuery(
    api.doctorPatientConversations.getMessages,
    conversation ? { conversationId: conversation._id } : "skip"
  );

  // Format messages
  const messages: DoctorChatMessage[] = conversationMessages?.map(msg => ({
    _id: msg._id,
    content: msg.content,
    senderId: msg.senderId,
    senderType: msg.senderType,
    createdAt: msg.createdAt,
    isRead: msg.isRead,
    conversationId: msg.conversationId
  })) || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create conversation if it doesn't exist
  const ensureConversation = useCallback(async (): Promise<Id<"doctorPatientConversations"> | null> => {
    if (!doctorId || !patientProfile || !session?.user?.id) return null;

    if (conversation) {
      return conversation._id;
    }

    try {
      const conversationId = await createOrGetConversation({
        doctorId,
        patientId: patientProfile._id,
      });
      return conversationId;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }
  }, [doctorId, patientProfile, session?.user?.id, conversation, createOrGetConversation]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || !session?.user?.id) return;

    const conversationId = await ensureConversation();
    if (!conversationId) return;

    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      await sendMessageMutation({
        conversationId,
        senderId: session.user.id as any,
        senderType: "patient",
        content: currentMessage,
      });

      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      
      // Re-add the message to input if it failed
      setInputMessage(currentMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    isLoading,
    session?.user?.id,
    ensureConversation,
    sendMessageMutation
  ]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const markAsRead = useCallback(async () => {
    if (!conversation || !session?.user?.id) return;

    try {
      await markAsReadMutation({
        conversationId: conversation._id,
        userId: session.user.id as any,
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, [conversation, session?.user?.id, markAsReadMutation]);

  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (conversation && messages.length > 0) {
      markAsRead();
    }
  }, [conversation, messages.length, markAsRead]);

  return {
    messages,
    inputMessage,
    isLoading,
    conversationId: conversation?._id || null,
    setInputMessage,
    sendMessage,
    handleKeyPress,
    markAsRead,
  };
}
