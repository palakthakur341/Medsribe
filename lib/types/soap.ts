/**
 * Centralized SOAP Types and Interfaces
 * 
 * This file consolidates all SOAP-related types for consistency across the application.
 * It re-exports types from various modules and provides additional utility types.
 */

// Re-export core SOAP types from the patient history components
export type {
  SOAPNote,
  SOAPUtils,
  SOAPStats,
  SearchFilters,
  UseSOAPHistoryReturn,
  UseSOAPSearchReturn,
  UseSOAPFiltersReturn,
  UseSOAPStatsReturn,

  SOAPNoteCardProps,
  SOAPStatsOverviewProps,
  SOAPSearchBarProps,
  SharedSOAPNote,
  TimelineItem,
  QualityLevel,
  SortOption,
  ViewMode,
  SOAPError,
  LoadingStates,
} from "@/app/patient/_components/soap-history/types";

// Re-export API types
export type {
  AudioProcessingRequest,
  TextProcessingRequest,
  SOAPProcessingResponse,
  ErrorResponse,
  ProcessingData,
  TranscriptionResult,
  ValidationResult,
  SpecialtyDetection,
  QualityMetrics,
  SafetyCheck,
  EnhancedSOAPNotes,
  StructuredSOAP,
  SubjectiveSection,
  ObjectiveSection,
  AssessmentSection,
  PlanSection,
  ProcessingState,
  ProcessingStage,
  MedScribeAPIConfig,
  APIResponse,
  SeverityLevel,
  RiskLevel,
  UrgencyLevel,
  ProblemStatus,
  PriorityLevel,

} from "@/lib/types/soap-api";

// Re-export SOAP generation types
export type {
  PatientProfile,
  SOAPGenerationState,
  SOAPGenerationActions,
  UseSOAPGenerateReturn,
  UseAudioRecorderReturn,
  InputMode,
  ValidationResult as SOAPValidationResult,
  FileValidationResult,
  TextValidationResult,
  SOAPGenerationError,
} from "@/app/patient/_components/soap-generate/types";

// Re-export shared SOAP types
export type {
  Patient,
  SharedSOAPNote as SharedSOAPNoteType,
  SharedSOAPFilters,
  UseSharedSOAPNotesReturn,
  UseSharedSOAPActionsReturn,
  SharedSOAPNoteCardProps,
  SharedSOAPNotesListProps,
  SharedSOAPFiltersProps,
} from "@/app/doctor/_components/shared-soap/types";

// Re-export SOAP viewer types
export type {
  SOAPNote as SOAPViewerNote,
  SOAPViewerConfig,
  SOAPViewerActions,
  SOAPViewerProps,
  UseSOAPViewerReturn,
} from "@/components/ui/soap-viewer";

// ============================================================================
// ADDITIONAL UTILITY TYPES
// ============================================================================

/**
 * Enhanced SOAP Note with AI-powered analysis
 * Uses only the enhanced data structure from the API
 */
export interface ComprehensiveSOAPNote {
  // Core identifiers
  _id: string;
  patientId: string;
  audioRecordingId?: string;
  status?: string;
  timestamp: number;

  // Enhanced data structure (required)
  data: {
    session_id: string;
    patient_id: string;
    enhanced_pipeline: boolean;
    transcription?: {
      text: string;
      confidence: number;
      language: string;
      duration: number;
    };
    validation_result: {
      validated_text: string;
      corrections: any[];
      flags: any[];
      confidence: number;
    };
    specialty_detection: {
      specialty: string;
      confidence: number;
      reasoning: string;
      templates: any;
    };
    soap_notes: any; // Complex nested structure
    quality_metrics: {
      completeness_score: number;
      clinical_accuracy: number;
      documentation_quality: number;
      red_flags: string[];
      missing_information: string[];
    };
    safety_check: {
      is_safe: boolean;
      red_flags: string[];
      critical_items: string[];
    };
    qa_results: {
      quality_score: number;
      errors: string[];
      warnings: string[];
      recommendations: string[];
      critical_flags: any[];
      approved: boolean;
    };
    document?: {
      document_path?: string;
      success: boolean;
      error?: string;
    };

  };
  
  // Timestamps
  createdAt: number;
  updatedAt: number;

  // Optional patient info for display
  patientName?: string;
}

/**
 * SOAP Note creation payload for API
 */
export interface SOAPNoteCreatePayload {
  patientId: string;
  audioRecordingId?: string;
  status?: string;
  data: any; // The complete enhanced API response data structure
}

/**
 * SOAP Note update payload
 */
export interface SOAPNoteUpdatePayload {
  status?: string;
  data?: any;
  updatedAt: number;
}

/**
 * SOAP Note query filters
 */
export interface SOAPNoteQueryFilters {
  patientId?: string;
  status?: string;
  specialty?: string;
  safetyStatus?: boolean;
  hasEnhancedData?: boolean;
  qualityRange?: { min: number; max: number };
  dateRange?: { from: Date; to: Date };
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'quality' | 'specialty' | 'safety';
  sortOrder?: 'asc' | 'desc';
}

/**
 * SOAP Note statistics
 */
export interface SOAPNoteStatistics {
  totalNotes: number;
  enhancedNotesCount: number;
  averageQuality: number;
  safeNotesCount: number;
  unsafeNotesCount: number;
  redFlagsCount: number;
  specialtyBreakdown: Record<string, number>;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  avgTranscriptionConfidence: number;
  recentNotesCount: number;
}

/**
 * Type guards for SOAP notes
 */
export const SOAPTypeGuards = {
  hasEnhancedData: (note: any): note is ComprehensiveSOAPNote => {
    return note?.data?.enhanced_pipeline === true;
  },

  isValidSOAPNote: (note: any): note is ComprehensiveSOAPNote => {
    return !!(note?._id && note?.patientId && note?.timestamp && note?.data);
  },

  hasQualityMetrics: (note: any): boolean => {
    return !!(note?.data?.quality_metrics);
  },

  hasSafetyAssessment: (note: any): boolean => {
    return note?.data?.safety_check?.is_safe !== undefined;
  },
};

/**
 * SOAP Note utility functions type
 */
export interface SOAPNoteUtils {
  getSubjective: (note: ComprehensiveSOAPNote) => string;
  getObjective: (note: ComprehensiveSOAPNote) => string;
  getAssessment: (note: ComprehensiveSOAPNote) => string;
  getPlan: (note: ComprehensiveSOAPNote) => string;
  getQualityScore: (note: ComprehensiveSOAPNote) => number | undefined;
  getSpecialty: (note: ComprehensiveSOAPNote) => string | undefined;
  getSafetyStatus: (note: ComprehensiveSOAPNote) => boolean | undefined;
  getRedFlags: (note: ComprehensiveSOAPNote) => string[];
  getRecommendations: (note: ComprehensiveSOAPNote) => string[];
  getSessionId: (note: ComprehensiveSOAPNote) => string | undefined;
  getProcessingTime: (note: ComprehensiveSOAPNote) => string | undefined;
  hasEnhancedData: (note: ComprehensiveSOAPNote) => boolean;
  getChiefComplaint: (note: ComprehensiveSOAPNote) => string | undefined;
  getPrimaryDiagnosis: (note: ComprehensiveSOAPNote) => string | undefined;
  getVitalSigns: (note: ComprehensiveSOAPNote) => any;
  getMedications: (note: ComprehensiveSOAPNote) => string[];
  getAllergies: (note: ComprehensiveSOAPNote) => string[];
}
