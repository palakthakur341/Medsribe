/**
 * MedScribe Enhanced SOAP Generation API Client
 * 
 * Provides methods for audio and text processing with the enhanced SOAP generation system.
 * Includes proper error handling, retry logic, and TypeScript support.
 */

import {
  AudioProcessingRequest,
  TextProcessingRequest,
  SOAPProcessingResponse,
  ErrorResponse,
  MedScribeAPIConfig,
  APIResponse,
  ProcessingState,
} from '@/lib/types/soap-api';

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class MedScribeAPI {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: MedScribeAPIConfig = {}) {
    // Use Next.js API routes instead of calling external API directly
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 300000; // 5 minutes default
    this.retries = config.retries || 3;
  }

  // ============================================================================
  // AUDIO PROCESSING
  // ============================================================================

  /**
   * Process audio file for SOAP generation
   */
  async processAudio(
    audioFile: File, 
    patientId: string,
    onProgress?: (state: ProcessingState) => void
  ): Promise<SOAPProcessingResponse> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('patient_id', patientId);

    // Update progress - uploading
    onProgress?.({
      isProcessing: true,
      progress: 10,
      stage: 'uploading',
      message: 'Uploading audio file...'
    });

    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/patient/soap`, {
        method: 'POST',
        body: formData,
      });

      // Update progress - transcribing
      onProgress?.({
        isProcessing: true,
        progress: 30,
        stage: 'transcribing',
        message: 'Transcribing audio...'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error response, use the status message
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Update progress - analyzing
      onProgress?.({
        isProcessing: true,
        progress: 60,
        stage: 'analyzing',
        message: 'Analyzing medical content...'
      });

      const result: SOAPProcessingResponse = await response.json();

      // Update progress - generating
      onProgress?.({
        isProcessing: true,
        progress: 80,
        stage: 'generating',
        message: 'Generating SOAP notes...'
      });

      // Final progress - complete
      onProgress?.({
        isProcessing: false,
        progress: 100,
        stage: 'complete',
        message: 'SOAP notes generated successfully!'
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress?.({
        isProcessing: false,
        progress: 0,
        stage: 'error',
        message: 'Failed to process audio',
        error: errorMessage
      });

      // Create a more descriptive error
      const enhancedError = new Error(`Audio processing failed: ${errorMessage}`);
      enhancedError.cause = error;
      throw enhancedError;
    }
  }

  // ============================================================================
  // TEXT PROCESSING
  // ============================================================================

  /**
   * Process text for SOAP generation
   */
  async processText(
    text: string, 
    patientId: string,
    onProgress?: (state: ProcessingState) => void
  ): Promise<SOAPProcessingResponse> {
    const requestBody: TextProcessingRequest = {
      text: text,
      patient_id: patientId
    };

    // Update progress - validating
    onProgress?.({
      isProcessing: true,
      progress: 20,
      stage: 'validating',
      message: 'Validating medical text...'
    });

    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/patient/soap/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Update progress - analyzing
      onProgress?.({
        isProcessing: true,
        progress: 50,
        stage: 'analyzing',
        message: 'Analyzing medical content...'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error response, use the status message
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Update progress - generating
      onProgress?.({
        isProcessing: true,
        progress: 80,
        stage: 'generating',
        message: 'Generating SOAP notes...'
      });

      const result: SOAPProcessingResponse = await response.json();

      // Final progress - complete
      onProgress?.({
        isProcessing: false,
        progress: 100,
        stage: 'complete',
        message: 'SOAP notes generated successfully!'
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress?.({
        isProcessing: false,
        progress: 0,
        stage: 'error',
        message: 'Failed to process text',
        error: errorMessage
      });

      // Create a more descriptive error
      const enhancedError = new Error(`Text processing failed: ${errorMessage}`);
      enhancedError.cause = error;
      throw enhancedError;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Make HTTP request with retry logic and timeout
   */
  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on abort (timeout) or on last attempt
        if (controller.signal.aborted || attempt === this.retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  }

  /**
   * Validate audio file before processing
   */
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      return { valid: false, error: 'Please select an audio file' };
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    // Check supported formats - more comprehensive MIME type checking
    const supportedMimeTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/m4a',
      'audio/mp4',
      'audio/x-m4a',
      'audio/flac',
      'audio/x-flac',
      'audio/webm',
      'audio/ogg'
    ];

    // Also check file extension as fallback
    const fileName = file.name.toLowerCase();
    const supportedExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.webm', '.ogg'];

    const mimeTypeSupported = supportedMimeTypes.includes(file.type.toLowerCase());
    const extensionSupported = supportedExtensions.some(ext => fileName.endsWith(ext));

    if (!mimeTypeSupported && !extensionSupported) {
      return {
        valid: false,
        error: `Unsupported audio format. Supported formats: MP3, WAV, M4A, FLAC. Detected type: ${file.type || 'unknown'}`
      };
    }

    return { valid: true };
  }

  /**
   * Validate text before processing
   */
  validateText(text: string): { valid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, error: 'Please enter medical text to process' };
    }

    if (text.length < 10) {
      return { valid: false, error: 'Text must be at least 10 characters long' };
    }

    if (text.length > 50000) {
      return { valid: false, error: 'Text must be less than 50,000 characters' };
    }

    return { valid: true };
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get API configuration
   */
  getConfig(): MedScribeAPIConfig {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retries: this.retries,
    };
  }

  /**
   * Update API configuration
   */
  updateConfig(config: Partial<MedScribeAPIConfig>): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.timeout) this.timeout = config.timeout;
    if (config.retries) this.retries = config.retries;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create a default instance for easy use
export const medscribeAPI = new MedScribeAPI();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper function to create API response wrapper
 */
export function createAPIResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): APIResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to handle API errors
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Helper function to format processing time
 */
export function formatProcessingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MedScribeAPI;
export type { MedScribeAPIConfig, APIResponse };
