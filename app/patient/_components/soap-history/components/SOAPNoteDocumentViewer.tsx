"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SOAPNote, SOAPUtils } from "../types";
import { cn } from "@/lib/utils";

interface SOAPNoteDocumentViewerProps {
  note: SOAPNote;
  onBack?: () => void;
  showBackButton?: boolean;
  backButtonOverlay?: boolean;
  className?: string;
}

/**
 * Standalone SOAP Note Document Viewer
 * Clean, readable document format with better width control
 * Can be used as a full page or embedded component
 */
export const SOAPNoteDocumentViewer = React.memo<SOAPNoteDocumentViewerProps>(({
  note,
  onBack,
  showBackButton = true,
  backButtonOverlay = false,
  className,
}) => {
  // Extract enhanced data using utility functions
  const subjective = SOAPUtils.getSubjective(note);
  const objective = SOAPUtils.getObjective(note);
  const assessment = SOAPUtils.getAssessment(note);
  const plan = SOAPUtils.getPlan(note);
  const qualityScore = SOAPUtils.getQualityScore(note);
  const specialty = SOAPUtils.getSpecialty(note);
  const hasEnhancedData = SOAPUtils.hasEnhancedData(note);
  return (
    <div className={cn("h-full w-full flex flex-col relative", className)}>
      {/* Back Button - Regular (top bar) */}
      {showBackButton && onBack && !backButtonOverlay && (
        <div className="flex-shrink-0 p-4 border-b bg-muted/30">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </div>
      )}

      {/* Back Button - Overlay (floating) */}
      {showBackButton && onBack && backButtonOverlay && (
        <div className="absolute top-6 left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-300">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-accent hover:scale-105 transition-all duration-200 shadow-xl backdrop-blur-md bg-background/95 border-border/60 text-foreground/90 hover:text-foreground hover:shadow-2xl"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to History</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      )}

      {/* Document Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-6xl mx-auto p-8 md:p-12 lg:p-20 xl:p-24">
            {/* Document Header */}
            <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                SOAP Clinical Note
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Generated on {new Date(note.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Document Content */}
            <div
              className="prose prose-xl prose-gray dark:prose-invert max-w-none"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                lineHeight: '1.9',
                fontSize: '20px'
              }}
            >
              {/* Subjective Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4 uppercase tracking-wide border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                  Subjective
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-xl">
                  {note.subjective}
                </div>
              </div>

              {/* Objective Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4 uppercase tracking-wide border-b-2 border-green-200 dark:border-green-700 pb-2">
                  Objective
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-xl">
                  {note.objective}
                </div>
              </div>

              {/* Assessment Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-4 uppercase tracking-wide border-b-2 border-orange-200 dark:border-orange-700 pb-2">
                  Assessment
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-xl">
                  {note.assessment}
                </div>
              </div>

              {/* Plan Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4 uppercase tracking-wide border-b-2 border-purple-200 dark:border-purple-700 pb-2">
                  Plan
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                  {note.plan}
                </div>
              </div>

              {/* Recommendations Section (if available) */}
              {note.recommendations && note.recommendations.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-4 uppercase tracking-wide border-b-2 border-indigo-200 dark:border-indigo-700 pb-2">
                    Recommendations
                  </h2>
                  <div className="text-gray-800 dark:text-gray-200 text-lg">
                    <ul className="list-disc list-inside space-y-3">
                      {note.recommendations.map((recommendation, index) => (
                        <li key={index} className="leading-relaxed">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-16 pt-8 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                <div className="flex justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                  {note.qualityScore && (
                    <span className="font-medium">Quality Score: {note.qualityScore}%</span>
                  )}
                  {note.processingTime && (
                    <span className="font-medium">Processing Time: {note.processingTime}</span>
                  )}
                  <span className="font-medium">Document ID: {note._id.slice(-8)}</span>
                </div>
                <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  This document was generated automatically from clinical audio recordings
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

SOAPNoteDocumentViewer.displayName = "SOAPNoteDocumentViewer";
