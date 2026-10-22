/**
 * Processing Indicator Component
 * Shows processing progress with animated indicators and stage information
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Mic, 
  FileText, 
  Brain, 
  Sparkles, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

import { ProcessingIndicatorProps } from "../types";
import { ProcessingStage } from "@/lib/types/soap-api";

const STAGE_CONFIG: Record<ProcessingStage, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  uploading: {
    label: 'Uploading',
    description: 'Uploading your audio file...',
    icon: Upload,
    color: 'text-blue-500',
  },
  transcribing: {
    label: 'Transcribing',
    description: 'Converting speech to text...',
    icon: Mic,
    color: 'text-purple-500',
  },
  validating: {
    label: 'Validating',
    description: 'Validating medical content...',
    icon: FileText,
    color: 'text-orange-500',
  },
  analyzing: {
    label: 'Analyzing',
    description: 'Analyzing medical content...',
    icon: Brain,
    color: 'text-indigo-500',
  },
  generating: {
    label: 'Generating',
    description: 'Generating SOAP notes...',
    icon: Sparkles,
    color: 'text-green-500',
  },
  complete: {
    label: 'Complete',
    description: 'SOAP notes generated successfully!',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  error: {
    label: 'Error',
    description: 'An error occurred during processing',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
};

export function ProcessingIndicator({
  processingState,
  className,
}: ProcessingIndicatorProps) {
  const { isProcessing, progress, stage, message, error } = processingState;
  const config = STAGE_CONFIG[stage];

  if (!isProcessing && stage !== 'complete' && stage !== 'error') {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Processing Card */}
      <div className="p-6 bg-card border rounded-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "p-2 rounded-lg bg-muted",
            stage === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
          )}>
            {stage === 'error' ? (
              <config.icon className={cn("h-5 w-5", config.color)} />
            ) : isProcessing ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <config.icon className={cn("h-5 w-5", config.color)} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{config.label}</h3>
              <Badge 
                variant={stage === 'error' ? 'destructive' : stage === 'complete' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {stage === 'complete' ? 'Done' : stage === 'error' ? 'Failed' : 'Processing'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {message || config.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {(isProcessing || stage === 'complete') && stage !== 'error' && (
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}% complete</span>
              <span>{config.label}</span>
            </div>
          </div>
        )}

        {/* Error Details */}
        {stage === 'error' && error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      {isProcessing && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(STAGE_CONFIG).map(([stageKey, stageConfig]) => {
            if (stageKey === 'complete' || stageKey === 'error') return null;
            
            const isActive = stage === stageKey;
            const isCompleted = getStageOrder(stage) > getStageOrder(stageKey as ProcessingStage);
            
            return (
              <div
                key={stageKey}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  isActive 
                    ? "border-primary bg-primary/5" 
                    : isCompleted 
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" 
                    : "border-muted bg-muted/30"
                )}
              >
                <div className="flex justify-center mb-2">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <stageConfig.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className={cn(
                  "text-xs font-medium",
                  isActive 
                    ? "text-primary" 
                    : isCompleted 
                    ? "text-green-600" 
                    : "text-muted-foreground"
                )}>
                  {stageConfig.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Success Message */}
      {stage === 'complete' && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Processing Complete!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Your SOAP notes have been generated successfully with AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStageOrder(stage: ProcessingStage): number {
  const order: Record<ProcessingStage, number> = {
    uploading: 1,
    transcribing: 2,
    validating: 3,
    analyzing: 4,
    generating: 5,
    complete: 6,
    error: -1,
  };
  return order[stage] || 0;
}
