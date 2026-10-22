/**
 * Production-Ready Medical RAG Integration Hooks
 * 
 * Provides clean, non-blocking RAG embedding for medical events:
 * - Treatment plans created/updated
 * - Medications prescribed/modified
 * - Prescriptions issued/refilled
 * - Medical goals set/achieved
 */

import { embedDoctorData, embedPatientData } from './rag-api';

/**
 * Configuration for medical RAG embedding
 */
interface MedicalRAGConfig {
  enabled: boolean;
  async: boolean;
  retryOnFailure: boolean;
  logErrors: boolean;
  timeout: number;
}

const DEFAULT_CONFIG: MedicalRAGConfig = {
  enabled: process.env.NODE_ENV !== 'test' && typeof window !== 'undefined',
  async: true,
  retryOnFailure: true,
  logErrors: process.env.NODE_ENV === 'development',
  timeout: 5000,
};

/**
 * Treatment plan data structure
 */
export interface TreatmentPlanEventData {
  treatmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD THIS
  appointmentId?: string;
  diagnosis: string;
  treatmentType: string;
  description: string;
  goals: string[];
  duration?: string;
  followUpRequired: boolean;
  notes?: string;
  createdAt: number;
}

/**
 * Medication data structure
 */
export interface MedicationEventData {
  medicationId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD THIS
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects?: string[];
  interactions?: string[];
  notes?: string;
  createdAt: number;
}

/**
 * Prescription data structure
 */
export interface PrescriptionEventData {
  prescriptionId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD THIS
  appointmentId?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }>;
  pharmacy?: string;
  instructions: string;
  refillsAllowed: number;
  notes?: string;
  createdAt: number;
}

/**
 * Medical goal data structure
 */
export interface MedicalGoalEventData {
  goalId: string;
  doctorId: string;
  patientId: string;
  patientName: string;  // ✅ ADD THIS
  appointmentId?: string;
  goalType: string;
  description: string;
  targetValue?: string;
  currentValue?: string;
  targetDate?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'modified' | 'discontinued';
  notes?: string;
  createdAt: number;
}

/**
 * Production-ready medical RAG embedding service
 */
class MedicalRAGService {
  private config: MedicalRAGConfig;

  constructor(config: Partial<MedicalRAGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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
          setTimeout(() => reject(new Error('Medical RAG embedding timeout')), this.config.timeout);
        });

        await Promise.race([embedFn(), timeoutPromise]);

        if (this.config.logErrors) {
          console.log(`✅ Medical RAG embed: ${eventType} (${entityId})`);
        }
      } catch (error) {
        if (this.config.logErrors) {
          console.warn(`⚠️ Medical RAG embed failed: ${eventType} (${entityId})`, error);
        }

        if (this.config.retryOnFailure) {
          setTimeout(async () => {
            try {
              const retryTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Medical RAG embedding retry timeout')), this.config.timeout);
              });
              await Promise.race([embedFn(), retryTimeoutPromise]);
              if (this.config.logErrors) {
                console.log(`✅ Medical RAG embed retry: ${eventType} (${entityId})`);
              }
            } catch (retryError) {
              if (this.config.logErrors) {
                console.warn(`⚠️ Medical RAG embed retry failed: ${eventType} (${entityId})`);
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
   * Embed treatment plan created event
   */
  async onTreatmentPlanCreated(treatmentData: TreatmentPlanEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(treatmentData.createdAt).toLocaleDateString();
        const goalsText = treatmentData.goals.length > 0 ? ` Goals: ${treatmentData.goals.join(', ')}` : '';
        const durationText = treatmentData.duration ? ` Duration: ${treatmentData.duration}` : '';
        const notesText = treatmentData.notes ? ` Notes: ${treatmentData.notes}` : '';
        
        // ✅ CHANGE: Include patient name in data text
        const doctorData = `Treatment plan created for patient ${treatmentData.patientName}. Diagnosis: ${treatmentData.diagnosis}. Treatment: ${treatmentData.treatmentType} - ${treatmentData.description}.${goalsText}${durationText}. Date: ${date}.${notesText}`;

        const patientData = `Treatment plan created for ${treatmentData.diagnosis}. Treatment: ${treatmentData.treatmentType} - ${treatmentData.description}.${goalsText}${durationText}. Date: ${date}.`;

        const metadata = {
          treatment_id: treatmentData.treatmentId,
          patient_name: treatmentData.patientName,  // ✅ ADD THIS
          patient_id: treatmentData.patientId,
          appointment_id: treatmentData.appointmentId,
          diagnosis: treatmentData.diagnosis,
          treatment_type: treatmentData.treatmentType,
          goals: treatmentData.goals,
          duration: treatmentData.duration,
          follow_up_required: treatmentData.followUpRequired,
          created_date: date
        };

        await Promise.all([
          embedDoctorData(
            treatmentData.doctorId,
            'treatment_plan_created',
            doctorData,
            metadata
          ),
          embedPatientData(
            treatmentData.patientId,
            'treatment_plan_created',
            patientData,
            { ...metadata, doctor_id: treatmentData.doctorId }
          )
        ]);
      },
      'treatment_plan_created',
      treatmentData.treatmentId
    );
  }

  /**
   * Embed medication prescribed event
   */
  async onMedicationPrescribed(medicationData: MedicationEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(medicationData.createdAt).toLocaleDateString();
        const sideEffectsText = medicationData.sideEffects?.length ? ` Side effects: ${medicationData.sideEffects.join(', ')}` : '';
        const interactionsText = medicationData.interactions?.length ? ` Interactions: ${medicationData.interactions.join(', ')}` : '';
        const notesText = medicationData.notes ? ` Notes: ${medicationData.notes}` : '';
        
        // ✅ CHANGE: Include patient name in data text
        const doctorData = `Medication prescribed for patient ${medicationData.patientName}: ${medicationData.medicationName} ${medicationData.dosage}, ${medicationData.frequency} for ${medicationData.duration}. Instructions: ${medicationData.instructions}. Date: ${date}.${sideEffectsText}${interactionsText}${notesText}`;

        const patientData = `Medication prescribed: ${medicationData.medicationName} ${medicationData.dosage}, ${medicationData.frequency} for ${medicationData.duration}. Instructions: ${medicationData.instructions}. Date: ${date}.${notesText}`;

        const metadata = {
          medication_id: medicationData.medicationId,
          patient_name: medicationData.patientName,  // ✅ ADD THIS
          patient_id: medicationData.patientId,
          appointment_id: medicationData.appointmentId,
          medication_name: medicationData.medicationName,
          dosage: medicationData.dosage,
          frequency: medicationData.frequency,
          duration: medicationData.duration,
          side_effects: medicationData.sideEffects,
          interactions: medicationData.interactions,
          prescribed_date: date
        };

        await Promise.all([
          embedDoctorData(
            medicationData.doctorId,
            'medication_prescribed',
            doctorData,
            metadata
          ),
          embedPatientData(
            medicationData.patientId,
            'medication_prescribed',
            patientData,
            { ...metadata, doctor_id: medicationData.doctorId }
          )
        ]);
      },
      'medication_prescribed',
      medicationData.medicationId
    );
  }

  /**
   * Embed prescription issued event
   */
  async onPrescriptionIssued(prescriptionData: PrescriptionEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(prescriptionData.createdAt).toLocaleDateString();
        const medicationsText = prescriptionData.medications.map(med => 
          `${med.name} ${med.dosage} (${med.frequency} for ${med.duration}, qty: ${med.quantity})`
        ).join(', ');
        const pharmacyText = prescriptionData.pharmacy ? ` Pharmacy: ${prescriptionData.pharmacy}` : '';
        const notesText = prescriptionData.notes ? ` Notes: ${prescriptionData.notes}` : '';
        
        // ✅ CHANGE: Include patient name in data text
        const doctorData = `Prescription issued for patient ${prescriptionData.patientName} with ${prescriptionData.medications.length} medication(s): ${medicationsText}. Instructions: ${prescriptionData.instructions}. Refills: ${prescriptionData.refillsAllowed}. Date: ${date}.${pharmacyText}${notesText}`;

        const patientData = `Prescription issued with ${prescriptionData.medications.length} medication(s): ${medicationsText}. Instructions: ${prescriptionData.instructions}. Refills: ${prescriptionData.refillsAllowed}. Date: ${date}.${pharmacyText}`;

        const metadata = {
          prescription_id: prescriptionData.prescriptionId,
          patient_name: prescriptionData.patientName,  // ✅ ADD THIS
          patient_id: prescriptionData.patientId,
          appointment_id: prescriptionData.appointmentId,
          medications: prescriptionData.medications,
          pharmacy: prescriptionData.pharmacy,
          refills_allowed: prescriptionData.refillsAllowed,
          issued_date: date
        };

        await Promise.all([
          embedDoctorData(
            prescriptionData.doctorId,
            'prescription_issued',
            doctorData,
            metadata
          ),
          embedPatientData(
            prescriptionData.patientId,
            'prescription_issued',
            patientData,
            { ...metadata, doctor_id: prescriptionData.doctorId }
          )
        ]);
      },
      'prescription_issued',
      prescriptionData.prescriptionId
    );
  }

  /**
   * Embed medical goal set event
   */
  async onMedicalGoalSet(goalData: MedicalGoalEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(goalData.createdAt).toLocaleDateString();
        const targetText = goalData.targetValue ? ` Target: ${goalData.targetValue}` : '';
        const currentText = goalData.currentValue ? ` Current: ${goalData.currentValue}` : '';
        const targetDateText = goalData.targetDate ? ` Target date: ${new Date(goalData.targetDate).toLocaleDateString()}` : '';
        const notesText = goalData.notes ? ` Notes: ${goalData.notes}` : '';
        
        // ✅ CHANGE: Include patient name in data text
        const doctorData = `Medical goal set for patient ${goalData.patientName}: ${goalData.description} (${goalData.goalType}, ${goalData.priority} priority).${targetText}${currentText}${targetDateText}. Date: ${date}.${notesText}`;

        const patientData = `Medical goal set: ${goalData.description} (${goalData.priority} priority).${targetText}${currentText}${targetDateText}. Date: ${date}.`;

        const metadata = {
          goal_id: goalData.goalId,
          patient_name: goalData.patientName,  // ✅ ADD THIS
          patient_id: goalData.patientId,
          appointment_id: goalData.appointmentId,
          goal_type: goalData.goalType,
          target_value: goalData.targetValue,
          current_value: goalData.currentValue,
          target_date: goalData.targetDate ? new Date(goalData.targetDate).toLocaleDateString() : undefined,
          priority: goalData.priority,
          status: goalData.status,
          set_date: date
        };

        await Promise.all([
          embedDoctorData(
            goalData.doctorId,
            'medical_goal_set',
            doctorData,
            metadata
          ),
          embedPatientData(
            goalData.patientId,
            'medical_goal_set',
            patientData,
            { ...metadata, doctor_id: goalData.doctorId }
          )
        ]);
      },
      'medical_goal_set',
      goalData.goalId
    );
  }
}

// Singleton instance for production use
export const medicalRAGHooks = new MedicalRAGService();

// Convenience exports
export const {
  onTreatmentPlanCreated,
  onMedicationPrescribed,
  onPrescriptionIssued,
  onMedicalGoalSet
} = medicalRAGHooks;
