/**
 * RAG API Service Layer
 * Provides role-based RAG API integration for MedScribe assistant system
 */

// Base types
export type RoleType = 'doctor' | 'patient';

export interface BaseRequest {
  similarity_threshold?: number;
  max_results?: number;
  include_context?: boolean;
}

export interface EmbedRequest {
  doctor_id?: string;
  patient_id?: string;
  event_type: string;
  data: string;
  metadata?: Record<string, any>;
}

export interface SearchRequest extends BaseRequest {
  doctor_id?: string;
  patient_id?: string;
  query: string;
}

// Response types
export interface BaseResponse {
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface KnowledgeBaseStats {
  total_entries: number;
  event_types: Record<string, number>;
  latest_entry: string;
  earliest_entry: string;
  role_type: RoleType;
  role_id: string;
}

export interface RelevantDocument {
  id: string;
  role_type: RoleType;
  role_id: string;
  event_type: string;
  content: string;
  content_chunk?: string;
  metadata: Record<string, any>;
  created_at: string;
  similarity_score: number;
}

export interface StructuredResponse {
  type: 'schedule_overview' | 'symptom_analysis' | 'medication_status' | 'appointment_status' | 'patient_summary' | 'prescription_history' | 'health_tracking';
  summary: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface SearchResponse extends BaseResponse {
  message?: string;
  role_type?: RoleType;
  role_id?: string;
  patient_id?: string; // For legacy compatibility
  query: string;
  response: string;
  structured_response?: StructuredResponse;
  relevant_documents_count: number;
  relevant_documents: RelevantDocument[];
  context_used: boolean;
  similarity_threshold: number;
  max_results: number;
  processing_time_seconds: number;
  generated_at: string;
}

export interface EmbedResponse extends BaseResponse {
  message?: string;
  role_type: RoleType;
  role_id: string;
  event_type: string;
  data_length: number;
  processing_time_seconds: number;
  knowledge_base_stats: KnowledgeBaseStats;
  stored_at: string;
}

export interface SummaryResponse extends BaseResponse {
  role_type?: RoleType;
  role_id?: string;
  patient_id?: string; // For legacy compatibility
  knowledge_base_summary: KnowledgeBaseStats;
  generated_at: string;
}

// Event-specific metadata types
export interface ScheduleMetadata {
  specialty?: string;
  location?: string;
  date?: string;
  duration_minutes?: number;
}

export interface SymptomMetadata {
  severity?: 'mild' | 'moderate' | 'severe';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional';
  duration?: string;
  related_medication?: string;
  triggers?: string;
}

export interface MedicationMetadata {
  medication?: string;
  dosage?: string;
  adherence_rate?: string;
  missed_doses?: number;
  timing?: string;
  condition?: string;
}

export interface VitalSignsMetadata {
  bp_systolic?: number;
  bp_diastolic?: number;
  heart_rate?: number;
  weight_kg?: number;
  temperature_f?: number;
  measurement_location?: 'home' | 'clinic' | 'hospital';
}

// RAG API Configuration
const RAG_API_BASE_URL = process.env.RAG_API_BASE_URL || 'http://localhost:8000/api/v1/rag';

// Default search parameters
const DEFAULT_SEARCH_PARAMS = {
  similarity_threshold: 0.6,
  max_results: 10,
  include_context: true,
};

/**
 * RAG API Service Class
 */
export class RAGAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = RAG_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Search for role-specific information using RAG
   */
  async search(params: SearchRequest): Promise<SearchResponse> {
    const { doctor_id, patient_id, query, ...searchParams } = params;
    
    // Validate role parameters
    if (doctor_id && patient_id) {
      throw new Error('Cannot specify both doctor_id and patient_id');
    }
    
    if (!doctor_id && !patient_id) {
      throw new Error('Must specify either doctor_id or patient_id');
    }

    // Determine endpoint based on role
    const endpoint = doctor_id ? '/search/doctor' : '/search/patient';
    const requestBody = {
      ...(doctor_id ? { doctor_id } : { patient_id }),
      query,
      ...DEFAULT_SEARCH_PARAMS,
      ...searchParams,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: SearchResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'RAG search failed');
      }

      return result;
    } catch (error) {
      console.error('RAG API search error:', error);
      throw error;
    }
  }

  /**
   * Store data in RAG system (embedding)
   */
  async embed(params: EmbedRequest): Promise<EmbedResponse> {
    const { doctor_id, patient_id, event_type, data, metadata } = params;
    
    // Validate role parameters
    if (doctor_id && patient_id) {
      throw new Error('Cannot specify both doctor_id and patient_id');
    }
    
    if (!doctor_id && !patient_id) {
      throw new Error('Must specify either doctor_id or patient_id');
    }

    const requestBody = {
      ...(doctor_id ? { doctor_id } : { patient_id }),
      event_type,
      data,
      metadata,
    };

    try {
      const response = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: EmbedResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'RAG embed failed');
      }

      return result;
    } catch (error) {
      console.error('RAG API embed error:', error);
      throw error;
    }
  }

  /**
   * Get knowledge base summary for a role
   */
  async getSummary(roleType: RoleType, roleId: string): Promise<SummaryResponse> {
    const endpoint = `/${roleType}/${roleId}/summary`;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: SummaryResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'RAG summary failed');
      }

      return result;
    } catch (error) {
      console.error('RAG API summary error:', error);
      throw error;
    }
  }

  /**
   * Health check for RAG system
   */
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RAG API health check error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const ragAPIService = new RAGAPIService();

// Convenience functions for role-based searches
export const searchDoctorRAG = (doctorId: string, query: string, options?: Partial<BaseRequest>) =>
  ragAPIService.search({ doctor_id: doctorId, query, ...options });

export const searchPatientRAG = (patientId: string, query: string, options?: Partial<BaseRequest>) =>
  ragAPIService.search({ patient_id: patientId, query, ...options });

// Convenience functions for embedding data
export const embedDoctorData = (doctorId: string, eventType: string, data: string, metadata?: Record<string, any>) =>
  ragAPIService.embed({ doctor_id: doctorId, event_type: eventType, data, metadata });

export const embedPatientData = (patientId: string, eventType: string, data: string, metadata?: Record<string, any>) =>
  ragAPIService.embed({ patient_id: patientId, event_type: eventType, data, metadata });
