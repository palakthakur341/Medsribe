import { useMemo, useCallback } from "react";
import { useChat } from "./useChat";
import { Id } from "@/convex/_generated/dataModel";
import { PatientProfile } from "../types";

interface UseOptimizedChatProps {
  currentSessionId: Id<"chatSessions"> | null;
  patientProfile?: PatientProfile;
  onSessionCreated?: (sessionId: Id<"chatSessions">) => void;
}

export function useOptimizedChat(props: UseOptimizedChatProps) {
  const chat = useChat(props);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => chat.messages, [chat.messages]);

  // Memoize handlers to prevent child re-renders
  const memoizedHandlers = useMemo(() => ({
    setInputMessage: chat.setInputMessage,
    sendMessage: chat.sendMessage,
    handleKeyPress: chat.handleKeyPress,
  }), [chat.setInputMessage, chat.sendMessage, chat.handleKeyPress]);

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

  return {
    messages: memoizedMessages,
    inputMessage: chat.inputMessage,
    isLoading: chat.isLoading,
    setInputMessage: optimizedSetInputMessage,
    sendMessage: optimizedSendMessage,
    handleKeyPress: optimizedHandleKeyPress,
  };
}
