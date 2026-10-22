/**
 * Types for the new SOAP Generation interface
 */

import { Id } from "@/convex/_generated/dataModel";
import {
  SOAPProcessingResponse,
  ProcessingState,
  EnhancedSOAPNotes,
  QualityMetrics,
  SpecialtyDetection,
  SafetyCheck,
} from "@/lib/types/soap-api";

// ============================================================================
// PATIENT PROFILE TYPES
// ============================================================================

export interface PatientProfile {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email?: string;
  mrn?: string;
  gender: string;
  dateOfBirth: string;
  primaryPhone?: string;
}

// ============================================================================
// SOAP GENERATION TYPES
// ============================================================================

export interface SOAPGenerationState {
  isProcessing: boolean;
  processingState: ProcessingState;
  audioBlob: Blob | null;
  fileName: string;
  textInput: string;
  mode: 'audio' | 'text' | 'conversation';
  error: string | null;
  result: SOAPProcessingResponse | null;
}

export interface SOAPGenerationActions {
  setMode: (mode: 'audio' | 'text' | 'conversation') => void;
  setTextInput: (text: string) => void;
  handleAudioReady: (blob: Blob, fileName: string) => void;
  handleAudioRemove: () => void;
  handleTextProcess: () => Promise<void>;
  handleAudioProcess: () => Promise<void>;
  handleConversationProcess: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  saveSOAPNote: (result: SOAPProcessingResponse) => Promise<any>;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface SOAPGenerateHeaderProps {
  patientProfile?: PatientProfile;
  className?: string;
}

export interface SOAPGenerateContentProps {
  patientProfile?: PatientProfile;
  className?: string;
}

export interface SOAPGenerateSkeletonProps {
  className?: string;
}

export interface AudioInputSectionProps {
  onAudioReady: (blob: Blob, fileName: string) => void;
  onAudioRemove: () => void;
  onProcess: () => Promise<void>;
  audioBlob: Blob | null;
  fileName: string;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export interface TextInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  onProcess: () => Promise<void>;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ConversationInputSectionProps {
  onProcess: () => Promise<void>;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ProcessingIndicatorProps {
  processingState: ProcessingState;
  className?: string;
}

export interface QualityMetricsDisplayProps {
  metrics: QualityMetrics;
  specialty: SpecialtyDetection;
  safety: SafetyCheck;
  className?: string;
}

export interface SOAPResultPreviewProps {
  result: SOAPProcessingResponse;
  className?: string;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseSOAPGenerateReturn {
  state: SOAPGenerationState;
  actions: SOAPGenerationActions;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  hasPermission: boolean | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  removeAudio: () => void;
  formatTime: (seconds: number) => string;
  getTimeRemaining: () => number;
  isNearMaxDuration: () => boolean;
  requestPermission: () => Promise<boolean>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type InputMode = 'audio' | 'text' | 'conversation';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationResult extends ValidationResult {
  file?: File;
}

export interface TextValidationResult extends ValidationResult {
  text?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface SOAPGenerationError {
  type: 'validation' | 'network' | 'processing' | 'unknown';
  message: string;
  details?: string;
  timestamp: number;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Core types
  PatientProfile,
  SOAPGenerationState,
  SOAPGenerationActions,
  
  // Component prop types
  SOAPGenerateHeaderProps,
  SOAPGenerateContentProps,
  SOAPGenerateSkeletonProps,
  AudioInputSectionProps,
  TextInputSectionProps,
  ConversationInputSectionProps,
  ProcessingIndicatorProps,
  QualityMetricsDisplayProps,
  SOAPResultPreviewProps,
  
  // Hook return types
  UseSOAPGenerateReturn,
  UseAudioRecorderReturn,
  
  // Utility types
  InputMode,
  ValidationResult,
  FileValidationResult,
  TextValidationResult,
  SOAPGenerationError,
};
