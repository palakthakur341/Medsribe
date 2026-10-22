/**
 * Production-Ready SOAP Notes RAG Integration Hooks
 * 
 * Provides clean, non-blocking RAG embedding for SOAP note events:
 * - SOAP note generation/creation
 * - SOAP note sharing between doctors
 * - SOAP note acceptance/rejection
 * - SOAP note updates/modifications
 * - SOAP note reviews and approvals
 */

import { embedDoctorData, embedPatientData } from './rag-api';
import { SOAPUtils } from '@/app/patient/_components/soap-history/types';
import { safeExtractSOAPData } from '@/lib/utils/soap-type-guards';

/**
 * Configuration for SOAP RAG embedding
 */
interface SOAPRAGConfig {
  enabled: boolean;
  async: boolean;
  retryOnFailure: boolean;
  logErrors: boolean;
  timeout: number;
}

const DEFAULT_CONFIG: SOAPRAGConfig = {
  enabled: process.env.NODE_ENV !== 'test' && typeof window !== 'undefined',
  async: true,
  retryOnFailure: true,
  logErrors: process.env.NODE_ENV === 'development',
  timeout: 5000,
};

/**
 * Enhanced SOAP note data structure for RAG embedding
 * Supports both legacy and enhanced data structures
 */
export interface SOAPNoteEventData {
  soapNoteId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD PATIENT NAME
  appointmentId?: string;

  // Core SOAP content (extracted from either legacy or enhanced structure)
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;

  // Enhanced fields
  chiefComplaint?: string;
  primaryDiagnosis?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  };
  diagnosis?: string[];
  medications?: string[];
  allergies?: string[];
  followUpInstructions?: string;
  recommendations?: string[];

  // Quality and safety metrics
  qualityScore?: number;
  specialty?: string;
  safetyStatus?: boolean;
  redFlags?: string[];

  // Enhanced data indicators
  hasEnhancedData?: boolean;
  sessionId?: string;
  processingTime?: string;
  transcriptionConfidence?: number;

  // Status and timestamps
  status: 'draft' | 'completed' | 'shared' | 'reviewed';
  createdAt: number;
  updatedAt?: number;

  // Raw enhanced data (optional for advanced processing)
  enhancedData?: any;
}

/**
 * SOAP sharing data structure
 */
export interface SOAPSharingEventData {
  shareId: string;
  soapNoteId: string;
  fromDoctorId: string;
  toDoctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD PATIENT NAME
  shareReason: string;
  permissions: 'view' | 'edit' | 'comment';
  expiresAt?: number;
  message?: string;
  createdAt: number;
}

/**
 * SOAP action data structure
 */
export interface SOAPActionEventData {
  actionId: string;
  soapNoteId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD PATIENT NAME
  actionType: 'accepted' | 'rejected' | 'reviewed' | 'commented' | 'updated';
  comments?: string;
  changes?: string;
  reason?: string;
  createdAt: number;
}

/**
 * Production-ready SOAP RAG embedding service
 */
class SOAPRAGService {
  private config: SOAPRAGConfig;

  constructor(config: Partial<SOAPRAGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Extract enhanced SOAP data from a SOAP note for RAG embedding
   */
  private extractEnhancedSOAPData(soapNote: any): Partial<SOAPNoteEventData> {
    // Use the safe extraction utility
    const extractedData = safeExtractSOAPData(soapNote);

    // Extract additional enhanced fields
    const chiefComplaint = SOAPUtils.getChiefComplaint?.(soapNote);
    const primaryDiagnosis = SOAPUtils.getPrimaryDiagnosis?.(soapNote);
    const medications = SOAPUtils.getMedications?.(soapNote) || [];
    const allergies = SOAPUtils.getAllergies?.(soapNote) || [];
    const vitalSigns = SOAPUtils.getVitalSigns?.(soapNote);
    const sessionId = SOAPUtils.getSessionId?.(soapNote);
    const processingTime = SOAPUtils.getProcessingTime?.(soapNote);
    const transcriptionConfidence = soapNote.data?.transcription?.confidence;

    return {
      subjective: extractedData.subjective,
      objective: extractedData.objective,
      assessment: extractedData.assessment,
      plan: extractedData.plan,
      qualityScore: extractedData.qualityScore,
      specialty: extractedData.specialty,
      safetyStatus: extractedData.safetyStatus,
      redFlags: extractedData.redFlags,
      recommendations: extractedData.recommendations,
      hasEnhancedData: extractedData.hasEnhancedData,
      chiefComplaint,
      primaryDiagnosis,
      medications,
      allergies,
      vitalSigns,
      sessionId,
      processingTime,
      transcriptionConfidence,
      enhancedData: soapNote.data, // Store raw enhanced data for advanced processing
    };
  }

  /**
   * Execute embedding with comprehensive error handling
   */
  private async executeEmbed(
    embedFn: () => Promise<void>,
    eventType: string,
    entityId: string
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const execute = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('SOAP RAG embedding timeout')), this.config.timeout);
        });

        await Promise.race([embedFn(), timeoutPromise]);

        if (this.config.logErrors) {
          console.log(`✅ SOAP RAG embed: ${eventType} (${entityId})`);
        }
      } catch (error) {
        if (this.config.logErrors) {
          console.warn(`⚠️ SOAP RAG embed failed: ${eventType} (${entityId})`, error);
        }

        if (this.config.retryOnFailure) {
          setTimeout(async () => {
            try {
              const retryTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('SOAP RAG embedding retry timeout')), this.config.timeout);
              });

              await Promise.race([embedFn(), retryTimeoutPromise]);
              if (this.config.logErrors) {
                console.log(`✅ SOAP RAG embed retry: ${eventType} (${entityId})`);
              }
            } catch (retryError) {
              if (this.config.logErrors) {
                console.warn(`⚠️ SOAP RAG embed retry failed: ${eventType} (${entityId})`);
              }
            }
          }, 2000);
        }
      }
    };

    if (this.config.async) {
      execute().catch(() => {});
    } else {
      await execute();
    }
  }

  /**
   * Embed SOAP note created/generated event
   */
  async onSOAPNoteCreated(soapData: SOAPNoteEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(soapData.createdAt).toLocaleDateString();

        // Enhanced data fields
        const diagnosisText = soapData.diagnosis?.length ? ` Diagnosis: ${soapData.diagnosis.join(', ')}` : '';
        const primaryDiagnosisText = soapData.primaryDiagnosis ? ` Primary Diagnosis: ${soapData.primaryDiagnosis}` : '';
        const medicationsText = soapData.medications?.length ? ` Medications: ${soapData.medications.join(', ')}` : '';
        const allergiesText = soapData.allergies?.length ? ` Allergies: ${soapData.allergies.join(', ')}` : '';
        const vitalSignsText = soapData.vitalSigns ? ` Vitals: BP ${soapData.vitalSigns.bloodPressure || 'N/A'}, HR ${soapData.vitalSigns.heartRate || 'N/A'}` : '';
        const followUpText = soapData.followUpInstructions ? ` Follow-up: ${soapData.followUpInstructions}` : '';
        const recommendationsText = soapData.recommendations?.length ? ` Recommendations: ${soapData.recommendations.join(', ')}` : '';
        const specialtyText = soapData.specialty ? ` Specialty: ${soapData.specialty}` : '';
        const qualityText = soapData.qualityScore ? ` Quality Score: ${soapData.qualityScore}%` : '';
        const safetyText = soapData.safetyStatus !== undefined ? ` Safety Status: ${soapData.safetyStatus ? 'Safe' : 'Requires Attention'}` : '';
        const redFlagsText = soapData.redFlags?.length ? ` Red Flags: ${soapData.redFlags.join(', ')}` : '';
        const enhancedText = soapData.hasEnhancedData ? ' [AI Enhanced Analysis]' : '';
        const sessionText = soapData.sessionId ? ` Session: ${soapData.sessionId}` : '';
        const processingText = soapData.processingTime ? ` Processing Time: ${soapData.processingTime}` : '';

        // ✅ UPDATED: Include patient name in doctor data
        const doctorData = `SOAP note created for patient ${soapData.patientName} visit on ${date}${enhancedText}. Chief complaint: ${soapData.chiefComplaint || 'Not specified'}. Subjective: ${soapData.subjective}. Objective: ${soapData.objective}. Assessment: ${soapData.assessment}. Plan: ${soapData.plan}.${diagnosisText}${primaryDiagnosisText}${medicationsText}${allergiesText}${vitalSignsText}${followUpText}${recommendationsText}${specialtyText}${qualityText}${safetyText}${redFlagsText}${sessionText}${processingText}`;

        const patientData = `Medical visit documented on ${date}${enhancedText}. Chief complaint: ${soapData.chiefComplaint || 'Not specified'}. Assessment: ${soapData.assessment}. Treatment plan: ${soapData.plan}.${diagnosisText}${primaryDiagnosisText}${medicationsText}${allergiesText}${followUpText}${recommendationsText}${safetyText}${redFlagsText}`;
        
        const metadata = {
          soap_note_id: soapData.soapNoteId,
          patient_name: soapData.patientName,  // ✅ ADD PATIENT NAME
          patient_id: soapData.patientId,
          appointment_id: soapData.appointmentId,
          chief_complaint: soapData.chiefComplaint,
          primary_diagnosis: soapData.primaryDiagnosis,
          diagnosis: soapData.diagnosis,
          medications: soapData.medications,
          allergies: soapData.allergies,
          vital_signs: soapData.vitalSigns,
          recommendations: soapData.recommendations,
          specialty: soapData.specialty,
          quality_score: soapData.qualityScore,
          safety_status: soapData.safetyStatus,
          red_flags: soapData.redFlags,
          has_enhanced_data: soapData.hasEnhancedData,
          session_id: soapData.sessionId,
          processing_time: soapData.processingTime,
          transcription_confidence: soapData.transcriptionConfidence,
          status: soapData.status,
          created_date: date
        };

        await Promise.all([
          embedDoctorData(
            soapData.doctorId,
            'soap_note_created',
            doctorData,
            { ...metadata, patient_id: soapData.patientId }
          ),
          embedPatientData(
            soapData.patientId,
            'soap_note_created',
            patientData,
            { ...metadata, doctor_id: soapData.doctorId }
          )
        ]);
      },
      'soap_note_created',
      soapData.soapNoteId
    );
  }

  /**
   * Create enhanced SOAP event data from a SOAP note object
   * This is a convenience method for converting SOAP notes to RAG event data
   */
  createSOAPEventData(
    soapNote: any,
    doctorId: string,
    patientId: string,
    patientName: string,  // ✅ ADD PATIENT NAME PARAMETER
    appointmentId?: string
  ): SOAPNoteEventData {
    const enhancedData = this.extractEnhancedSOAPData(soapNote);

    return {
      soapNoteId: soapNote._id,
      doctorId,
      patientId,
      patientName,  // ✅ ADD PATIENT NAME
      appointmentId,
      subjective: enhancedData.subjective || '',
      objective: enhancedData.objective || '',
      assessment: enhancedData.assessment || '',
      plan: enhancedData.plan || '',
      chiefComplaint: enhancedData.chiefComplaint,
      primaryDiagnosis: enhancedData.primaryDiagnosis,
      diagnosis: enhancedData.diagnosis || [],
      medications: enhancedData.medications || [],
      allergies: enhancedData.allergies || [],
      vitalSigns: enhancedData.vitalSigns,
      followUpInstructions: soapNote.followUpInstructions,
      recommendations: enhancedData.recommendations || [],
      qualityScore: enhancedData.qualityScore,
      specialty: enhancedData.specialty,
      safetyStatus: enhancedData.safetyStatus,
      redFlags: enhancedData.redFlags || [],
      hasEnhancedData: enhancedData.hasEnhancedData || false,
      sessionId: enhancedData.sessionId,
      processingTime: enhancedData.processingTime,
      transcriptionConfidence: enhancedData.transcriptionConfidence,
      status: soapNote.status || 'completed',
      createdAt: soapNote.createdAt || soapNote.timestamp || Date.now(),
      updatedAt: soapNote.updatedAt,
      enhancedData: enhancedData.enhancedData,
    };
  }

  /**
   * Embed SOAP note shared event
   */
  async onSOAPNoteShared(sharingData: SOAPSharingEventData, soapData?: Partial<SOAPNoteEventData>): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(sharingData.createdAt).toLocaleDateString();
        const expiryText = sharingData.expiresAt ? ` Expires: ${new Date(sharingData.expiresAt).toLocaleDateString()}` : '';
        const messageText = sharingData.message ? ` Message: ${sharingData.message}` : '';
        
        // ✅ UPDATED: Include patient name in sharing data
        const fromDoctorData = `SOAP note shared with colleague on ${date} for patient ${sharingData.patientName}. Patient case shared for: ${sharingData.shareReason}. Permissions: ${sharingData.permissions}.${expiryText}${messageText}`;

        const toDoctorData = `SOAP note received from colleague on ${date} for patient ${sharingData.patientName}. Patient case shared for: ${sharingData.shareReason}. Permissions: ${sharingData.permissions}.${expiryText}${messageText}`;

        const patientData = `Medical records shared between healthcare providers on ${date} for: ${sharingData.shareReason}`;
        
        const metadata = {
          share_id: sharingData.shareId,
          soap_note_id: sharingData.soapNoteId,
          patient_name: sharingData.patientName,  // ✅ ADD PATIENT NAME
          patient_id: sharingData.patientId,
          from_doctor_id: sharingData.fromDoctorId,
          to_doctor_id: sharingData.toDoctorId,
          share_reason: sharingData.shareReason,
          permissions: sharingData.permissions,
          expires_at: sharingData.expiresAt ? new Date(sharingData.expiresAt).toLocaleDateString() : undefined,
          shared_date: date
        };

        await Promise.all([
          embedDoctorData(
            sharingData.fromDoctorId,
            'soap_note_shared_out',
            fromDoctorData,
            { ...metadata, patient_id: sharingData.patientId }
          ),
          embedDoctorData(
            sharingData.toDoctorId,
            'soap_note_shared_in',
            toDoctorData,
            { ...metadata, patient_id: sharingData.patientId }
          ),
          embedPatientData(
            sharingData.patientId,
            'soap_note_shared',
            patientData,
            { ...metadata, from_doctor_id: sharingData.fromDoctorId, to_doctor_id: sharingData.toDoctorId }
          )
        ]);
      },
      'soap_note_shared',
      sharingData.shareId
    );
  }

  /**
   * Embed SOAP note action event (accepted, rejected, reviewed, etc.)
   */
  async onSOAPNoteAction(actionData: SOAPActionEventData, soapData?: Partial<SOAPNoteEventData>): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(actionData.createdAt).toLocaleDateString();
        const commentsText = actionData.comments ? ` Comments: ${actionData.comments}` : '';
        const changesText = actionData.changes ? ` Changes: ${actionData.changes}` : '';
        const reasonText = actionData.reason ? ` Reason: ${actionData.reason}` : '';
        
        // ✅ UPDATED: Include patient name in action data
        const doctorData = `SOAP note ${actionData.actionType} on ${date} for patient ${actionData.patientName}.${commentsText}${changesText}${reasonText}`;

        const patientData = `Medical record ${actionData.actionType} by healthcare provider on ${date}.${reasonText}`;

        const metadata = {
          action_id: actionData.actionId,
          soap_note_id: actionData.soapNoteId,
          patient_name: actionData.patientName,  // ✅ ADD PATIENT NAME
          patient_id: actionData.patientId,
          action_type: actionData.actionType,
          comments: actionData.comments,
          changes: actionData.changes,
          reason: actionData.reason,
          action_date: date
        };

        await Promise.all([
          embedDoctorData(
            actionData.doctorId,
            `soap_note_${actionData.actionType}`,
            doctorData,
            { ...metadata, patient_id: actionData.patientId }
          ),
          embedPatientData(
            actionData.patientId,
            `soap_note_${actionData.actionType}`,
            patientData,
            { ...metadata, doctor_id: actionData.doctorId }
          )
        ]);
      },
      `soap_note_${actionData.actionType}`,
      actionData.actionId
    );
  }

  /**
   * Embed SOAP note updated event
   */
  async onSOAPNoteUpdated(soapData: SOAPNoteEventData, changes: string): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(soapData.updatedAt || soapData.createdAt).toLocaleDateString();
        
        // ✅ UPDATED: Include patient name in update data
        const doctorData = `SOAP note updated on ${date} for patient ${soapData.patientName}. Changes: ${changes}. Current assessment: ${soapData.assessment}. Current plan: ${soapData.plan}`;

        const patientData = `Medical record updated on ${date}. Updated assessment: ${soapData.assessment}. Updated treatment plan: ${soapData.plan}`;

        const metadata = {
          soap_note_id: soapData.soapNoteId,
          patient_name: soapData.patientName,  // ✅ ADD PATIENT NAME
          patient_id: soapData.patientId,
          appointment_id: soapData.appointmentId,
          changes,
          status: soapData.status,
          updated_date: date
        };

        await Promise.all([
          embedDoctorData(
            soapData.doctorId,
            'soap_note_updated',
            doctorData,
            { ...metadata, patient_id: soapData.patientId }
          ),
          embedPatientData(
            soapData.patientId,
            'soap_note_updated',
            patientData,
            { ...metadata, doctor_id: soapData.doctorId }
          )
        ]);
      },
      'soap_note_updated',
      soapData.soapNoteId
    );
  }
}

// Singleton instance for production use
export const soapRAGHooks = new SOAPRAGService();

// Convenience exports
export const {
  onSOAPNoteCreated,
  onSOAPNoteShared,
  onSOAPNoteAction,
  onSOAPNoteUpdated
} = soapRAGHooks;
