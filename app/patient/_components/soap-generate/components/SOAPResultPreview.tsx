/**
 * SOAP Result Preview Component
 * Shows a preview of the generated SOAP notes with actions
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  User,
  Stethoscope,
  ClipboardList,
  Target
} from "lucide-react";

import { SOAPResultPreviewProps } from "../types";

export function SOAPResultPreview({
  result,
  className,
}: SOAPResultPreviewProps) {
  const { data } = result;
  const soapNotes = data.soap_notes;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSOAPSection = (
    title: string,
    content: string,
    icon: React.ComponentType<{ className?: string }>,
    description: string
  ) => {
    const Icon = icon;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm leading-relaxed">
            {truncateText(content)}
          </p>
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-primary">
            {Math.round(data.quality_metrics.completeness_score * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Quality Score</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-primary">
            {data.specialty_detection.detected_specialty}
          </div>
          <div className="text-xs text-muted-foreground">Specialty</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-primary">
            {data.transcription?.duration ? `${data.transcription.duration}s` : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Processing Time</div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-primary">
            {data.safety_check.is_safe ? 'Safe' : 'Review'}
          </div>
          <div className="text-xs text-muted-foreground">Safety Status</div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated SOAP Notes
              </CardTitle>
              <CardDescription>
                AI-generated clinical documentation • {formatTimestamp(result.timestamp)}
              </CardDescription>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Session: {data.session_id.slice(-8)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderMetadata()}
        </CardContent>
      </Card>

      {/* SOAP Sections Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjective */}
        <Card>
          <CardContent className="p-4">
            {renderSOAPSection(
              "Subjective",
              soapNotes.subjective,
              User,
              "Patient's reported symptoms and history"
            )}
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardContent className="p-4">
            {renderSOAPSection(
              "Objective",
              soapNotes.objective,
              Stethoscope,
              "Clinical observations and measurements"
            )}
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardContent className="p-4">
            {renderSOAPSection(
              "Assessment",
              soapNotes.assessment,
              ClipboardList,
              "Clinical diagnosis and evaluation"
            )}
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardContent className="p-4">
            {renderSOAPSection(
              "Plan",
              soapNotes.plan,
              Target,
              "Treatment plan and next steps"
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Information */}
      {data.soap_notes.soap_notes && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Enhanced Clinical Information</CardTitle>
            <CardDescription>
              Additional structured data from AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Diagnosis */}
            {data.soap_notes.soap_notes.assessment?.primary_diagnosis && (
              <div>
                <h4 className="font-medium text-sm mb-2">Primary Diagnosis</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {data.soap_notes.soap_notes.assessment.primary_diagnosis.diagnosis}
                    </span>
                    <Badge variant="outline">
                      {data.soap_notes.soap_notes.assessment.primary_diagnosis.icd10_code}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.soap_notes.soap_notes.assessment.primary_diagnosis.clinical_reasoning}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {data.soap_notes.soap_notes.assessment.primary_diagnosis.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(data.soap_notes.soap_notes.assessment.primary_diagnosis.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Vital Signs */}
            {data.soap_notes.soap_notes.objective?.vital_signs && (
              <div>
                <h4 className="font-medium text-sm mb-2">Vital Signs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(data.soap_notes.soap_notes.objective.vital_signs).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div key={key} className="p-2 bg-muted/50 rounded text-center">
                        <div className="text-sm font-medium">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {data.soap_notes.soap_notes.plan?.follow_up && data.soap_notes.soap_notes.plan.follow_up.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Follow-up Plan</h4>
                <div className="space-y-2">
                  {data.soap_notes.soap_notes.plan.follow_up.map((followUp, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{followUp.provider}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{followUp.timeframe}</span>
                        <Badge variant={followUp.urgency === 'urgent' ? 'destructive' : 'outline'} className="text-xs">
                          {followUp.urgency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Removed to prevent duplication with main page buttons */}
    </div>
  );
}
