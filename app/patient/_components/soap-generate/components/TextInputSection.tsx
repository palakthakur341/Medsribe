/**
 * Text Input Section Component
 * Handles text input for SOAP generation with validation and formatting
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Type,
  Clock
} from "lucide-react";

import { TextInputSectionProps } from "../types";

const MIN_LENGTH = 10;
const MAX_LENGTH = 50000;
const RECOMMENDED_LENGTH = 200;

export function TextInputSection({
  value,
  onChange,
  onProcess,
  isProcessing,
  disabled = false,
  className,
}: TextInputSectionProps) {
  
  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  const getCharacterCount = () => value.length;
  const getWordCount = () => value.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  const isValid = () => {
    const length = getCharacterCount();
    return length >= MIN_LENGTH && length <= MAX_LENGTH;
  };

  const getValidationStatus = () => {
    const length = getCharacterCount();
    
    if (length === 0) {
      return { type: 'neutral', message: 'Enter your medical text here' };
    }
    
    if (length < MIN_LENGTH) {
      return { 
        type: 'error', 
        message: `Minimum ${MIN_LENGTH} characters required (${MIN_LENGTH - length} more needed)` 
      };
    }
    
    if (length > MAX_LENGTH) {
      return { 
        type: 'error', 
        message: `Maximum ${MAX_LENGTH} characters allowed (${length - MAX_LENGTH} over limit)` 
      };
    }
    
    if (length < RECOMMENDED_LENGTH) {
      return { 
        type: 'warning', 
        message: `Consider adding more detail for better results (${RECOMMENDED_LENGTH - length} more recommended)` 
      };
    }
    
    return { type: 'success', message: 'Text length is optimal for processing' };
  };

  const validation = getValidationStatus();

  // ============================================================================
  // EXAMPLE TEXT
  // ============================================================================

  const exampleText = `Patient presents with chest pain that started 2 hours ago. Pain is described as sharp, 7/10 intensity, radiating to left arm. No shortness of breath or nausea. Patient has history of hypertension, currently on lisinopril. Vital signs: BP 140/90, HR 88, RR 16, Temp 98.6°F. Physical exam reveals normal heart sounds, no murmurs. EKG shows normal sinus rhythm. Plan includes cardiac enzymes, chest X-ray, and cardiology consultation.`;

  const handleUseExample = () => {
    onChange(exampleText);
  };

  const handleClear = () => {
    onChange('');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderValidationBadge = () => {
    const { type, message } = validation;
    
    if (type === 'neutral') return null;
    
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      success: 'default',
    } as const;
    
    const icons = {
      error: AlertCircle,
      warning: AlertCircle,
      success: CheckCircle,
    };
    
    const Icon = icons[type];
    
    return (
      <Badge variant={variants[type]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {message}
      </Badge>
    );
  };

  const renderCharacterCount = () => {
    const count = getCharacterCount();
    const isOverLimit = count > MAX_LENGTH;
    const isUnderMin = count < MIN_LENGTH && count > 0;
    
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Type className="h-3 w-3" />
          <span className={cn(
            isOverLimit || isUnderMin ? 'text-destructive' : ''
          )}>
            {count.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{getWordCount()} words</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 flex flex-col justify-center space-y-4 max-w-4xl mx-auto w-full">
        {/* Text Input Area */}
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your medical documentation here... Include patient symptoms, observations, medical history, assessment, and treatment plan for best results."
            disabled={disabled || isProcessing}
            className="min-h-[400px] resize-y"
          />

          {/* Character Count and Validation */}
          <div className="flex items-center justify-between">
            {renderCharacterCount()}
            {renderValidationBadge()}
          </div>
        </div>

        {/* Quick Actions */}
        {!value && (
          <div className="space-y-3">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleUseExample}
                disabled={disabled || isProcessing}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Use Example Text
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Try with sample medical documentation
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={disabled || isProcessing || !value}
            className="flex items-center gap-2"
          >
            Clear Text
          </Button>

          <Button
            onClick={onProcess}
            disabled={disabled || isProcessing || !isValid()}
            className="flex items-center gap-2 flex-1"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate SOAP Notes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
