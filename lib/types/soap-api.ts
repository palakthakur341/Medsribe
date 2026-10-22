/**
 * Enhanced SOAP Generation API Types
 * Based on the MedScribe Enhanced SOAP Generation Integration Guide
 */

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface AudioProcessingRequest {
  audio_file: File;  // Audio file (.mp3, .wav, .m4a, .flac)
  patient_id: string;
}

export interface TextProcessingRequest {
  text: string;      // Transcribed medical text
  patient_id: string;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

export interface SOAPProcessingResponse {
  status: "success" | "error";
  message: string;
  timestamp: string;
  data: ProcessingData;
}

export interface ErrorResponse {
  status: "error";
  message: string;
  timestamp: string;
  error?: string;
}

export interface ProcessingData {
  status: "completed";
  message: string;
  session_id: string;
  patient_id: string;
  enhanced_pipeline: boolean;

  // Transcription (only for process-audio)
  transcription?: TranscriptionResult;

  validation_result: ValidationResult;
  specialty_detection: SpecialtyDetection;
  soap_notes: EnhancedSOAPNotes;
  quality_metrics: QualityMetrics;
  safety_check: SafetyCheck;

  // Quality assessment
  qa_results: {
    quality_score: number;
    errors: string[];
    warnings: string[];
    recommendations: string[];
    critical_flags: any[];
    approved: boolean;
  };

  // Document generation results
  document?: {
    document_path?: string;
    success: boolean;
    error?: string;
  };


}

// ============================================================================
// CORE DATA INTERFACES
// ============================================================================

export interface TranscriptionResult {
  text: string;
  confidence: number;  // 0.0 to 1.0
  language: string;    // e.g., "en"
  duration: number;    // in seconds
}

export interface ValidationResult {
  validated_text: string;
  corrections: any[];
  flags: string[];     // Medical flags identified
  confidence: number;  // 0.0 to 1.0
}

export interface SpecialtyDetection {
  specialty: string;           // e.g., "Cardiology", "Endocrinology"
  confidence: number;          // 0.0 to 1.0
  reasoning: string;           // Explanation for specialty detection
  templates: any;              // Specialty-specific templates
}

export interface QualityMetrics {
  completeness_score: number;      // 0.0 to 1.0
  clinical_accuracy: number;       // 0.0 to 1.0
  documentation_quality: number;   // 0.0 to 1.0
  red_flags: string[];            // Clinical red flags
  missing_information: string[];   // Missing required fields
}

export interface SafetyCheck {
  is_safe: boolean;
  red_flags: string[];      // Safety concerns
  critical_items: string[]; // Critical safety items
}

// ============================================================================
// ENHANCED SOAP STRUCTURE
// ============================================================================

export interface EnhancedSOAPNotes {
  soap_notes: StructuredSOAP;
  quality_metrics: QualityMetrics;
  session_id: string;
  specialty: string;
  // Legacy format for backward compatibility
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd_codes: string[];
}

export interface StructuredSOAP {
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;
  clinical_notes: string;
}

// ============================================================================
// DETAILED SOAP SECTIONS
// ============================================================================

export interface SubjectiveSection {
  chief_complaint: string;
  history_present_illness: string;
  review_of_systems: string[];
  past_medical_history: string[];
  medications: string[];
  allergies: string[];
  social_history: string;
}

export interface ObjectiveSection {
  vital_signs: {
    blood_pressure?: string;
    heart_rate?: string;
    temperature?: string;
    respiratory_rate?: string;
  };
  physical_exam: Record<string, string>;
  diagnostic_results: string[];
  mental_status: string;
  functional_status: string;
}

export interface AssessmentSection {
  primary_diagnosis: {
    diagnosis: string;
    icd10_code: string;
    confidence: number;
    severity: "mild" | "moderate" | "severe";
    clinical_reasoning: string;
  };
  differential_diagnoses: Array<{
    diagnosis: string;
    icd10_code: string;
    probability: number;
    ruling_out_criteria: string;
  }>;
  problem_list: Array<{
    problem: string;
    status: "active" | "chronic" | "resolved";
    priority: "high" | "medium" | "low";
  }>;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_factors: string[];
  prognosis: string;
}

export interface PlanSection {
  diagnostic_workup: string[];
  treatments: string[];
  medications: string[];
  follow_up: Array<{
    provider: string;
    timeframe: string;
    urgency: "routine" | "urgent" | "stat";
  }>;
  patient_education: string[];
  referrals: string[];
}

// ============================================================================
// PROCESSING STATE TYPES
// ============================================================================

export type ProcessingStage = 
  | 'uploading' 
  | 'transcribing' 
  | 'validating'
  | 'analyzing' 
  | 'generating' 
  | 'complete'
  | 'error';

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: ProcessingStage;
  message: string;
  error?: string;
}

// ============================================================================
// API CLIENT TYPES
// ============================================================================

export interface MedScribeAPIConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SeverityLevel = "mild" | "moderate" | "severe";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type UrgencyLevel = "routine" | "urgent" | "stat";
export type ProblemStatus = "active" | "chronic" | "resolved";
export type PriorityLevel = "high" | "medium" | "low";



// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Request types
  AudioProcessingRequest,
  TextProcessingRequest,
  
  // Response types
  SOAPProcessingResponse,
  ErrorResponse,
  ProcessingData,
  
  // Core data types
  TranscriptionResult,
  ValidationResult,
  SpecialtyDetection,
  QualityMetrics,
  SafetyCheck,
  
  // SOAP structure types
  EnhancedSOAPNotes,
  StructuredSOAP,
  SubjectiveSection,
  ObjectiveSection,
  AssessmentSection,
  PlanSection,
  
  // Processing types
  ProcessingState,
  ProcessingStage,
  
  // API types
  MedScribeAPIConfig,
  APIResponse,
  
  // Utility types
  SeverityLevel,
  RiskLevel,
  UrgencyLevel,
  ProblemStatus,
  PriorityLevel,
  

};
