import { Id } from "@/convex/_generated/dataModel";
import {
  RelevantDocument as RAGRelevantDocument,
  StructuredResponse as RAGStructuredResponse,
  SearchResponse as RAGSearchResponse
} from "@/lib/services/rag-api";

// Core interfaces for chat functionality
export interface RelevantDocument {
  id: string;
  event_type: string;
  content_preview: string;
  similarity_score: number;
  created_at: string;
  metadata: any;
}

// Enhanced RAG-compatible relevant document
export interface EnhancedRelevantDocument extends RAGRelevantDocument {
  content_preview?: string; // For backward compatibility
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  contextUsed?: boolean;
  relevantDocuments?: RelevantDocument[];
  relevantDocumentsCount?: number;
  processingTime?: number;
  // Enhanced RAG fields
  ragResponse?: RAGSearchResponse;
  structuredResponse?: RAGStructuredResponse;
  enhancedRelevantDocuments?: EnhancedRelevantDocument[];
}

export interface ChatSession {
  _id: Id<"chatSessions">;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  userId: string;
  userType: string;
  patientId: Id<"patients">;
  createdAt: string;
}

export interface PatientProfile {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  email?: string;
  userId: string;
  // Add other patient profile fields as needed
}

// Hook return types
export interface UseChatReturn {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  setInputMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export interface UseChatSessionsReturn {
  sessions: ChatSession[] | undefined;
  currentSessionId: Id<"chatSessions"> | null;
  isLoading: boolean;
  createNewSession: () => Promise<void>;
  selectSession: (sessionId: Id<"chatSessions">) => void;
  deleteSession: (sessionId: Id<"chatSessions">) => Promise<void>;
}

export interface UsePatientProfileReturn {
  profile: PatientProfile | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Component props interfaces
export interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  patientProfile?: PatientProfile;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export interface SessionListProps {
  sessions: ChatSession[] | undefined;
  currentSessionId: Id<"chatSessions"> | null;
  onSelectSession: (sessionId: Id<"chatSessions">) => void;
  onDeleteSession: (sessionId: Id<"chatSessions">) => Promise<void>;
  onNewSession: () => Promise<void>;
  isLoading: boolean;
  className?: string;
}

export interface RelevantDocumentsSectionProps {
  documents: RelevantDocument[];
}

export interface AssistantSkeletonProps {
  // No props needed for skeleton
}

// API response types
export interface ChatAPIResponse {
  success: boolean;
  data?: {
    message: string;
    context_used: boolean;
    relevant_documents: RelevantDocument[];
    relevant_documents_count: number;
    processing_time?: number;
    // Enhanced RAG fields
    rag_response?: RAGSearchResponse;
    structured_response?: RAGStructuredResponse;
    enhanced_relevant_documents?: EnhancedRelevantDocument[];
  };
  error?: string;
}

// Enhanced API response with full RAG integration
export interface EnhancedChatAPIResponse {
  success: boolean;
  data?: RAGSearchResponse;
  error?: string;
}

// Quick suggestion types
export interface QuickSuggestion {
  label: string;
  message: string;
}

export const QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { label: "Latest Care Plan", message: "What is my latest care plan?" },
  { label: "Recent Symptoms", message: "Show me my recent symptoms" },
  { label: "Current Medications", message: "What medications am I taking?" },
];

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

// Error types
export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}
