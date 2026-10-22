/**
 * Audio Input Section Component
 * Handles audio recording and file upload with modern UI
 */

"use client";

import * as React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  Trash2,
  FileAudio,
  Clock
} from "lucide-react";

import { AudioInputSectionProps } from "../types";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export function AudioInputSection({
  onAudioReady,
  onAudioRemove,
  onProcess,
  audioBlob,
  fileName,
  isProcessing,
  disabled = false,
  className,
}: AudioInputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob: recordedBlob,
    hasPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    removeAudio: removeRecordedAudio,
    formatTime,
    getTimeRemaining,
    isNearMaxDuration,
  } = useAudioRecorder(onAudioReady, 600); // 10 minutes max

  const currentAudioBlob = audioBlob || recordedBlob;

  // ============================================================================
  // FILE UPLOAD HANDLING
  // ============================================================================

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      onAudioReady(file, file.name);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    removeRecordedAudio();
    onAudioRemove();
  };

  // ============================================================================
  // RECORDING CONTROLS
  // ============================================================================

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderRecordingControls = () => {
    if (currentAudioBlob) return null;

    if (!isRecording) {
      return (
        <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto">
          {/* Recording Button */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleStartRecording}
              disabled={disabled || hasPermission === false}
              size="lg"
              className="h-20 w-20 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Mic className="h-8 w-8" />
            </Button>
            <div>
              <p className="font-medium text-base">
                {hasPermission === false
                  ? 'Microphone Access Required'
                  : 'Start Recording'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Click the microphone to begin
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Upload Section */}
          <div className="text-center space-y-3 w-full">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-2 px-6 py-3 mx-auto"
              size="lg"
            >
              <Upload className="h-5 w-5" />
              Upload Audio File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Supports MP3, WAV, M4A, FLAC (max 50MB)
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Recording Status */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={cn(
              "h-3 w-3 rounded-full",
              isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"
            )} />
            <span className="font-medium">
              {isPaused ? 'Recording Paused' : 'Recording...'}
            </span>
          </div>
          
          <div className="text-2xl font-mono font-bold">
            {formatTime(recordingTime)}
          </div>
          
          {isNearMaxDuration() && (
            <Badge variant="destructive" className="mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(getTimeRemaining())} remaining
            </Badge>
          )}
        </div>

        {/* Recording Progress */}
        <Progress 
          value={(recordingTime / 600) * 100} 
          className="w-full"
        />

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePauseResume}
            className="h-12 w-12 rounded-full"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={handleStopRecording}
            className="h-12 w-12 rounded-full"
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAudioPreview = () => {
    if (!currentAudioBlob) return null;

    return (
      <div className="space-y-4">
        {/* Audio File Info */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <FileAudio className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">{fileName || 'Recorded Audio'}</p>
            <p className="text-sm text-muted-foreground">
              {recordingTime > 0 ? formatTime(recordingTime) : 'Audio file ready'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAudio}
            disabled={disabled || isProcessing}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Audio Player */}
        {currentAudioBlob && (
          <audio 
            controls 
            className="w-full"
            src={URL.createObjectURL(currentAudioBlob)}
          />
        )}

        {/* Process Button */}
        <Button
          onClick={onProcess}
          disabled={disabled || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing...' : 'Generate SOAP Notes'}
        </Button>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 flex items-center justify-center">
        {currentAudioBlob ? renderAudioPreview() : renderRecordingControls()}
      </div>
    </div>
  );
}
