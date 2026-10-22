import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, ChevronDown, ChevronUp, Clock, Sparkles } from "lucide-react";
import { RelevantDocumentsSectionProps, EnhancedRelevantDocument } from "../types";
import type { StructuredResponse } from "@/lib/services/rag-api";

// Enhanced props to support structured responses
interface EnhancedRelevantDocumentsSectionProps extends RelevantDocumentsSectionProps {
  enhancedDocuments?: EnhancedRelevantDocument[];
  structuredResponse?: StructuredResponse;
  processingTime?: number;
}

export const RelevantDocumentsSection: React.FC<EnhancedRelevantDocumentsSectionProps> = React.memo(({
  documents,
  enhancedDocuments,
  structuredResponse,
  processingTime
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStructured, setShowStructured] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleStructured = useCallback(() => {
    setShowStructured(prev => !prev);
  }, []);

  // Use enhanced documents if available, fallback to regular documents
  const displayDocuments = enhancedDocuments || documents;

  if (!displayDocuments || displayDocuments.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-3 space-y-2">
      {/* Structured Response Display */}
      {structuredResponse && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleStructured}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Analysis: {structuredResponse.type.replace(/_/g, ' ')}
            {showStructured ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>

          {showStructured && (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{structuredResponse.summary}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs space-y-2">
                  {Object.entries(structuredResponse.data).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                      <div className="ml-2 text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Documents Section */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          <FileText className="h-3 w-3 mr-1" />
          {displayDocuments.length} relevant document{displayDocuments.length > 1 ? 's' : ''} found
          {processingTime && (
            <span className="ml-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {processingTime.toFixed(1)}s
            </span>
          )}
          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>

        {isExpanded && (
          <div className="mt-2 space-y-1">
            {displayDocuments.map((doc) => (
              <div key={doc.id} className="bg-background border rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs h-4">
                    {doc.event_type.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {doc.content_preview || doc.content?.substring(0, 200) + "..."}
                </p>
                <div className="mt-1 text-xs text-muted-foreground">
                  Similarity: {(doc.similarity_score * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

RelevantDocumentsSection.displayName = "RelevantDocumentsSection";
