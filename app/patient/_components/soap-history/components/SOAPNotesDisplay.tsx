"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareSOAPDialog } from "./ShareSOAPDialog";
import {
  FileText,
  Download,
  Share,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SOAPNote {
  _id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  highlightedHtml?: string;
  qualityScore?: number;
  processingTime?: string;
  recommendations?: string[];
  googleDocUrl?: string;
  createdAt: number;
  updatedAt: number;
}

interface SOAPNotesDisplayProps {
  soapNote: SOAPNote;
  showActions?: boolean;
  compact?: boolean;
}

export function SOAPNotesDisplay({ 
  soapNote, 
  showActions = true, 
  compact = false 
}: SOAPNotesDisplayProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadge = (score?: number) => {
    if (!score) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let color = "text-gray-600";
    
    if (score >= 90) {
      variant = "default";
      color = "text-green-600";
    } else if (score >= 80) {
      color = "text-blue-600";
    } else if (score >= 70) {
      color = "text-yellow-600";
    } else {
      variant = "destructive";
      color = "text-red-600";
    }

    return (
      <Badge variant={variant} className={cn("flex items-center gap-1", color)}>
        <Star className="h-3 w-3" />
        {score}% Quality
      </Badge>
    );
  };

  const handleDownload = () => {
    const content = `
SOAP CLINICAL NOTES
Generated on: ${formatDate(soapNote.createdAt)}
Quality Score: ${soapNote.qualityScore || 'N/A'}%
Processing Time: ${soapNote.processingTime || 'N/A'}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}

${soapNote.recommendations?.length ? `
RECOMMENDATIONS:
${soapNote.recommendations.map(rec => `• ${rec}`).join('\n')}
` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-notes-${new Date(soapNote.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleDoc = () => {
    if (soapNote.googleDocUrl) {
      window.open(soapNote.googleDocUrl, '_blank');
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-base">SOAP Notes</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getQualityBadge(soapNote.qualityScore)}
              <Badge variant="outline" className="text-xs">
                {formatDate(soapNote.createdAt)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Subjective</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.subjective.substring(0, 100)}...
              </p>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-1">Objective</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.objective.substring(0, 100)}...
              </p>
            </div>
            <div>
              <h4 className="font-medium text-orange-700 mb-1">Assessment</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.assessment.substring(0, 100)}...
              </p>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-1">Plan</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.plan.substring(0, 100)}...
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button onClick={() => setShareDialogOpen(true)} variant="outline" size="sm">
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle>SOAP Clinical Notes</CardTitle>
                <CardDescription>
                  Generated on {formatDate(soapNote.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getQualityBadge(soapNote.qualityScore)}
              {soapNote.processingTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {soapNote.processingTime}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {showActions && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setShareDialogOpen(true)} variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share with Doctor
              </Button>
              {soapNote.googleDocUrl && (
                <Button onClick={handleOpenGoogleDoc} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Docs
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* SOAP Sections */}
      <div className="grid gap-6">
        {/* Subjective */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Subjective
            </CardTitle>
            <CardDescription>Patient's reported symptoms and concerns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {soapNote.subjective}
            </p>
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Objective
            </CardTitle>
            <CardDescription>Observable findings and measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {soapNote.objective}
            </p>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Assessment
            </CardTitle>
            <CardDescription>Clinical analysis and diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {soapNote.assessment}
            </p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Plan
            </CardTitle>
            <CardDescription>Treatment plan and next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {soapNote.plan}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {soapNote.recommendations && soapNote.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Additional insights and suggestions based on the clinical data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {soapNote.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="leading-relaxed">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Highlighted HTML */}
      {soapNote.highlightedHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced View</CardTitle>
            <CardDescription>
              AI-highlighted clinical content with key terms emphasized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: soapNote.highlightedHtml }}
            />
          </CardContent>
        </Card>
      )}

      {/* Share Dialog */}
      <ShareSOAPDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        soapNoteId={soapNote._id}
        onSuccess={() => {
          // Could add a success callback here
        }}
      />
    </div>
  );
}
