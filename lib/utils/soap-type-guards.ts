/**
 * SOAP Type Guards and Validation Utilities
 * 
 * This file provides type guards and validation functions for SOAP-related data structures.
 * It ensures type safety and helps with runtime validation of SOAP data.
 */

import type {
  ComprehensiveSOAPNote,
  SOAPProcessingResponse,
  ProcessingData,
  TranscriptionResult,
  ValidationResult,
  SpecialtyDetection,
  QualityMetrics,
  SafetyCheck,
  EnhancedSOAPNotes,
  StructuredSOAP,
} from "@/lib/types/soap";

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an object is a valid SOAP note
 */
export function isSOAPNote(obj: any): obj is ComprehensiveSOAPNote {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj._id === 'string' &&
    typeof obj.patientId === 'string' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  );
}

/**
 * Type guard to check if a SOAP note has enhanced data
 */
export function hasEnhancedData(note: any): note is ComprehensiveSOAPNote & { data: ProcessingData } {
  return (
    isSOAPNote(note) &&
    note.data &&
    typeof note.data === 'object' &&
    note.data.enhanced_pipeline === true &&
    typeof note.data.session_id === 'string' &&
    typeof note.data.patient_id === 'string'
  );
}



/**
 * Type guard to check if an object is a valid SOAP processing response
 */
export function isSOAPProcessingResponse(obj: any): obj is SOAPProcessingResponse {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.status === 'success' || obj.status === 'error') &&
    typeof obj.message === 'string' &&
    typeof obj.timestamp === 'string' &&
    (obj.status === 'error' || (obj.data && typeof obj.data === 'object'))
  );
}

/**
 * Type guard to check if an object is valid transcription result
 */
export function isTranscriptionResult(obj: any): obj is TranscriptionResult {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.text === 'string' &&
    typeof obj.confidence === 'number' &&
    typeof obj.language === 'string' &&
    typeof obj.duration === 'number'
  );
}

/**
 * Type guard to check if an object is valid validation result
 */
export function isValidationResult(obj: any): obj is ValidationResult {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.validated_text === 'string' &&
    Array.isArray(obj.corrections) &&
    Array.isArray(obj.flags) &&
    typeof obj.confidence === 'number'
  );
}

/**
 * Type guard to check if an object is valid specialty detection
 */
export function isSpecialtyDetection(obj: any): obj is SpecialtyDetection {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.specialty === 'string' &&
    typeof obj.confidence === 'number' &&
    typeof obj.reasoning === 'string'
  );
}

/**
 * Type guard to check if an object is valid quality metrics
 */
export function isQualityMetrics(obj: any): obj is QualityMetrics {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.completeness_score === 'number' &&
    typeof obj.clinical_accuracy === 'number' &&
    typeof obj.documentation_quality === 'number' &&
    Array.isArray(obj.red_flags) &&
    Array.isArray(obj.missing_information)
  );
}

/**
 * Type guard to check if an object is valid safety check
 */
export function isSafetyCheck(obj: any): obj is SafetyCheck {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.is_safe === 'boolean' &&
    Array.isArray(obj.red_flags) &&
    Array.isArray(obj.critical_items)
  );
}

/**
 * Type guard to check if an object is valid enhanced SOAP notes
 */
export function isEnhancedSOAPNotes(obj: any): obj is EnhancedSOAPNotes {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.soap_notes &&
    typeof obj.soap_notes === 'object' &&
    isQualityMetrics(obj.quality_metrics) &&
    typeof obj.session_id === 'string' &&
    typeof obj.specialty === 'string'
  );
}

/**
 * Type guard to check if an object is valid structured SOAP
 */
export function isStructuredSOAP(obj: any): obj is StructuredSOAP {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.subjective &&
    typeof obj.subjective === 'object' &&
    obj.objective &&
    typeof obj.objective === 'object' &&
    obj.assessment &&
    typeof obj.assessment === 'object' &&
    obj.plan &&
    typeof obj.plan === 'object' &&
    typeof obj.clinical_notes === 'string'
  );
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a SOAP note and returns validation errors
 */
export function validateSOAPNote(note: any): string[] {
  const errors: string[] = [];

  if (!isSOAPNote(note)) {
    errors.push('Invalid SOAP note structure');
    return errors;
  }

  // Check for required fields
  if (!note._id) errors.push('Missing SOAP note ID');
  if (!note.patientId) errors.push('Missing patient ID');
  if (!note.timestamp) errors.push('Missing timestamp');
  if (!note.createdAt) errors.push('Missing creation timestamp');
  if (!note.updatedAt) errors.push('Missing update timestamp');

  // Check for enhanced data (required)
  const hasEnhanced = hasEnhancedData(note);

  if (!hasEnhanced) {
    errors.push('SOAP note must have enhanced data structure');
  }

  // Validate enhanced data
  if (hasEnhanced) {
    if (!note.data.session_id) errors.push('Missing session ID in enhanced data');
    if (!note.data.patient_id) errors.push('Missing patient ID in enhanced data');
    if (note.data.enhanced_pipeline !== true) errors.push('Enhanced pipeline flag must be true');

    // Validate nested structures
    if (note.data.transcription && !isTranscriptionResult(note.data.transcription)) {
      errors.push('Invalid transcription result structure');
    }
    if (!isValidationResult(note.data.validation_result)) {
      errors.push('Invalid validation result structure');
    }
    if (!isSpecialtyDetection(note.data.specialty_detection)) {
      errors.push('Invalid specialty detection structure');
    }
    if (!isQualityMetrics(note.data.quality_metrics)) {
      errors.push('Invalid quality metrics structure');
    }
    if (!isSafetyCheck(note.data.safety_check)) {
      errors.push('Invalid safety check structure');
    }
  }

  return errors;
}

/**
 * Validates a SOAP processing response
 */
export function validateSOAPProcessingResponse(response: any): string[] {
  const errors: string[] = [];

  if (!isSOAPProcessingResponse(response)) {
    errors.push('Invalid SOAP processing response structure');
    return errors;
  }

  if (response.status === 'success') {
    if (!response.data) {
      errors.push('Success response must include data');
    } else {
      // Validate the processing data
      const dataErrors = validateProcessingData(response.data);
      errors.push(...dataErrors);
    }
  }

  return errors;
}

/**
 * Validates processing data structure
 */
export function validateProcessingData(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Processing data must be an object');
    return errors;
  }

  if (data.status !== 'completed') errors.push('Processing status must be "completed"');
  if (!data.session_id) errors.push('Missing session ID');
  if (!data.patient_id) errors.push('Missing patient ID');
  if (data.enhanced_pipeline !== true) errors.push('Enhanced pipeline must be true');

  // Validate required nested structures
  if (!isValidationResult(data.validation_result)) {
    errors.push('Invalid validation result in processing data');
  }
  if (!isSpecialtyDetection(data.specialty_detection)) {
    errors.push('Invalid specialty detection in processing data');
  }
  if (!isQualityMetrics(data.quality_metrics)) {
    errors.push('Invalid quality metrics in processing data');
  }
  if (!isSafetyCheck(data.safety_check)) {
    errors.push('Invalid safety check in processing data');
  }

  return errors;
}

/**
 * Safely extracts data from an enhanced SOAP note
 */
export function safeExtractSOAPData(note: any) {
  if (!isSOAPNote(note) || !hasEnhancedData(note)) {
    return {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      qualityScore: undefined,
      specialty: undefined,
      safetyStatus: undefined,
      redFlags: [],
      recommendations: [],
      hasEnhancedData: false,
    };
  }

  // Extract from enhanced structure only
  const soapNotes = note.data.soap_notes?.soap_notes;

  return {
    subjective: soapNotes?.subjective?.history_present_illness || soapNotes?.subjective?.chief_complaint || '',
    objective: soapNotes?.objective ? JSON.stringify(soapNotes.objective) : '',
    assessment: soapNotes?.assessment?.primary_diagnosis?.diagnosis || '',
    plan: soapNotes?.plan ? JSON.stringify(soapNotes.plan) : '',
    qualityScore: note.data.qa_results?.quality_score ||
                  (note.data.quality_metrics?.completeness_score ? Math.round(note.data.quality_metrics.completeness_score * 100) : undefined),
    specialty: note.data.specialty_detection?.specialty,
    safetyStatus: note.data.safety_check?.is_safe,
    redFlags: note.data.quality_metrics?.red_flags || note.data.safety_check?.red_flags || [],
    recommendations: note.data.qa_results?.recommendations || [],
    hasEnhancedData: true,
  };
}
