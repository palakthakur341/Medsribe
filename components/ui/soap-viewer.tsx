"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Download, Share, Printer, Copy, FileText, Stethoscope, Shield, Clock, Brain, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Import the enhanced SOAPNote type from the history components
import { SOAPNote as EnhancedSOAPNote, SOAPUtils } from "@/app/patient/_components/soap-history/types";

// Use the enhanced type for better compatibility
export interface SOAPNote extends EnhancedSOAPNote {
  patientName?: string;
}

export interface SOAPViewerConfig {
  showBackButton?: boolean;
  showActions?: boolean;
  showPatientInfo?: boolean;
  showMetadata?: boolean;
  allowPrint?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  allowCopy?: boolean;
  allowExportPDF?: boolean;
  backButtonText?: string;
  documentTitle?: string;
}

export interface SOAPViewerActions {
  onBack?: () => void;
  onDownload?: (note: SOAPNote) => void;
  onShare?: (note: SOAPNote) => void;
  onPrint?: (note: SOAPNote) => void;
  onCopy?: (note: SOAPNote) => void;
  onExportPDF?: (note: SOAPNote) => void;
}

export interface SOAPViewerProps {
  note: SOAPNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: SOAPViewerConfig;
  actions?: SOAPViewerActions;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: SOAPViewerConfig = {
  showBackButton: true,
  showActions: true,
  showPatientInfo: false,
  showMetadata: true,
  allowPrint: true,
  allowDownload: true,
  allowShare: false,
  allowCopy: true,
  allowExportPDF: false,
  backButtonText: "Back",
  documentTitle: "SOAP Clinical Note",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Universal SOAPViewer Component
 *
 * A full-screen overlay component for viewing SOAP notes in a document-like format.
 * Supports both patient and doctor contexts with configurable features.
 *
 * Features:
 * - Full-screen overlay with backdrop
 * - Document-style layout with professional typography
 * - Configurable actions (print, download, share, copy)
 * - Responsive design
 * - Keyboard shortcuts (ESC to close)
 * - Accessibility compliant
 */
export const SOAPViewer = React.memo<SOAPViewerProps>(({
  note,
  open,
  onOpenChange,
  config = {},
  actions = {},
  className,
}) => {
  // Merge with default config
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Don't render if no note
  if (!note) return null;

  // --------------------------------
  // Event Handlers
  // --------------------------------

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onOpenChange]);

  // Format date utility
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --------------------------------
  // Action Handlers
  // --------------------------------

  const handlePrint = () => {
    if (actions.onPrint) {
      actions.onPrint(note);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = generatePrintContent(note, finalConfig);
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleExportPDF = () => {
    if (actions.onExportPDF) {
      actions.onExportPDF(note);
    } else {
      console.log('PDF export functionality to be implemented');
    }
  };

  const handleCopy = async () => {
    if (actions.onCopy) {
      actions.onCopy(note);
    } else {
      const content = generateTextContent(note, finalConfig);
      try {
        await navigator.clipboard.writeText(content);
        console.log('SOAP note copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  // --------------------------------
  // Helper Functions
  // --------------------------------

  /**
   * Generates enhanced plain text content for clipboard copy
   */
  const generateTextContent = (note: SOAPNote, config: SOAPViewerConfig) => {
    // Extract data using utility functions
    const subjective = SOAPUtils.getSubjective(note);
    const objective = SOAPUtils.getObjective(note);
    const assessment = SOAPUtils.getAssessment(note);
    const plan = SOAPUtils.getPlan(note);
    const qualityScore = SOAPUtils.getQualityScore(note);
    const specialty = SOAPUtils.getSpecialty(note);
    const recommendations = SOAPUtils.getRecommendations(note);
    const safetyStatus = SOAPUtils.getSafetyStatus(note);
    const redFlags = SOAPUtils.getRedFlags(note);
    const processingTime = SOAPUtils.getProcessingTime(note);
    const sessionId = SOAPUtils.getSessionId(note);
    const hasEnhancedData = SOAPUtils.hasEnhancedData(note);

    return `SOAP Clinical Note
${config.showPatientInfo && note.patientName ? `Patient: ${note.patientName}` : ''}
Generated on ${formatDate(note.createdAt)}
${sessionId ? `Session ID: ${sessionId}` : ''}
${specialty ? `Specialty: ${specialty}` : ''}
${hasEnhancedData ? 'Enhanced AI Analysis: Available' : ''}

SUBJECTIVE:
${subjective}

OBJECTIVE:
${objective}

ASSESSMENT:
${assessment}

PLAN:
${plan}

${recommendations.length > 0 ? `RECOMMENDATIONS:\n${recommendations.map(rec => `• ${rec}`).join('\n')}\n\n` : ''}${redFlags.length > 0 ? `RED FLAGS:\n${redFlags.map(flag => `⚠ ${flag}`).join('\n')}\n\n` : ''}${config.showMetadata ? `${qualityScore ? `Quality Score: ${qualityScore}%\n` : ''}${processingTime ? `Processing Time: ${processingTime}\n` : ''}${safetyStatus !== undefined ? `Safety Status: ${safetyStatus ? 'Safe' : 'Requires Attention'}\n` : ''}Document ID: ${note._id.slice(-8)}` : ''}`;
  };

  /**
   * Generates HTML content for printing with professional styling
   */
  const generatePrintContent = (note: SOAPNote, config: SOAPViewerConfig) => {
    const currentYear = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.documentTitle} - ${note.patientName || 'Patient'}</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.6;
              margin: 0;
              color: #111827;
              background: white;
            }
            .page {
              width: 21cm;
              min-height: 29.7cm;
              padding: 0;
              margin: 0 auto;
              background: white;
            }
            .document-header {
              padding: 2cm 1.5cm 1.5cm;
              border-bottom: 1px solid #e5e7eb;
              background: linear-gradient(to right, #f9fafb, #f3f4f6, #f9fafb);
            }
            .branding {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2cm;
            }
            .logo-container {
              display: flex;
              align-items: center;
            }
            .logo {
              width: 40px;
              height: 40px;
              background: #111827;
              color: white;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              margin-right: 12px;
            }
            .logo-text {
              display: flex;
              flex-direction: column;
            }
            .logo-title {
              font-weight: bold;
              font-size: 16px;
            }
            .logo-subtitle {
              font-size: 12px;
              color: #6b7280;
            }
            .document-id {
              font-size: 12px;
              color: #6b7280;
              text-align: right;
            }
            .document-title {
              text-align: center;
              margin-bottom: 1cm;
            }
            .document-title h1 {
              font-size: 28px;
              margin-bottom: 16px;
            }
            .patient-info {
              text-align: center;
              margin-bottom: 16px;
              font-size: 16px;
              padding: 8px;
              border: 1px solid #e5e7eb;
              display: inline-block;
              border-radius: 4px;
            }
            .document-date {
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            .document-content {
              padding: 1.5cm;
            }
            .section {
              margin-bottom: 1.5cm;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .section-content {
              white-space: pre-wrap;
              padding-left: 16px;
              border-left: 4px solid #f3f4f6;
            }
            .recommendations-list {
              list-style-type: none;
              padding-left: 16px;
              border-left: 4px solid #f3f4f6;
            }
            .recommendation-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .recommendation-bullet {
              margin-right: 8px;
              font-weight: bold;
            }
            .document-footer {
              margin-top: 2cm;
              padding-top: 1cm;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            }
            .compliance-badges {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 12px;
              margin-bottom: 1cm;
            }
            .badge {
              font-size: 11px;
              padding: 4px 8px;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              color: #6b7280;
            }
            .metadata {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 16px;
              margin-bottom: 16px;
              font-size: 12px;
              color: #6b7280;
            }
            .metadata-item {
              display: flex;
              align-items: center;
            }
            .metadata-dot {
              width: 6px;
              height: 6px;
              background-color: #111827;
              border-radius: 50%;
              margin-right: 6px;
            }
            .copyright {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 8px;
            }
            @media print {
              body { margin: 0; background: none; }
              .page { width: auto; min-height: auto; margin: 0; box-shadow: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="document-header">
              <div class="branding">
                <div class="logo-container">
                  <div class="logo">M</div>
                  <div class="logo-text">
                    <div class="logo-title">MedScribe</div>
                    <div class="logo-subtitle">v2.0 Clinical Platform</div>
                  </div>
                </div>
                <div class="document-id">
                  <div>HIPAA Compliant</div>
                  <div>Document ID: ${note._id.slice(-8)}</div>
                </div>
              </div>

              <div class="document-title">
                <h1>${config.documentTitle}</h1>
                ${config.showPatientInfo && note.patientName ?
                  `<div class="patient-info">Patient: ${note.patientName}</div>` : ''}
                <div class="document-date">Generated on ${formatDate(note.createdAt)}</div>
              </div>
            </div>

            <div class="document-content">
              <div class="section">
                <div class="section-title">Subjective</div>
                <div class="section-content">${SOAPUtils.getSubjective(note)}</div>
              </div>

              <div class="section">
                <div class="section-title">Objective</div>
                <div class="section-content">${SOAPUtils.getObjective(note)}</div>
              </div>

              <div class="section">
                <div class="section-title">Assessment</div>
                <div class="section-content">${SOAPUtils.getAssessment(note)}</div>
              </div>

              <div class="section">
                <div class="section-title">Plan</div>
                <div class="section-content">${SOAPUtils.getPlan(note)}</div>
              </div>

              ${(() => {
                const recommendations = SOAPUtils.getRecommendations(note);
                return recommendations.length > 0 ? `
                  <div class="section">
                    <div class="section-title">Recommendations</div>
                    <ul class="recommendations-list">
                      ${recommendations.map(rec => `
                        <li class="recommendation-item">
                          <span class="recommendation-bullet">•</span>
                          <span>${rec}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : '';
              })()}

              ${config.showMetadata ? `
                <div class="document-footer">
                  <div class="compliance-badges">
                    <span class="badge">HIPAA Compliant</span>
                    <span class="badge">SOC 2 Type II</span>
                    <span class="badge">ISO 27001</span>
                    <span class="badge">GDPR Compliant</span>
                    <span class="badge">FDA Guidelines</span>
                  </div>

                  <div class="metadata">
                    ${(() => {
                      const qualityScore = SOAPUtils.getQualityScore(note);
                      const processingTime = SOAPUtils.getProcessingTime(note);
                      const specialty = SOAPUtils.getSpecialty(note);
                      const safetyStatus = SOAPUtils.getSafetyStatus(note);

                      return `
                        ${qualityScore ? `
                          <div class="metadata-item">
                            <div class="metadata-dot"></div>
                            <span>Quality Score: ${qualityScore}%</span>
                          </div>
                        ` : ''}
                        ${processingTime ? `
                          <div class="metadata-item">
                            <div class="metadata-dot"></div>
                            <span>Processing Time: ${processingTime}</span>
                          </div>
                        ` : ''}
                        ${specialty ? `
                          <div class="metadata-item">
                            <div class="metadata-dot"></div>
                            <span>Specialty: ${specialty}</span>
                          </div>
                        ` : ''}
                        ${safetyStatus !== undefined ? `
                          <div class="metadata-item">
                            <div class="metadata-dot"></div>
                            <span>Safety Status: ${safetyStatus ? 'Safe' : 'Requires Attention'}</span>
                          </div>
                        ` : ''}
                      `;
                    })()}
                  </div>

                  <div>This document was generated automatically by MedScribe AI Clinical Platform</div>
                  <div class="copyright">© ${currentYear} MedScribe. All rights reserved.</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // --------------------------------
  // Render
  // --------------------------------

  // If not open, don't render anything
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        "animate-in fade-in-0 duration-300",
        "bg-background",
        className
      )}
      aria-describedby="soap-note-document"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={() => onOpenChange(false)}
      />



      {/* Professional Header with navigation, title and actions */}
      {(finalConfig.showBackButton || finalConfig.showActions) && (
        <div className="flex-shrink-0 border-b bg-card px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <div className="flex-shrink-0">
              {finalConfig.showBackButton && actions.onBack && (
                <Button
                  variant="ghost"
                  onClick={actions.onBack}
                  className="flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{finalConfig.backButtonText}</span>
                </Button>
              )}
            </div>

            {/* Center - Document title */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {finalConfig.documentTitle}
                  {finalConfig.showPatientInfo && note.patientName && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      - {note.patientName}
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Right side - Action buttons */}
            {finalConfig.showActions && (
              <div className="flex items-center gap-1 sm:gap-2">
                {finalConfig.allowShare && actions.onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onShare!(note)}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Share"
                  >
                    <Share className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}

                {finalConfig.allowDownload && actions.onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onDownload!(note)}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                )}

                {finalConfig.allowPrint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                )}

                {finalConfig.allowCopy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                )}

                {finalConfig.allowExportPDF && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Export as PDF"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-card shadow-2xl mx-auto my-8 border border-border rounded-lg overflow-hidden">
              {/* Professional Document Header */}
              <div className="bg-muted/30 border-b border-border">
                <div className="p-6 md:p-8">
                  {/* Application Branding */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
                        <Stethoscope className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">MedScribe</span>
                        <span className="text-xs text-muted-foreground font-medium">v2.0 Clinical Platform</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        HIPAA Compliant
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        ID: {note._id.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                      {finalConfig.documentTitle}
                    </h1>

                    {/* Patient information for doctor views */}
                    {finalConfig.showPatientInfo && note.patientName && (
                      <div className="mb-4">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          <FileText className="h-3 w-3 mr-2" />
                          Patient: {note.patientName}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Generated on {formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-6 md:p-8 bg-card">
                {/* Enhanced SOAP content sections with professional typography */}
                <div className="space-y-8">
                  {/* Document Overview */}
                  <div className="space-y-3">
                    {/* Enhanced Data Indicator */}
                    {SOAPUtils.hasEnhancedData(note) && (
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Enhanced Analysis
                        </h4>
                        <p className="text-foreground text-xs">
                          This SOAP note includes advanced AI analysis with structured medical data, quality metrics, and safety assessments.
                        </p>
                      </div>
                    )}

                    {/* Session Information */}
                    {(() => {
                      const sessionId = SOAPUtils.getSessionId(note);
                      const specialty = SOAPUtils.getSpecialty(note);
                      const processingTime = SOAPUtils.getProcessingTime(note);

                      if (!sessionId && !specialty && !processingTime) return null;

                      return (
                        <div className="p-3 bg-muted/30 border border-border rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2 text-sm">Session Information</h4>
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            {sessionId && (
                              <div className="text-foreground">
                                <span className="font-medium">Session ID:</span> {sessionId}
                              </div>
                            )}
                            {specialty && (
                              <div className="text-foreground">
                                <span className="font-medium">Detected Specialty:</span> {specialty}
                              </div>
                            )}
                            {processingTime && (
                              <div className="text-foreground">
                                <span className="font-medium">Processing Time:</span> {processingTime}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Subjective Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Subjective
                    </h2>
                    {(() => {
                      const subjective = note.data?.soap_notes?.soap_notes?.subjective;
                      if (!subjective) return <p className="text-muted-foreground italic">No subjective data available</p>;

                      return (
                        <div className="space-y-3">
                          {/* Chief Complaint */}
                          {subjective.chief_complaint && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Chief Complaint</h4>
                              <p className="text-foreground text-xs">{subjective.chief_complaint}</p>
                            </div>
                          )}

                          {/* History of Present Illness */}
                          {subjective.history_present_illness && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">History of Present Illness</h4>
                              <p className="text-foreground text-xs">{subjective.history_present_illness}</p>
                            </div>
                          )}

                          {/* Review of Systems */}
                          {subjective.review_of_systems?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Review of Systems</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {subjective.review_of_systems.map((system, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {system}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Past Medical History */}
                          {subjective.past_medical_history?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Past Medical History</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {subjective.past_medical_history.map((history, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {history}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Current Medications */}
                          {subjective.medications?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Current Medications</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {subjective.medications.map((medication, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {medication}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Allergies */}
                          {subjective.allergies?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Allergies</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {subjective.allergies.map((allergy, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {allergy}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Social History */}
                          {subjective.social_history && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Social History</h4>
                              <p className="text-foreground text-xs">{subjective.social_history}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Objective Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Objective
                    </h2>
                    {(() => {
                      const objective = note.data?.soap_notes?.soap_notes?.objective;
                      if (!objective) return <p className="text-muted-foreground italic">No objective data available</p>;

                      return (
                        <div className="space-y-3">
                          {/* Diagnostic Results */}
                          {objective.diagnostic_results?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Diagnostic Results</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {objective.diagnostic_results.map((result, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {result}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mental Status */}
                          {objective.mental_status && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Mental Status</h4>
                              <p className="text-foreground text-xs">{objective.mental_status}</p>
                            </div>
                          )}

                          {/* Functional Status */}
                          {objective.functional_status && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Functional Status</h4>
                              <p className="text-foreground text-xs">{objective.functional_status}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Vital Signs (if available from enhanced data) */}
                    {SOAPUtils.getVitalSigns(note) && (
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Vital Signs</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(SOAPUtils.getVitalSigns(note) || {}).map(([key, value]) => (
                            <div key={key} className="text-foreground">
                              <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Physical Examination (if available from enhanced data) */}
                    {SOAPUtils.getPhysicalExam(note) && (
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Physical Examination</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {Object.entries(SOAPUtils.getPhysicalExam(note) || {}).map(([key, value]) => (
                            <div key={key} className="text-foreground">
                              <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assessment Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Assessment
                    </h2>
                    {(() => {
                      const assessment = note.data?.soap_notes?.soap_notes?.assessment;
                      if (!assessment) return <p className="text-muted-foreground italic">No assessment data available</p>;

                      return (
                        <div className="space-y-3">
                          {/* Primary Diagnosis */}
                          {assessment.primary_diagnosis && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Primary Diagnosis</h4>
                              <div className="space-y-2">
                                {assessment.primary_diagnosis.diagnosis && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">Diagnosis:</span> {assessment.primary_diagnosis.diagnosis}
                                  </p>
                                )}
                                {assessment.primary_diagnosis.icd10_code && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">ICD-10:</span> {assessment.primary_diagnosis.icd10_code}
                                  </p>
                                )}
                                {assessment.primary_diagnosis.severity && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">Severity:</span> {assessment.primary_diagnosis.severity}
                                  </p>
                                )}
                                {assessment.primary_diagnosis.confidence && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">Confidence:</span> {Math.round(assessment.primary_diagnosis.confidence * 100)}%
                                  </p>
                                )}
                                {assessment.primary_diagnosis.clinical_reasoning && (
                                  <div className="mt-2">
                                    <p className="text-foreground text-xs font-medium mb-1">Clinical Reasoning:</p>
                                    <p className="text-foreground text-xs">{assessment.primary_diagnosis.clinical_reasoning}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Differential Diagnoses */}
                          {assessment.differential_diagnoses?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Differential Diagnoses</h4>
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                {assessment.differential_diagnoses.map((diff, index) => (
                                  <div key={index} className="text-foreground border-l-2 border-muted/50 pl-2">
                                    <p><span className="font-medium">Diagnosis:</span> {diff.diagnosis}</p>
                                    {diff.icd10_code && <p><span className="font-medium">ICD-10:</span> {diff.icd10_code}</p>}
                                    {diff.probability && <p><span className="font-medium">Probability:</span> {Math.round(diff.probability * 100)}%</p>}
                                    {diff.ruling_out_criteria && <p><span className="font-medium">Ruling Out:</span> {diff.ruling_out_criteria}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Problem List */}
                          {assessment.problem_list?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Problem List</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {assessment.problem_list.map((problem, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {problem.problem}
                                    <span className="text-muted-foreground ml-2">({problem.status}, {problem.priority} priority)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Risk Assessment */}
                          {(assessment.risk_level || assessment.risk_factors?.length > 0 || assessment.prognosis) && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Risk Assessment</h4>
                              <div className="space-y-2">
                                {assessment.risk_level && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">Risk Level:</span> {assessment.risk_level}
                                  </p>
                                )}
                                {assessment.risk_factors?.length > 0 && (
                                  <div>
                                    <p className="text-foreground text-xs font-medium mb-1">Risk Factors:</p>
                                    <div className="grid grid-cols-1 gap-1">
                                      {assessment.risk_factors.map((factor, index) => (
                                        <div key={index} className="text-foreground text-xs">
                                          <span className="font-medium">•</span> {factor}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {assessment.prognosis && (
                                  <p className="text-foreground text-xs">
                                    <span className="font-medium">Prognosis:</span> {assessment.prognosis}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Plan Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Plan
                    </h2>
                    {(() => {
                      const plan = note.data?.soap_notes?.soap_notes?.plan;
                      if (!plan) return <p className="text-muted-foreground italic">No plan data available</p>;

                      return (
                        <div className="space-y-3">
                          {/* Diagnostic Workup */}
                          {plan.diagnostic_workup?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Diagnostic Workup</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.diagnostic_workup.map((workup, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {workup}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Treatments */}
                          {plan.treatments?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Treatments</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.treatments.map((treatment, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {treatment}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {plan.medications?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Medications</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.medications.map((medication, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {medication}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Follow-up */}
                          {plan.follow_up?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Follow-up</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.follow_up.map((followUp, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {followUp.provider} ({followUp.timeframe}
                                    {followUp.urgency !== 'routine' && <span className="text-orange-600 ml-1">- {followUp.urgency}</span>})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Patient Education */}
                          {plan.patient_education?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Patient Education</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.patient_education.map((education, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {education}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Referrals */}
                          {plan.referrals?.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Referrals</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {plan.referrals.map((referral, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium">•</span> {referral}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Enhanced AI Analysis Section */}
                  {(() => {
                    const specialty = SOAPUtils.getSpecialty(note);
                    const qualityScore = SOAPUtils.getQualityScore(note);
                    const safetyStatus = SOAPUtils.getSafetyStatus(note);
                    const redFlags = SOAPUtils.getRedFlags(note);
                    const hasEnhancedData = SOAPUtils.hasEnhancedData(note);

                    // Show section if we have any enhanced data
                    const showSection = specialty || qualityScore || safetyStatus !== undefined || hasEnhancedData;

                    if (!showSection) return null;

                    return (
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                          AI Analysis & Quality Metrics
                        </h2>

                        <div className="space-y-3">
                          {/* Specialty Detection */}
                          {specialty && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                Detected Specialty
                              </h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                <div className="text-foreground">
                                  <span className="font-medium">Specialty:</span> {specialty}
                                </div>
                                {note.data?.specialty_detection?.confidence && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Confidence:</span> {Math.round(note.data.specialty_detection.confidence * 100)}%
                                  </div>
                                )}
                                {note.data?.specialty_detection?.reasoning && (
                                  <div className="text-foreground mt-2">
                                    <span className="font-medium">Reasoning:</span> {note.data.specialty_detection.reasoning}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quality Metrics */}
                          {note.data?.quality_metrics && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Quality Scores
                              </h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {note.data.quality_metrics.completeness_score && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Completeness:</span> {Math.round(note.data.quality_metrics.completeness_score * 100)}%
                                  </div>
                                )}
                                {note.data.quality_metrics.clinical_accuracy && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Clinical Accuracy:</span> {Math.round(note.data.quality_metrics.clinical_accuracy * 100)}%
                                  </div>
                                )}
                                {note.data.quality_metrics.documentation_quality && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Documentation Quality:</span> {Math.round(note.data.quality_metrics.documentation_quality * 100)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Safety Assessment */}
                          {safetyStatus !== undefined && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                                {safetyStatus ? <Shield className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                Safety Assessment
                              </h4>
                              <div className="space-y-3">
                                <div className="text-foreground text-xs">
                                  <span className="font-medium">Status:</span> {safetyStatus ? "Safe" : "Requires Attention"}
                                </div>

                                {/* Two-column grid for Safety Red Flags and Critical Items */}
                                {((note.data?.safety_check?.red_flags && note.data.safety_check.red_flags.length > 0) ||
                                  (note.data?.safety_check?.critical_items && note.data.safety_check.critical_items.length > 0)) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Safety Red Flags */}
                                    {note.data?.safety_check?.red_flags && note.data.safety_check.red_flags.length > 0 && (
                                      <div>
                                        <div className="font-medium text-foreground mb-2 text-xs">Safety Red Flags:</div>
                                        <div className="grid grid-cols-1 gap-1">
                                          {note.data.safety_check.red_flags.map((flag, index) => (
                                            <div key={index} className="text-foreground text-xs">
                                              <span className="font-medium text-destructive">•</span> {flag}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Critical Items */}
                                    {note.data?.safety_check?.critical_items && note.data.safety_check.critical_items.length > 0 && (
                                      <div>
                                        <div className="font-medium text-foreground mb-2 text-xs">Critical Items:</div>
                                        <div className="grid grid-cols-1 gap-1">
                                          {note.data.safety_check.critical_items.map((item, index) => (
                                            <div key={index} className="text-foreground text-xs">
                                              <span className="font-medium text-orange-600">•</span> {item}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                          {/* Missing Information */}
                          {note.data?.quality_metrics?.missing_information && note.data.quality_metrics.missing_information.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Missing Information</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {note.data.quality_metrics.missing_information.map((item, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium text-orange-600">•</span> {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clinical Red Flags */}
                          {redFlags.length > 0 && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Clinical Red Flags
                              </h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {redFlags.map((flag, index) => (
                                  <div key={index} className="text-foreground">
                                    <span className="font-medium text-destructive">•</span> {flag}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* QA Results */}
                          {note.data?.qa_results && (
                            <div className="p-3 bg-muted/30 border border-border rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2 text-sm">QA Results</h4>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {note.data.qa_results.quality_score && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Overall Quality Score:</span> {note.data.qa_results.quality_score}%
                                  </div>
                                )}
                                {note.data.qa_results.approved !== undefined && (
                                  <div className="text-foreground">
                                    <span className="font-medium">Approved:</span> {note.data.qa_results.approved ? "Yes" : "No"}
                                  </div>
                                )}
                                {note.data.qa_results.recommendations?.length > 0 && (
                                  <div className="mt-2">
                                    <div className="font-medium text-foreground mb-1">Recommendations:</div>
                                    <div className="grid grid-cols-1 gap-1">
                                      {note.data.qa_results.recommendations.map((rec, index) => (
                                        <div key={index} className="text-foreground">
                                          <span className="font-medium">•</span> {rec}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })()}

                  {/* Recommendations Section */}
                  {(() => {
                    const recommendations = SOAPUtils.getRecommendations(note);
                    if (recommendations.length === 0) return null;

                    return (
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                          Recommendations
                        </h2>
                        <div className="p-3 bg-muted/30 border border-border rounded-lg">
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            {recommendations.map((recommendation, index) => (
                              <div key={index} className="text-foreground">
                                <span className="font-medium">•</span> {recommendation}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Document footer with metadata and compliance indicators */}
                <div className="mt-8 pt-6 border-t border-border">
                  {/* Compliance badges */}
                  <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
                    {[
                      { name: "HIPAA Compliant", icon: <Shield className="h-3 w-3" /> },
                      { name: "SOC 2 Type II", icon: <Shield className="h-3 w-3" /> },
                      { name: "ISO 27001", icon: <Shield className="h-3 w-3" /> },
                      { name: "GDPR Compliant", icon: <Shield className="h-3 w-3" /> },
                      { name: "FDA Guidelines", icon: <Shield className="h-3 w-3" /> }
                    ].map((badge, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                        {badge.icon}
                        <span>{badge.name}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Metadata section */}
                  {finalConfig.showMetadata && (
                    <div className="text-center">
                      <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {(() => {
                          const qualityScore = SOAPUtils.getQualityScore(note);
                          const processingTime = SOAPUtils.getProcessingTime(note);
                          const sessionId = SOAPUtils.getSessionId(note);
                          const specialty = SOAPUtils.getSpecialty(note);
                          const safetyStatus = SOAPUtils.getSafetyStatus(note);

                          return (
                            <>
                              {qualityScore && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Quality: {qualityScore}%</span>
                                </div>
                              )}
                              {processingTime && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Processing: {processingTime}</span>
                                </div>
                              )}
                              {sessionId && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Session: {sessionId.slice(-8)}</span>
                                </div>
                              )}
                              {specialty && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Specialty: {specialty}</span>
                                </div>
                              )}
                              {safetyStatus !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Safety: {safetyStatus ? 'Safe' : 'Attention'}</span>
                                </div>
                              )}
                              {note.data?.transcription?.duration && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Duration: {note.data.transcription.duration}s</span>
                                </div>
                              )}
                              {note.data?.transcription?.confidence && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>Confidence: {Math.round(note.data.transcription.confidence * 100)}%</span>
                                </div>
                              )}
                              {SOAPUtils.hasEnhancedData(note) && (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                  <span>AI Enhanced</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        Generated by MedScribe AI Clinical Platform
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        © {new Date().getFullYear()} MedScribe. All rights reserved.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

SOAPViewer.displayName = "SOAPViewer";

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export interface UseSOAPViewerReturn {
  selectedNote: SOAPNote | null;
  isOpen: boolean;
  openViewer: (note: SOAPNote) => void;
  closeViewer: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing SOAP Viewer state
 * Provides clean interface for showing/hiding the viewer
 */
export function useSOAPViewer(): UseSOAPViewerReturn {
  const [selectedNote, setSelectedNote] = React.useState<SOAPNote | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openViewer = React.useCallback((note: SOAPNote) => {
    setSelectedNote(note);
    setIsOpen(true);
  }, []);

  const closeViewer = React.useCallback(() => {
    setIsOpen(false);
    setSelectedNote(null);
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      closeViewer();
    }
  }, [closeViewer]);

  return {
    selectedNote,
    isOpen,
    openViewer,
    closeViewer,
    setOpen,
  };
}