import { Id } from "@/convex/_generated/dataModel";
import {
  RelevantDocument as RAGRelevantDocument,
  StructuredResponse as RAGStructuredResponse,
  SearchResponse as RAGSearchResponse
} from "@/lib/services/rag-api";

// Core interfaces for doctor assistant chat functionality
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
  doctorId: Id<"doctors">;
  createdAt: string;
}

export interface DoctorProfile {
  _id: Id<"doctors">;
  firstName?: string;
  lastName?: string;
  title?: string;
  email?: string;
  phone?: string;
  primarySpecialty?: string;
  licenseNumber?: string;
  npiNumber?: string;
  deaNumber?: string;
  userId: string;
  // Add other doctor profile fields as needed
  secondarySpecialties?: string[];
  boardCertifications?: string[];
  medicalSchool?: string;
  residency?: string;
  fellowship?: string;
  yearsOfExperience?: number;
  practiceName?: string;
  department?: string;
  hospitalAffiliations?: string[];
  isAcceptingNewPatients?: boolean;
  consultationFee?: number;
  languagesSpoken?: string[];
  bio?: string;
}

// Hook return types
export interface UseDoctorChatReturn {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  setInputMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export interface UseDoctorChatSessionsReturn {
  sessions: ChatSession[] | undefined;
  currentSessionId: Id<"chatSessions"> | null;
  isLoading: boolean;
  createNewSession: () => Promise<void>;
  selectSession: (sessionId: Id<"chatSessions">) => void;
  deleteSession: (sessionId: Id<"chatSessions">) => Promise<void>;
}

export interface UseDoctorProfileReturn {
  profile: DoctorProfile | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Component props interfaces (reusing from patient assistant but with doctor types)
export interface DoctorMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  doctorProfile?: DoctorProfile;
}

export interface DoctorChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export interface DoctorSessionListProps {
  sessions: ChatSession[] | undefined;
  currentSessionId: Id<"chatSessions"> | null;
  onSelectSession: (sessionId: Id<"chatSessions">) => void;
  onDeleteSession: (sessionId: Id<"chatSessions">) => Promise<void>;
  onNewSession: () => Promise<void>;
  isLoading: boolean;
}

export interface DoctorChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  doctorProfile?: DoctorProfile;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export interface RelevantDocumentsSectionProps {
  documents: RelevantDocument[];
}

export interface DoctorAssistantSkeletonProps {
  // No props needed for skeleton
}

// API response types
export interface DoctorChatAPIResponse {
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
export interface EnhancedDoctorChatAPIResponse {
  success: boolean;
  data?: RAGSearchResponse;
  error?: string;
}

// Quick suggestion types for doctors
export interface QuickSuggestion {
  label: string;
  message: string;
}

export const DOCTOR_QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { label: "Patient Records", message: "Show me recent patient records" },
  { label: "SOAP Analysis", message: "Analyze the latest SOAP notes" },
  { label: "Clinical Insights", message: "Provide clinical insights for my patients" },
  { label: "Documentation Help", message: "Help me with medical documentation" },
];

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

// Error types
export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}

// Profile completion helper
export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}
