"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  History,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pill,
  Activity,
  FileText,
  Target,
  Calendar,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchPatientRAG } from "@/lib/services/rag-api";
import type { Id } from "@/convex/_generated/dataModel";

interface PatientHistoryInsightsProps {
  patientId: Id<"patients">;
  onInsightSelect?: (insight: any) => void;
  className?: string;
}

interface HistoryInsight {
  type: "treatment_pattern" | "medication_response" | "condition_trend" | "risk_factor";
  title: string;
  description: string;
  confidence: number;
  relevance: "high" | "medium" | "low";
  actionable: boolean;
  data: any;
}

export const PatientHistoryInsights: React.FC<PatientHistoryInsightsProps> = ({
  patientId,
  onInsightSelect,
  className,
}) => {
  const [insights, setInsights] = useState<HistoryInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ragRecommendations, setRagRecommendations] = useState<any[]>([]);

  // Get patient's basic information
  const patientInfo = useQuery(
    api.patients.getPatientById,
    { patientId }
  );

  // Get patient's medical history and allergies
  const medicalHistory = useQuery(
    api.patients.getPatientMedicalHistory,
    { patientId }
  );

  const allergies = useQuery(
    api.patients.getPatientAllergies,
    { patientId }
  );

  const treatmentHistory = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId }
  );

  const prescriptionHistory = useQuery(
    api.prescriptions.getByPatientId,
    { patientId }
  );

  const soapHistory = useQuery(
    api.soapNotes.getByPatientId,
    { patientId }
  );

  // Generate insights from patient history
  useEffect(() => {
    if (patientInfo && treatmentHistory && prescriptionHistory) {
      generateInsights();
      fetchRAGRecommendations();
    }
  }, [patientInfo, medicalHistory, allergies, treatmentHistory, prescriptionHistory, soapHistory]);

  const generateInsights = () => {
    const generatedInsights: HistoryInsight[] = [];

    // Treatment Pattern Analysis
    if (treatmentHistory && treatmentHistory.length > 1) {
      const completedTreatments = treatmentHistory.filter(t => t.status === "completed");
      const successRate = completedTreatments.length / treatmentHistory.length;
      
      generatedInsights.push({
        type: "treatment_pattern",
        title: "Treatment Success Pattern",
        description: `${Math.round(successRate * 100)}% treatment completion rate based on ${treatmentHistory.length} treatments`,
        confidence: 0.85,
        relevance: successRate > 0.8 ? "high" : successRate > 0.6 ? "medium" : "low",
        actionable: successRate < 0.7,
        data: { successRate, totalTreatments: treatmentHistory.length, completedTreatments: completedTreatments.length }
      });
    }

    // Medication Response Analysis
    if (prescriptionHistory && prescriptionHistory.length > 0) {
      const medicationClasses = prescriptionHistory.reduce((acc, prescription) => {
        const className = prescription.medication?.class || "Unknown";
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedClass = Object.entries(medicationClasses)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostUsedClass) {
        generatedInsights.push({
          type: "medication_response",
          title: "Medication Usage Pattern",
          description: `Most prescribed medication class: ${mostUsedClass[0]} (${mostUsedClass[1]} prescriptions)`,
          confidence: 0.9,
          relevance: "medium",
          actionable: true,
          data: { medicationClasses, mostUsedClass }
        });
      }
    }

    // Condition Trend Analysis
    if (soapHistory && soapHistory.length > 2) {
      const recentNotes = soapHistory.slice(-3);
      const commonDiagnoses = recentNotes
        .flatMap(note => note.diagnosis || [])
        .reduce((acc, diagnosis) => {
          acc[diagnosis] = (acc[diagnosis] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const recurringCondition = Object.entries(commonDiagnoses)
        .find(([, count]) => count > 1);

      if (recurringCondition) {
        generatedInsights.push({
          type: "condition_trend",
          title: "Recurring Condition",
          description: `${recurringCondition[0]} appears in ${recurringCondition[1]} recent visits`,
          confidence: 0.8,
          relevance: "high",
          actionable: true,
          data: { condition: recurringCondition[0], frequency: recurringCondition[1] }
        });
      }
    }

    // Risk Factor Analysis
    if (allergies && allergies.length > 0) {
      generatedInsights.push({
        type: "risk_factor",
        title: "Allergy Considerations",
        description: `Patient has ${allergies.length} known allergies`,
        confidence: 1.0,
        relevance: "high",
        actionable: true,
        data: { allergies: allergies }
      });
    }

    setInsights(generatedInsights);
    setIsLoading(false);
  };

  const fetchRAGRecommendations = async () => {
    try {
      const searchQueries = [
        "treatment recommendations based on patient history",
        "medication effectiveness for similar patients",
        "care plan optimization suggestions"
      ];

      const ragResults = await Promise.all(
        searchQueries.map(query =>
          searchPatientRAG(patientId, query, { max_results: 3 })
        )
      );

      const recommendations = ragResults
        .flatMap(result => result.relevant_documents || [])
        .slice(0, 5);

      setRagRecommendations(recommendations);
    } catch (error) {
      console.error("Failed to fetch RAG recommendations:", error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "treatment_pattern":
        return <TrendingUp className="h-4 w-4" />;
      case "medication_response":
        return <Pill className="h-4 w-4" />;
      case "condition_trend":
        return <Activity className="h-4 w-4" />;
      case "risk_factor":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Patient History Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI-Powered History Insights
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" className="w-full">
          {/* Generated Insights */}
          <AccordionItem value="insights">
            <AccordionTrigger className="px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Pattern Analysis ({insights.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => onInsightSelect?.(insight)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-primary/10 rounded">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{insight.title}</h4>
                            <Badge variant="outline" className={getRelevanceColor(insight.relevance)}>
                              {insight.relevance}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            </div>
                            {insight.actionable && (
                              <Badge variant="outline" className="text-xs">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* RAG Recommendations */}
          {ragRecommendations.length > 0 && (
            <AccordionItem value="rag-recommendations">
              <AccordionTrigger className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Recommendations ({ragRecommendations.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {ragRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-primary/10 rounded">
                            <Target className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground mb-1">
                              {rec.content || rec.data}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Score: {Math.round((rec.score || 0) * 100)}%
                              </Badge>
                              {rec.metadata?.event_type && (
                                <Badge variant="outline" className="text-xs">
                                  {rec.metadata.event_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Quick Stats */}
          <AccordionItem value="quick-stats">
            <AccordionTrigger className="px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Quick Statistics
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold">{treatmentHistory?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Treatments</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold">{prescriptionHistory?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Prescriptions</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold">{soapHistory?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">SOAP Notes</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold">{allergies?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Allergies</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PatientHistoryInsights;
