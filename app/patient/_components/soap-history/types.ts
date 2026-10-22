import { Id } from "@/convex/_generated/dataModel";

// Enhanced SOAP Note interface with new schema structure
export interface SOAPNote {
  _id: Id<"soapNotes">;
  patientId: Id<"patients">;
  audioRecordingId?: Id<"audioRecordings">;
  status?: string;
  timestamp: number;

  // Enhanced data structure from API (required)
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

    soap_notes: {
      soap_notes: {
        subjective: {
          chief_complaint: string;
          history_present_illness: string;
          review_of_systems: string[];
          past_medical_history: string[];
          medications: string[];
          allergies: string[];
          social_history: string;
        };
        objective: {
          vital_signs: any;
          physical_exam: any;
          diagnostic_results: string[];
          mental_status: string;
          functional_status: string;
        };
        assessment: {
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
            status: "active" | "resolved" | "chronic";
            priority: "high" | "medium" | "low";
          }>;
          risk_level: "low" | "moderate" | "high";
          risk_factors: string[];
          prognosis: string;
        };
        plan: {
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
        };
        clinical_notes: string;
      };
      quality_metrics: {
        completeness_score: number;
        clinical_accuracy: number;
        documentation_quality: number;
        red_flags: string[];
        missing_information: string[];
      };
      session_id: string;
      specialty: string;

    };

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
}

// Patient profile interface
export interface PatientProfile {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdAt: number;
  updatedAt: number;
}

// Shared SOAP Note interface
export interface SharedSOAPNote {
  _id: Id<"sharedSoapNotes">;
  soapNoteId: Id<"soapNotes">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  doctor?: {
    _id: Id<"doctors">;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
  isRead: boolean;
  sharedAt: number;
  readAt?: number;
  notes?: string;
}

// Referral interface
export interface Referral {
  _id: Id<"referrals">;
  patientId: Id<"patients">;
  fromDoctorId: Id<"doctors">;
  toDoctorId: Id<"doctors">;
  soapNoteId?: Id<"soapNotes">;
  reason: string;
  status: "pending" | "accepted" | "declined" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: number;
  updatedAt: number;
}

// Timeline item interface
export interface TimelineItem {
  id: string;
  type: "shared" | "referral" | "created";
  title: string;
  description: string;
  timestamp: number;
  status?: "pending" | "completed" | "read" | "unread";
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

// Enhanced Stats interface
export interface SOAPStats {
  totalNotes: number;
  sharedCount: number;
  avgQuality: number;
  recentNotes: number;

  // Enhanced metrics
  enhancedNotesCount: number;
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
  avgProcessingTime: number;
}

// Enhanced search and filter interfaces
export interface SearchFilters {
  searchTerm: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  qualityRange?: {
    min: number;
    max: number;
  };
  sharedOnly?: boolean;
  sortBy?: "date" | "quality" | "shared" | "specialty" | "safety";
  sortOrder?: "asc" | "desc";

  // Enhanced filters for new data structure
  specialty?: string[];
  safetyStatus?: "safe" | "unsafe" | "all";
  hasEnhancedData?: boolean;
  qualityLevel?: QualityLevel[];
  hasRedFlags?: boolean;
  transcriptionConfidence?: {
    min: number;
    max: number;
  };
}

// Component prop interfaces
export interface BaseSOAPComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SOAPNoteCardProps extends BaseSOAPComponentProps {
  note: SOAPNote;
  sharedWith?: SharedSOAPNote[];
  timelineItems?: TimelineItem[];
  onDownload?: (note: SOAPNote) => void;
  onShare?: (noteId: Id<"soapNotes">) => void;
  onView?: (noteId: Id<"soapNotes">) => void;
  formatDate?: (timestamp: number) => string;
  getQualityColor?: (score?: number) => string;
  compact?: boolean;
  showActions?: boolean;
}

export interface SOAPNotesGridProps extends BaseSOAPComponentProps {
  notes: SOAPNote[];
  sharedNotesMap?: Map<string, SharedSOAPNote[]>;
  referrals?: Referral[];
  onDownload?: (note: SOAPNote) => void;
  onShare?: (noteId: Id<"soapNotes">) => void;
  onView?: (noteId: Id<"soapNotes">) => void;
  formatDate?: (timestamp: number) => string;
  getQualityColor?: (score?: number) => string;
  loading?: boolean;
  virtualized?: boolean;
}

export interface SOAPSearchBarProps extends BaseSOAPComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  placeholder?: string;
  debounceMs?: number;
  showFilters?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}

export interface SOAPStatsOverviewProps extends BaseSOAPComponentProps {
  stats: SOAPStats;
  loading?: boolean;
  compact?: boolean;
  showTrends?: boolean;
  showEnhanced?: boolean;
}

export interface SOAPEmptyStateProps extends BaseSOAPComponentProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  onCreateNew?: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  showCreateAction?: boolean;
}

export interface SOAPHistoryHeaderProps extends BaseSOAPComponentProps {
  patientProfile?: PatientProfile;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  title?: string;
  subtitle?: string;
}

// Hook return types (only keeping what's used)
export interface UseSOAPNoteDialogReturn {
  selectedNote: SOAPNote | null;
  isOpen: boolean;
  openDialog: (note: SOAPNote) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

export interface UseSOAPDocumentViewerReturn {
  selectedNote: SOAPNote | null;
  isViewingDocument: boolean;
  openDocument: (note: SOAPNote) => void;
  closeDocument: () => void;
  setViewingDocument: (viewing: boolean) => void;
}

export interface UseSOAPStatsReturn {
  stats: SOAPStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => void;
}

export interface UseSOAPSearchReturn {
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  filteredNotes: SOAPNote[];
  searchCount: number;
}

export interface UseSOAPFiltersReturn {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  filteredNotes: SOAPNote[];
  hasActiveFilters: boolean;
}

export interface UseSOAPHistoryReturn {
  // Data
  soapNotes: SOAPNote[] | undefined;
  sharedNotes: SharedSOAPNote[] | undefined;
  referrals: Referral[] | undefined;
  patientProfile: PatientProfile | undefined;
  filteredNotes: SOAPNote[];
  sharedNotesMap: Map<string, SharedSOAPNote[]>;
  stats: SOAPStats;

  // State
  searchTerm: string;
  selectedNote: string | null;
  selectedSoapNoteId: string | null;
  shareDialogOpen: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedNote: (noteId: string | null) => void;
  setShareDialogOpen: (open: boolean) => void;
  handleShareNote: (soapNoteId: string) => void;
  handleShareSuccess: () => void;
  handleDownloadNote: (note: SOAPNote) => void;
  handleClearSearch: () => void;

  // Utils
  formatDate: (timestamp: number) => string;
  getQualityColor: (score?: number, note?: SOAPNote) => string;
}



// Utility types
export type QualityLevel = "excellent" | "good" | "fair" | "poor";
export type SortOption = "date" | "quality" | "shared" | "alphabetical";
export type ViewMode = "grid" | "list" | "compact";

// Error types
export interface SOAPError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface LoadingStates {
  notes: boolean;
  sharing: boolean;
  downloading: boolean;
  stats: boolean;
}

// Utility functions for extracting data from enhanced SOAP structure
export const SOAPUtils = {
  // Get subjective text from enhanced structure
  getSubjective: (note: SOAPNote): string => {
    const subjective = note.data?.soap_notes?.soap_notes?.subjective;
    if (!subjective) return '';

    const parts = [];

    if (subjective.chief_complaint) {
      parts.push(`Chief Complaint: ${subjective.chief_complaint}`);
    }

    if (subjective.history_present_illness) {
      parts.push(`History of Present Illness: ${subjective.history_present_illness}`);
    }

    if (subjective.review_of_systems?.length) {
      parts.push(`Review of Systems: ${subjective.review_of_systems.join(', ')}`);
    }

    if (subjective.past_medical_history?.length) {
      parts.push(`Past Medical History: ${subjective.past_medical_history.join(', ')}`);
    }

    if (subjective.medications?.length) {
      parts.push(`Current Medications: ${subjective.medications.join(', ')}`);
    }

    if (subjective.allergies?.length) {
      parts.push(`Allergies: ${subjective.allergies.join(', ')}`);
    }

    if (subjective.social_history) {
      parts.push(`Social History: ${subjective.social_history}`);
    }

    return parts.join('\n') || '';
  },

  // Get objective text from enhanced structure (excluding vital signs and physical exam as they have dedicated sections)
  getObjective: (note: SOAPNote): string => {
    const objective = note.data?.soap_notes?.soap_notes?.objective;
    if (!objective) return '';

    const parts = [];

    // Skip vital_signs and physical_exam as they have dedicated sections

    if (objective.diagnostic_results?.length) {
      parts.push(`Diagnostic Results: ${objective.diagnostic_results.join(', ')}`);
    }

    if (objective.mental_status) {
      parts.push(`Mental Status: ${objective.mental_status}`);
    }

    if (objective.functional_status) {
      parts.push(`Functional Status: ${objective.functional_status}`);
    }

    return parts.join('\n') || '';
  },

  // Get assessment text from enhanced structure
  getAssessment: (note: SOAPNote): string => {
    const assessment = note.data?.soap_notes?.soap_notes?.assessment;
    if (!assessment) return '';

    const parts = [];
    if (assessment.primary_diagnosis?.diagnosis) {
      parts.push(`Primary Diagnosis: ${assessment.primary_diagnosis.diagnosis}`);
      if (assessment.primary_diagnosis.clinical_reasoning) {
        parts.push(`Clinical Reasoning: ${assessment.primary_diagnosis.clinical_reasoning}`);
      }
    }
    if (assessment.differential_diagnoses?.length) {
      parts.push(`Differential Diagnoses: ${assessment.differential_diagnoses.map(d => d.diagnosis).join(', ')}`);
    }
    if (assessment.problem_list?.length) {
      parts.push(`Problem List: ${assessment.problem_list.map(p => p.problem).join(', ')}`);
    }
    if (assessment.risk_level) parts.push(`Risk Level: ${assessment.risk_level}`);
    if (assessment.prognosis) parts.push(`Prognosis: ${assessment.prognosis}`);

    return parts.join('\n') || '';
  },

  // Get plan text from enhanced structure
  getPlan: (note: SOAPNote): string => {
    const plan = note.data?.soap_notes?.soap_notes?.plan;
    if (!plan) return '';

    const parts = [];

    if (plan.diagnostic_workup?.length) {
      parts.push(`Diagnostic Workup: ${plan.diagnostic_workup.join(', ')}`);
    }

    if (plan.treatments?.length) {
      parts.push(`Treatments: ${plan.treatments.join(', ')}`);
    }

    if (plan.medications?.length) {
      parts.push(`Medications: ${plan.medications.join(', ')}`);
    }

    if (plan.follow_up?.length) {
      const followUps = plan.follow_up.map(f =>
        `${f.provider} (${f.timeframe}${f.urgency !== 'routine' ? `, ${f.urgency}` : ''})`
      ).join(', ');
      parts.push(`Follow-up: ${followUps}`);
    }

    if (plan.patient_education?.length) {
      parts.push(`Patient Education: ${plan.patient_education.join(', ')}`);
    }

    if (plan.referrals?.length) {
      parts.push(`Referrals: ${plan.referrals.join(', ')}`);
    }

    return parts.join('\n') || '';
  },

  // Get quality score from enhanced structure
  getQualityScore: (note: SOAPNote): number | undefined => {
    return note.data?.qa_results?.quality_score ||
           (note.data?.quality_metrics?.completeness_score ? Math.round(note.data.quality_metrics.completeness_score * 100) : undefined);
  },

  // Get specialty from enhanced structure
  getSpecialty: (note: SOAPNote): string | undefined => {
    return note.data?.specialty_detection?.specialty ||
           note.data?.soap_notes?.specialty;
  },

  // Get safety status from enhanced structure
  getSafetyStatus: (note: SOAPNote): boolean | undefined => {
    return note.data?.safety_check?.is_safe;
  },

  // Get red flags from enhanced structure
  getRedFlags: (note: SOAPNote): string[] => {
    return note.data?.quality_metrics?.red_flags ||
           note.data?.safety_check?.red_flags ||
           [];
  },

  // Get recommendations from enhanced structure
  getRecommendations: (note: SOAPNote): string[] => {
    return note.data?.qa_results?.recommendations ||
           [];
  },

  // Get session ID from enhanced structure
  getSessionId: (note: SOAPNote): string | undefined => {
    return note.data?.session_id ||
           note.data?.soap_notes?.session_id;
  },

  // Get processing time from enhanced structure
  getProcessingTime: (note: SOAPNote): string | undefined => {
    return (note.data?.transcription?.duration ? `${note.data.transcription.duration} seconds` : undefined);
  },

  // Check if note has enhanced data structure
  hasEnhancedData: (note: SOAPNote): boolean => {
    return !!note.data?.enhanced_pipeline;
  },

  // Get chief complaint from enhanced structure
  getChiefComplaint: (note: SOAPNote): string | undefined => {
    return note.data?.soap_notes?.soap_notes?.subjective?.chief_complaint;
  },

  // Get primary diagnosis from enhanced structure
  getPrimaryDiagnosis: (note: SOAPNote): string | undefined => {
    return note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.diagnosis;
  },

  // Get vital signs from enhanced structure
  getVitalSigns: (note: SOAPNote): any => {
    return note.data?.soap_notes?.soap_notes?.objective?.vital_signs;
  },

  // Get physical examination from enhanced structure
  getPhysicalExam: (note: SOAPNote): any => {
    return note.data?.soap_notes?.soap_notes?.objective?.physical_exam;
  },

  // Get medications from enhanced structure
  getMedications: (note: SOAPNote): string[] => {
    return note.data?.soap_notes?.soap_notes?.subjective?.medications ||
           note.data?.soap_notes?.soap_notes?.plan?.medications ||
           [];
  },

  // Get allergies from enhanced structure
  getAllergies: (note: SOAPNote): string[] => {
    return note.data?.soap_notes?.soap_notes?.subjective?.allergies || [];
  }
};
