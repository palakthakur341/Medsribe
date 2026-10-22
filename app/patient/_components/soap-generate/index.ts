/**
 * SOAP Generate Module Index
 * Main exports for the new SOAP generation interface
 */

// Main exports - components
export {
  SOAPGenerateHeader,
  SOAPGenerateContent,
  SOAPGenerateSkeleton,
  SOAPErrorBoundary,
  useErrorHandler,
  AudioInputSection,
  TextInputSection,
  ProcessingIndicator,
  QualityMetricsDisplay,
  SOAPResultPreview,
} from "./components";

// Main exports - hooks
export {
  useSOAPGenerate,
  useAudioRecorder,
} from "./hooks";

// Type exports
export type {
  // Core types
  PatientProfile,
  SOAPGenerationState,
  SOAPGenerationActions,
  InputMode,
  
  // Component prop types
  SOAPGenerateHeaderProps,
  SOAPGenerateContentProps,
  SOAPGenerateSkeletonProps,
  AudioInputSectionProps,
  TextInputSectionProps,
  ProcessingIndicatorProps,
  QualityMetricsDisplayProps,
  SOAPResultPreviewProps,
  
  // Hook return types
  UseSOAPGenerateReturn,
  UseAudioRecorderReturn,
  
  // Utility types
  ValidationResult,
  FileValidationResult,
  TextValidationResult,
  SOAPGenerationError,
} from "./types";
