import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Calendar, Brain, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
// import type { SharedSOAPNote } from "@/convex/sharedSoapNotes";

interface PatientSOAPListProps {
  patientId: string;
  sharedSoapNotes?: any[];
  isLoading?: boolean;
  selectedSOAPNoteId?: string | null;
  onSelectSOAP?: (soapNoteId: string | null) => void;
  onViewSOAP?: (soapNoteId: string) => void;
  className?: string;
}

/**
 * PatientSOAPList Component
 * 
 * Displays SOAP notes shared by the patient to the doctor
 * Used in the treatment form layout
 */
export const PatientSOAPList = React.memo<PatientSOAPListProps>(({
  patientId: _patientId,
  sharedSoapNotes = [],
  isLoading = false,
  selectedSOAPNoteId,
  onSelectSOAP,
  onViewSOAP,
  className,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        {/* Header Skeleton */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-5 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border border-border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sharedSoapNotes.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No SOAP Notes</h3>
          <p className="text-sm text-muted-foreground">
            Patient hasn't shared any clinical records yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Patient SOAP Notes</h3>
            <p className="text-xs text-muted-foreground">
              {sharedSoapNotes.length} shared clinical record{sharedSoapNotes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs h-6 px-2">
            {sharedSoapNotes.length}
          </Badge>
        </div>
      </div>
      
      {/* SOAP Notes List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-3">
          {sharedSoapNotes.map((note) => {
            const isSelected = selectedSOAPNoteId === note.soapNote._id;
            return (
              <div
                key={note._id}
                className={cn(
                  "p-3 border rounded-lg transition-colors cursor-pointer group",
                  isSelected
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border bg-background hover:bg-muted/30"
                )}
                onClick={() => onSelectSOAP?.(isSelected ? null : note.soapNote._id)}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {note.soapNote.data?.chiefComplaint || 
                         note.soapNote.data?.primaryDiagnosis || 
                         "Clinical Note"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <Badge variant="default" className="text-xs h-4 px-1">
                          Selected
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewSOAP?.(note.soapNote._id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {note.soapNote.subjective?.substring(0, 80)}
                    {(note.soapNote.subjective?.length || 0) > 80 ? '...' : ''}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {note.soapNote.data?.hasEnhancedData && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        <Brain className="h-2 w-2 mr-1" />
                        AI
                      </Badge>
                    )}
                    {note.soapNote.data?.safetyStatus !== undefined && (
                      <Badge 
                        variant={note.soapNote.data.safetyStatus ? "default" : "outline"}
                        className={cn(
                          "text-xs h-4 px-1",
                          !note.soapNote.data.safetyStatus && "border-destructive/50 text-destructive bg-destructive/10"
                        )}
                      >
                        <Shield className="h-2 w-2 mr-1" />
                        {note.soapNote.data.safetyStatus ? 'Safe' : 'Alert'}
                      </Badge>
                    )}
                    {note.shareType === "referral_share" && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        Referral
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

PatientSOAPList.displayName = "PatientSOAPList";