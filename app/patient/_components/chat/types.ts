import { Id } from "@/convex/_generated/dataModel";

// Core interfaces for doctor-patient chat functionality
export interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
  userId?: Id<"users">;
}

export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  userId: Id<"users">;
}

export interface DoctorChatMessage {
  _id: string;
  content: string;
  senderId: string;
  senderType: "doctor" | "patient";
  createdAt: number;
  isRead: boolean;
  conversationId: Id<"doctorPatientConversations">;
}

export interface DoctorConversation {
  _id: Id<"doctorPatientConversations">;
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  lastMessageAt: number;
  doctor?: Doctor;
  patient?: Patient;
  unreadCount?: number;
}

// Hook return types
export interface UsePatientProfileReturn {
  profile: Patient | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface UseDoctorConversationsReturn {
  conversations: DoctorConversation[] | undefined;
  selectedDoctorId: Id<"doctors"> | null;
  selectedDoctor: Doctor | undefined;
  isLoading: boolean;
  selectDoctor: (doctorId: Id<"doctors">) => void;
  clearSelection: () => void;
}

export interface UseDoctorChatReturn {
  messages: DoctorChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  conversationId: Id<"doctorPatientConversations"> | null;
  setInputMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  markAsRead: () => Promise<void>;
}

// Component props interfaces
export interface DoctorMessageListProps {
  messages: DoctorChatMessage[];
  isLoading: boolean;
  doctorName: string;
  patientName?: string;
  currentUserId?: string;
  className?: string;
}

export interface DoctorChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface DoctorConversationListProps {
  conversations: DoctorConversation[] | undefined;
  selectedDoctorId: Id<"doctors"> | null;
  onConversationSelect: (doctorId: Id<"doctors">) => void;
  className?: string;
  isLoading?: boolean;
}

export interface DoctorConversationItemProps {
  conversation: DoctorConversation;
  isSelected: boolean;
  onClick: (doctorId: Id<"doctors">) => void;
}

export interface DoctorChatInterfaceProps {
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  doctorName: string;
  onClose?: () => void;
  className?: string;
}

export interface ChatPageHeaderProps {
  title: string;
  description: string;
  onBack?: () => void;
}

export interface ChatEmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

// API response types
export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ConversationResponse {
  success: boolean;
  conversationId?: Id<"doctorPatientConversations">;
  error?: string;
}

// Loading states
export type ChatLoadingState = "idle" | "loading" | "sending" | "error";

// Error types
export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}

// Chat status types
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

// Enhanced message interface with status
export interface EnhancedDoctorChatMessage extends DoctorChatMessage {
  status?: MessageStatus;
  timestamp?: Date;
  isOptimistic?: boolean; // For optimistic updates
}

// Conversation filters and sorting
export type ConversationSortBy = "lastMessage" | "doctorName" | "unreadCount";
export type ConversationFilterBy = "all" | "unread" | "recent";

export interface ConversationFilters {
  sortBy: ConversationSortBy;
  filterBy: ConversationFilterBy;
  searchQuery?: string;
}

// Chat settings
export interface ChatSettings {
  autoMarkAsRead: boolean;
  showTypingIndicator: boolean;
  enableNotifications: boolean;
  messagePageSize: number;
}

// Typing indicator
export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

// Message pagination
export interface MessagePagination {
  hasMore: boolean;
  cursor?: string;
  pageSize: number;
  totalCount?: number;
}

// Real-time events
export type ChatEventType = "message" | "typing" | "read" | "online" | "offline";

export interface ChatEvent {
  type: ChatEventType;
  conversationId: Id<"doctorPatientConversations">;
  userId: string;
  data: any;
  timestamp: number;
}
