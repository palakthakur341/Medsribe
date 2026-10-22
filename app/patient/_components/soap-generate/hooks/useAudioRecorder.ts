/**
 * Audio recording hook for SOAP generation
 * Handles microphone access, recording, and file management
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { UseAudioRecorderReturn } from '../types';

export function useAudioRecorder(
  onAudioReady?: (blob: Blob, fileName: string) => void,
  maxDuration: number = 600 // 10 minutes default
): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      requestPermission();
    } else {
      setHasPermission(false);
    }
  }, [requestPermission]);

  // ============================================================================
  // RECORDING TIMER
  // ============================================================================

  const startTimer = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        // Auto-stop at max duration
        if (newTime >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return newTime;
      });
    }, 1000);
  }, [maxDuration]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ============================================================================
  // RECORDING CONTROLS
  // ============================================================================

  const startRecording = useCallback(async () => {
    try {
      // Request permission if not already granted
      if (hasPermission === false) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Microphone permission is required for recording');
        }
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      // Reset chunks
      chunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        const fileName = `recording_${Date.now()}.webm`;
        onAudioReady?.(blob, fileName);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      startTimer();

    } catch (error) {
      console.error('Failed to start recording:', error);
      setHasPermission(false);
      throw error;
    }
  }, [hasPermission, requestPermission, onAudioReady, startTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  }, [isRecording, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }, [isRecording, isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [isRecording, isPaused, startTimer]);

  const removeAudio = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopTimer]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimeRemaining = useCallback((): number => {
    return Math.max(0, maxDuration - recordingTime);
  }, [maxDuration, recordingTime]);

  const isNearMaxDuration = useCallback((): boolean => {
    return recordingTime >= maxDuration - 30; // Last 30 seconds
  }, [recordingTime, maxDuration]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    hasPermission,

    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    removeAudio,

    // Utilities
    formatTime,
    getTimeRemaining,
    isNearMaxDuration,
    requestPermission,
  };
}
