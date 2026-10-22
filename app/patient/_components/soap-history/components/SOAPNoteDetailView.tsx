"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOAPNotesDisplay } from "./SOAPNotesDisplay";
import { ArrowLeft, Star, Calendar } from "lucide-react";
import { SOAPNote } from "../types";
import { cn } from "@/lib/utils";

interface SOAPNoteDetailViewProps {
  note: SOAPNote;
  onBack: () => void;
  formatDate?: (timestamp: number) => string;
  getQualityColor?: (score?: number) => string;
  className?: string;
}

/**
 * Detailed view for a single SOAP note
 * Optimized with React.memo for performance
 */
export const SOAPNoteDetailView = React.memo<SOAPNoteDetailViewProps>(({
  note,
  onBack,
  formatDate,
  getQualityColor,
  className,
}) => {
  // Default formatters if not provided
  const defaultFormatDate = (timestamp: number) => 
    new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const defaultGetQualityColor = (score?: number) => {
    if (!score) return "text-gray-500 bg-gray-50 border-gray-200";
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const dateFormatter = formatDate || defaultFormatDate;
  const qualityColorGetter = getQualityColor || defaultGetQualityColor;

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <div className="flex items-center gap-3">
          {note.qualityScore && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1",
                qualityColorGetter(note.qualityScore)
              )}
            >
              <Star className="h-3 w-3" />
              Quality: {note.qualityScore}%
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
            <Calendar className="h-3 w-3" />
            {dateFormatter(note.createdAt)}
          </Badge>
        </div>
      </div>
      
      {/* SOAP Notes Display - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SOAPNotesDisplay soapNote={note} />
      </div>
    </div>
  );
});

SOAPNoteDetailView.displayName = "SOAPNoteDetailView";
