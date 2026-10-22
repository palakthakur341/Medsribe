import { useMemo, useCallback } from "react";
import { useDoctorChat } from "./useDoctorChat";
import { Id } from "@/convex/_generated/dataModel";
import { Patient } from "../types";

interface UseOptimizedDoctorChatProps {
  doctorId: Id<"doctors"> | null;
  patientProfile?: Patient;
}

export function useOptimizedDoctorChat(props: UseOptimizedDoctorChatProps) {
  const chat = useDoctorChat(props);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => chat.messages, [chat.messages]);

  // Memoize handlers to prevent child re-renders
  const memoizedHandlers = useMemo(() => ({
    setInputMessage: chat.setInputMessage,
    sendMessage: chat.sendMessage,
    handleKeyPress: chat.handleKeyPress,
    markAsRead: chat.markAsRead,
  }), [chat.setInputMessage, chat.sendMessage, chat.handleKeyPress, chat.markAsRead]);

  // Optimize input change handler
  const optimizedSetInputMessage = useCallback((value: string) => {
    memoizedHandlers.setInputMessage(value);
  }, [memoizedHandlers.setInputMessage]);

  // Optimize send message handler
  const optimizedSendMessage = useCallback(() => {
    memoizedHandlers.sendMessage();
  }, [memoizedHandlers.sendMessage]);

  // Optimize key press handler
  const optimizedHandleKeyPress = useCallback((e: React.KeyboardEvent) => {
    memoizedHandlers.handleKeyPress(e);
  }, [memoizedHandlers.handleKeyPress]);

  // Optimize mark as read handler
  const optimizedMarkAsRead = useCallback(() => {
    memoizedHandlers.markAsRead();
  }, [memoizedHandlers.markAsRead]);

  return {
    messages: memoizedMessages,
    inputMessage: chat.inputMessage,
    isLoading: chat.isLoading,
    conversationId: chat.conversationId,
    setInputMessage: optimizedSetInputMessage,
    sendMessage: optimizedSendMessage,
    handleKeyPress: optimizedHandleKeyPress,
    markAsRead: optimizedMarkAsRead,
  };
}
