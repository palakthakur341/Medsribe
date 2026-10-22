/**
 * Quality Metrics Display Component
 * Shows quality metrics, specialty detection, and safety information
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Target,
  Award
} from "lucide-react";

import { QualityMetricsDisplayProps } from "../types";

export function QualityMetricsDisplay({
  metrics,
  specialty,
  safety,
  className,
}: QualityMetricsDisplayProps) {

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  const getOverallScore = (): number => {
    return (metrics.completeness_score + metrics.clinical_accuracy + metrics.documentation_quality) / 3;
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 0.9) return "A+";
    if (score >= 0.8) return "A";
    if (score >= 0.7) return "B";
    if (score >= 0.6) return "C";
    return "D";
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderQualityMetric = (
    label: string,
    score: number,
    description: string,
    icon: React.ComponentType<{ className?: string }>
  ) => {
    const Icon = icon;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Badge variant={getQualityBadgeVariant(score)}>
            {formatPercentage(score)}
          </Badge>
        </div>
        <Progress value={score * 100} className="h-2" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    );
  };

  const renderSafetyStatus = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className={cn(
            "h-5 w-5",
            safety.is_safe ? "text-green-600" : "text-red-600"
          )} />
          <span className="font-medium">Safety Assessment</span>
          <Badge variant={safety.is_safe ? "default" : "destructive"}>
            {safety.is_safe ? "Safe" : "Needs Review"}
          </Badge>
        </div>

        {safety.red_flags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Red Flags
            </h4>
            <ul className="space-y-1">
              {safety.red_flags.map((flag, index) => (
                <li key={index} className="text-sm text-destructive flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {safety.critical_items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-600 flex items-center gap-1">
              <Info className="h-4 w-4" />
              Critical Items
            </h4>
            <ul className="space-y-1">
              {safety.critical_items.map((item, index) => (
                <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {safety.is_safe && safety.red_flags.length === 0 && safety.critical_items.length === 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">No safety concerns identified</span>
          </div>
        )}
      </div>
    );
  };

  const renderMissingInformation = () => {
    if (metrics.missing_information.length === 0) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">All required information present</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-orange-600 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Missing Information
        </h4>
        <ul className="space-y-1">
          {metrics.missing_information.map((item, index) => (
            <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
              <span className="text-orange-600">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const overallScore = getOverallScore();

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Overall Quality Score */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Overall Quality
          </CardTitle>
          <CardDescription>
            Comprehensive documentation assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={cn(
              "text-4xl font-bold",
              getQualityColor(overallScore)
            )}>
              {getScoreGrade(overallScore)}
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              {formatPercentage(overallScore)}
            </div>
          </div>
          
          <div className="space-y-3">
            {renderQualityMetric(
              "Completeness",
              metrics.completeness_score,
              "How complete is the documentation",
              Target
            )}
            
            {renderQualityMetric(
              "Clinical Accuracy",
              metrics.clinical_accuracy,
              "Medical accuracy and consistency",
              Stethoscope
            )}
            
            {renderQualityMetric(
              "Documentation Quality",
              metrics.documentation_quality,
              "Structure and clarity of notes",
              TrendingUp
            )}
          </div>
        </CardContent>
      </Card>

      {/* Specialty Detection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Specialty Detection
          </CardTitle>
          <CardDescription>
            AI-identified medical specialty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">{specialty.detected_specialty}</h3>
            <Badge variant="secondary" className="mt-1">
              {formatPercentage(specialty.confidence)} confidence
            </Badge>
          </div>

          {specialty.focus_areas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {specialty.focus_areas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {renderMissingInformation()}
        </CardContent>
      </Card>

      {/* Safety Assessment */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Safety Assessment
          </CardTitle>
          <CardDescription>
            Clinical safety and risk evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderSafetyStatus()}
        </CardContent>
      </Card>
    </div>
  );
}
