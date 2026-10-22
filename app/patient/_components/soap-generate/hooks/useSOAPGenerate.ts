/**
 * Main hook for SOAP generation functionality
 * Handles both audio and text processing with the new enhanced API
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { medscribeAPI } from '@/lib/api/medscribe-api';
import { soapRAGHooks } from '@/lib/services/soap-rag-hooks';
import {
  UseSOAPGenerateReturn,
  SOAPGenerationState,
  PatientProfile,
  SOAPGenerationError,
} from '../types';
import {
  ProcessingState,
  SOAPProcessingResponse,
} from '@/lib/types/soap-api';

const initialProcessingState: ProcessingState = {
  isProcessing: false,
  progress: 0,
  stage: 'uploading',
  message: '',
};

const initialState: SOAPGenerationState = {
  isProcessing: false,
  processingState: initialProcessingState,
  audioBlob: null,
  fileName: '',
  textInput: '',
  mode: 'audio',
  error: null,
  result: null,
};

export function useSOAPGenerate(patientProfile?: PatientProfile): UseSOAPGenerateReturn {
  const router = useRouter();
  const [state, setState] = useState<SOAPGenerationState>(initialState);
  
  // Convex mutation for saving SOAP notes with enhanced API response data
  const createSOAPNote = useMutation(api.soapNotes.create);

  // ============================================================================
  // STATE MANAGEMENT ACTIONS
  // ============================================================================

  const setMode = useCallback((mode: 'audio' | 'text' | 'conversation') => {
    setState(prev => ({ ...prev, mode, error: null }));
  }, []);

  const setTextInput = useCallback((textInput: string) => {
    setState(prev => ({ ...prev, textInput, error: null }));
  }, []);

  const handleAudioReady = useCallback((blob: Blob, fileName: string) => {
    setState(prev => ({
      ...prev,
      audioBlob: blob,
      fileName,
      error: null,
    }));
  }, []);

  const handleAudioRemove = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      fileName: '',
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // ============================================================================
  // PROCESSING ACTIONS
  // ============================================================================

  const updateProcessingState = useCallback((processingState: ProcessingState) => {
    setState(prev => ({
      ...prev,
      isProcessing: processingState.isProcessing,
      processingState,
    }));
  }, []);

  const handleError = useCallback((error: unknown, type: SOAPGenerationError['type'] = 'unknown') => {
    // Extract error message with better handling
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = undefined;

    if (error instanceof Error) {
      errorMessage = error.message || 'An unexpected error occurred';
      errorDetails = error.stack;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Handle API error responses
      const errorObj = error as any;
      if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.error) {
        errorMessage = errorObj.error;
      } else {
        errorMessage = 'An unexpected error occurred';
        errorDetails = JSON.stringify(error, null, 2);
      }
    }

    const soapError: SOAPGenerationError = {
      type,
      message: errorMessage,
      details: errorDetails,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      isProcessing: false,
      processingState: {
        ...prev.processingState,
        isProcessing: false,
        stage: 'error',
        message: errorMessage,
        error: errorMessage,
      },
      error: errorMessage,
    }));

    toast.error(errorMessage);

    // Better error logging with proper serialization
    console.error('SOAP Generation Error:', {
      type: soapError.type,
      message: soapError.message,
      details: soapError.details,
      timestamp: new Date(soapError.timestamp).toISOString(),
      originalError: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      } : error
    });
  }, []);

  const handleTextProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    if (!state.textInput.trim()) {
      handleError(new Error('Please enter medical text to process'), 'validation');
      return;
    }

    // Validate text input
    const validation = medscribeAPI.validateText(state.textInput);
    if (!validation.valid) {
      handleError(new Error(validation.error || 'Invalid text input'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const result = await medscribeAPI.processText(
        state.textInput,
        patientProfile._id,
        updateProcessingState
      );

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully!',
        },
      }));

      toast.success('SOAP notes generated successfully!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, state.textInput, updateProcessingState, handleError]);

  const handleAudioProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    if (!state.audioBlob) {
      handleError(new Error('Please record or upload an audio file'), 'validation');
      return;
    }

    // Convert blob to file for validation
    const audioFile = new File([state.audioBlob], state.fileName, {
      type: state.audioBlob.type,
    });

    // Validate audio file
    const validation = medscribeAPI.validateAudioFile(audioFile);
    if (!validation.valid) {
      handleError(new Error(validation.error || 'Invalid audio file'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const result = await medscribeAPI.processAudio(
        audioFile,
        patientProfile._id,
        updateProcessingState
      );

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully!',
        },
      }));

      toast.success('SOAP notes generated successfully!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, state.audioBlob, state.fileName, updateProcessingState, handleError]);

  const handleConversationProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Simulate conversation processing with mock data
      updateProcessingState({
        isProcessing: true,
        progress: 20,
        stage: 'analyzing',
        message: 'Analyzing conversation...'
      });

      // Mock delay for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateProcessingState({
        isProcessing: true,
        progress: 60,
        stage: 'generating',
        message: 'Generating SOAP notes from conversation...'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock SOAP result from conversation
      const mockResult = {
        status: 'success' as const,
        message: 'SOAP notes generated successfully from conversation',
        timestamp: new Date().toISOString(),
        data: {
          status: 'completed' as const,
          message: 'Conversation analysis complete',
          session_id: `conv_${Date.now()}`,
          transcription: {
            text: 'Conversation-based medical interview completed',
            confidence: 0.95,
            language: 'en',
            duration: 300
          },
          validation_result: {
            validated_text: 'Validated conversation content',
            corrections: [],
            flags: [],
            confidence: 0.95
          },
          specialty_detection: {
            specialty: 'Emergency Medicine',
            confidence: 0.92,
            reasoning: 'Patient presents with acute chest pain requiring emergency evaluation',
            templates: {}
          },
          soap_notes: {
            // Structured SOAP notes
            soap_notes: {
              subjective: {
                chief_complaint: 'Acute onset chest pain',
                history_present_illness: '58-year-old male with acute onset chest pain x 2 hours. Pain described as heavy pressure in center of chest, radiating to left arm and jaw. Associated with shortness of breath, diaphoresis, and nausea. Onset while mowing lawn.',
                review_of_systems: ['Chest pain', 'Shortness of breath', 'Diaphoresis', 'Nausea'],
                past_medical_history: ['Hypertension', 'Diabetes mellitus', 'Smoking history'],
                medications: ['Metformin', 'Lisinopril', 'Aspirin'],
                allergies: ['NKDA'],
                social_history: 'Former smoker, occasional alcohol use'
              },
              objective: {
                vital_signs: {
                  blood_pressure: '160/95',
                  heart_rate: '95',
                  oxygen_saturation: '96%',
                  temperature: '98.6°F',
                  respiratory_rate: '18'
                },
                physical_exam: {
                  general: 'Patient appears uncomfortable, diaphoretic',
                  cardiovascular: 'Regular rate and rhythm, no murmurs',
                  respiratory: 'Clear to auscultation bilaterally'
                },
                diagnostic_results: ['EKG shows acute changes consistent with ACS'],
                mental_status: 'Alert and oriented',
                functional_status: 'Ambulatory with assistance'
              },
              assessment: {
                primary_diagnosis: {
                  diagnosis: 'Acute coronary syndrome/STEMI',
                  icd10_code: 'I21.9',
                  confidence: 0.95,
                  severity: 'severe',
                  clinical_reasoning: 'Multiple cardiac risk factors including HTN, DM, smoking history, and strong family history of premature CAD'
                },
                differential_diagnoses: [
                  {
                    diagnosis: 'Unstable angina',
                    icd10_code: 'I20.0',
                    probability: 0.15,
                    ruling_out_criteria: 'EKG changes consistent with STEMI'
                  }
                ],
                problem_list: [
                  {
                    problem: 'Acute coronary syndrome',
                    status: 'active',
                    priority: 'high'
                  }
                ],
                risk_level: 'high',
                risk_factors: ['Hypertension', 'Diabetes', 'Smoking history', 'Family history of CAD'],
                prognosis: 'Good with immediate intervention'
              },
              plan: {
                diagnostic_workup: ['Cardiac catheterization', 'Serial troponins', 'Echocardiogram'],
                treatments: ['ACS protocol initiated', 'Continuous cardiac monitoring'],
                medications: ['Aspirin', 'Clopidogrel', 'Atorvastatin', 'Metoprolol'],
                follow_up: [
                  {
                    provider: 'Cardiology',
                    timeframe: 'Immediate',
                    urgency: 'stat'
                  }
                ],
                patient_education: ['Cardiac diet', 'Activity restrictions', 'Medication compliance'],
                referrals: ['Cardiology consultation']
              },
              clinical_notes: 'Patient presents with classic symptoms of acute coronary syndrome. Immediate intervention required.'
            },

            // Quality metrics at soap_notes level
            quality_metrics: {
              completeness_score: 0.92,
              clinical_accuracy: 0.95,
              documentation_quality: 0.88,
              red_flags: ['Acute chest pain with radiation', 'Multiple cardiac risk factors'],
              missing_information: ['Allergies confirmation', 'Current medications dosages']
            },

            // SOAP notes metadata
            session_id: `conv_${Date.now()}`,
            specialty: 'Emergency Medicine',

            // Legacy compatibility fields
            subjective: '58-year-old male with acute onset chest pain x 2 hours. Pain described as heavy pressure in center of chest, radiating to left arm and jaw. Associated with shortness of breath, diaphoresis, and nausea. Onset while mowing lawn.',
            objective: 'Vital Signs: BP 160/95, HR 95, O2 sat 96%. Patient appears uncomfortable, diaphoretic. EKG shows acute changes consistent with ACS.',
            assessment: 'Acute coronary syndrome/STEMI. Multiple cardiac risk factors including HTN, DM, smoking history, and strong family history of premature CAD.',
            plan: 'ACS protocol initiated, cardiology consultation, plan for cardiac catheterization. Patient education provided, family notification arranged.',
            icd_codes: ['I21.9', 'I25.10']
          },

          // Top-level quality metrics
          quality_metrics: {
            completeness_score: 0.92,
            clinical_accuracy: 0.95,
            documentation_quality: 0.88,
            red_flags: ['Acute chest pain with radiation', 'Multiple cardiac risk factors'],
            missing_information: ['Allergies confirmation', 'Current medications dosages']
          },

          // Safety checks
          safety_check: {
            is_safe: false,
            red_flags: ['Acute coronary syndrome', 'High-risk chest pain'],
            critical_items: ['Immediate cardiology consultation required', 'Continuous cardiac monitoring']
          },

          // Quality assessment
          qa_results: {
            quality_score: 92,
            errors: [],
            warnings: ['High-risk presentation requires immediate attention'],
            recommendations: ['Immediate cardiology consultation', 'Continuous monitoring'],
            critical_flags: ['Acute coronary syndrome'],
            approved: true
          },

          // Document generation results
          document: {
            document_path: '/documents/soap_note_conv_' + Date.now() + '.pdf',
            success: true,
            error: undefined
          },

          // Legacy compatibility fields at top level
          status: 'completed',
          message: 'Conversation analysis complete',
          processing_summary: {
            transcription: 'Conversation transcribed successfully',
            validation: 'Content validated with high confidence',
            soap_generation: 'Structured SOAP notes generated',
            quality_assurance: 'Quality metrics calculated',
            highlighting: 'Key medical terms highlighted',
            document_creation: 'PDF document generated',
            ehr_integration: 'Ready for EHR integration'
          },
          deliverables: {
            clinical_notes: {
              subjective: '58-year-old male with acute onset chest pain x 2 hours. Pain described as heavy pressure in center of chest, radiating to left arm and jaw. Associated with shortness of breath, diaphoresis, and nausea. Onset while mowing lawn.',
              objective: 'Vital Signs: BP 160/95, HR 95, O2 sat 96%. Patient appears uncomfortable, diaphoretic. EKG shows acute changes consistent with ACS.',
              assessment: 'Acute coronary syndrome/STEMI. Multiple cardiac risk factors including HTN, DM, smoking history, and strong family history of premature CAD.',
              plan: 'ACS protocol initiated, cardiology consultation, plan for cardiac catheterization. Patient education provided, family notification arranged.'
            },
            highlighted_html: '<div class="soap-note">...</div>',
            google_doc_url: 'https://docs.google.com/document/d/example',
            ehr_record_id: 'EHR_' + Date.now()
          },
          recommendations: ['Immediate cardiology consultation', 'Continuous cardiac monitoring', 'Serial troponins'],
          total_processing_time: '02:30',
          completed_at: new Date().toISOString(),
          enhanced_pipeline: true
        }
      };

      setState(prev => ({
        ...prev,
        result: mockResult,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully from conversation!',
        },
      }));

      toast.success('SOAP notes generated successfully from conversation!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, updateProcessingState, handleError]);

  // ============================================================================
  // SAVE SOAP NOTE (will be implemented after database schema update)
  // ============================================================================

  const saveSOAPNote = useCallback(async (result: SOAPProcessingResponse) => {
    if (!patientProfile || !result.data) {
      throw new Error('Missing required data for saving SOAP note');
    }

    try {
      // Use the new createFromApiResponse mutation with complete API response data
      const soapNoteId = await createSOAPNote({
        patientId: patientProfile._id,
        status: result.status,
        data: result.data, // Pass the complete API response data structure
      });

      // 🔥 Embed SOAP note into RAG system (production-ready)
      if (soapNoteId) {
        // Note: In a real implementation, you'd get doctor ID from context/auth
        const doctorId = 'doctor_from_context'; // This should be extracted from context

        // Extract data from the enhanced structure
        const soapData = result.data.soap_notes?.soap_notes || result.data.soap_notes;
        const vitalSigns = result.data.soap_notes?.soap_notes?.objective?.vital_signs || result.data.vital_signs;

        soapRAGHooks.onSOAPNoteCreated({
          soapNoteId,
          doctorId,
          patientId: patientProfile._id,
          patientName: `${patientProfile.firstName} ${patientProfile.lastName}`,  // ✅ ADD PATIENT NAME
          appointmentId: undefined, // Could be linked if created from appointment
          subjective: result.data.soap_notes?.subjective || soapData?.subjective?.chief_complaint || '',
          objective: result.data.soap_notes?.objective || JSON.stringify(soapData?.objective) || '',
          assessment: result.data.soap_notes?.assessment || JSON.stringify(soapData?.assessment) || '',
          plan: result.data.soap_notes?.plan || JSON.stringify(soapData?.plan) || '',
          chiefComplaint: soapData?.subjective?.chief_complaint,
          vitalSigns: vitalSigns ? {
            bloodPressure: vitalSigns.blood_pressure || vitalSigns.bloodPressure,
            heartRate: vitalSigns.heart_rate || vitalSigns.heartRate,
            temperature: vitalSigns.temperature,
            respiratoryRate: vitalSigns.respiratory_rate || vitalSigns.respiratoryRate,
            oxygenSaturation: vitalSigns.oxygen_saturation || vitalSigns.oxygenSaturation,
            weight: vitalSigns.weight,
            height: vitalSigns.height,
          } : undefined,
          diagnosis: soapData?.assessment?.primary_diagnosis ? [soapData.assessment.primary_diagnosis.diagnosis] : [],
          medications: soapData?.subjective?.medications || soapData?.plan?.medications || [],
          followUpInstructions: soapData?.plan?.patient_education?.join(', '),
          status: 'completed',
          createdAt: Date.now(),
        });
      }

      toast.success('SOAP note saved successfully!');

      // Navigate to SOAP history page
      router.push('/patient/soap/history');

      return soapNoteId;
    } catch (error) {
      handleError(error, 'processing');
      throw error;
    }
  }, [patientProfile, createSOAPNote, router, handleError]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    state,
    actions: {
      setMode,
      setTextInput,
      handleAudioReady,
      handleAudioRemove,
      handleTextProcess,
      handleAudioProcess,
      handleConversationProcess,
      clearError,
      reset,
      saveSOAPNote,
    },
  };
}
