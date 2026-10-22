import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Stethoscope, Download, Clock, User, Calendar, Brain, Shield, ShieldAlert, AlertTriangle } from "lucide-react";
import { SOAPUtils } from "@/app/patient/_components/soap-history/types";
import type { SharedSOAPNoteCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * SharedSOAPNoteCard Component
 *
 * Displays an individual shared SOAP note with patient info, preview, and actions
 * Optimized for performance with React.memo
 */
export const SharedSOAPNoteCard = React.memo<SharedSOAPNoteCardProps>(({
  note,
  onViewSOAP,
  onTakeAction,
  onDownloadNote,
  formatDate,
}) => {
  // Extract enhanced data using utility functions
  const qualityScore = note.soapNote ? SOAPUtils.getQualityScore(note.soapNote) : undefined;
  const specialty = note.soapNote ? SOAPUtils.getSpecialty(note.soapNote) : undefined;
  const safetyStatus = note.soapNote ? SOAPUtils.getSafetyStatus(note.soapNote) : undefined;
  const redFlags = note.soapNote ? SOAPUtils.getRedFlags(note.soapNote) : [];
  const hasEnhancedData = note.soapNote ? SOAPUtils.hasEnhancedData(note.soapNote) : false;
  const subjective = note.soapNote ? SOAPUtils.getSubjective(note.soapNote) : '';
  const assessment = note.soapNote ? SOAPUtils.getAssessment(note.soapNote) : '';
  const chiefComplaint = note.soapNote ? SOAPUtils.getChiefComplaint(note.soapNote) : undefined;
  const primaryDiagnosis = note.soapNote ? SOAPUtils.getPrimaryDiagnosis(note.soapNote) : undefined;
  return (
    <Card className="hover:shadow-sm transition-all duration-200 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar & Status */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                {note.patient?.firstName[0]}{note.patient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {!note.isRead && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive border border-background rounded-full"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header Row - More Compact */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {note.patient?.firstName} {note.patient?.lastName}
                </h4>
                <Badge
                  variant={note.shareType === "direct_share" ? "default" : "secondary"}
                  className="text-xs h-5 px-1.5"
                >
                  {note.shareType === "direct_share" ? "Direct" : "Referral"}
                </Badge>

                {/* Enhanced data indicator */}
                {hasEnhancedData && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    <Brain className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}

                {/* Safety status */}
                {safetyStatus !== undefined && (
                  <Badge variant={safetyStatus ? "default" : "outline"} className={cn(
                    "text-xs h-5 px-1.5",
                    !safetyStatus && "border-destructive/50 text-destructive bg-destructive/10"
                  )}>
                    {safetyStatus ? <Shield className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                    {safetyStatus ? 'Safe' : 'Alert'}
                  </Badge>
                )}

                {/* Specialty */}
                {specialty && (
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {specialty.length > 8 ? specialty.substring(0, 8) + '...' : specialty}
                  </Badge>
                )}

                {/* Quality score */}
                {qualityScore && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    {qualityScore}%
                  </Badge>
                )}

                {/* Red flags indicator */}
                {redFlags.length > 0 && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5 border-destructive/50 text-destructive bg-destructive/10">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {redFlags.length}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>

            {/* Patient Info - Compact */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>MRN: {note.patient?.mrn || 'N/A'}</span>
              <span className="capitalize">{note.patient?.gender}</span>
              <span>{note.patient?.dateOfBirth}</span>
            </div>

            {/* Separator */}
            <div className="border-t border-border"></div>

            {/* Message - Compact */}
            {note.message && (
              <div className="bg-muted/30 border-l-2 border-primary/50 pl-2 py-1 rounded-r text-xs">
                <p className="text-muted-foreground italic">"{note.message.substring(0, 100)}..."</p>
              </div>
            )}

            {/* SOAP Preview */}
            <div className="space-y-2">
              {/* Chief Complaint or Primary Diagnosis (if available) */}
              {(chiefComplaint || primaryDiagnosis) && (
                <div className="p-2 bg-muted/30 border border-border rounded-lg">
                  <h4 className="text-xs font-semibold text-foreground mb-1">
                    {chiefComplaint ? 'Chief Complaint' : 'Primary Diagnosis'}
                  </h4>
                  <p className="text-xs text-foreground">
                    {(chiefComplaint || primaryDiagnosis)!.substring(0, 80)}
                    {(chiefComplaint || primaryDiagnosis)!.length > 80 ? '...' : ''}
                  </p>
                </div>
              )}

              {/* SOAP Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subjective && (
                  <div className="p-2 bg-muted/30 border border-border rounded-lg">
                    <h4 className="text-xs font-semibold text-foreground mb-1">Subjective</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {subjective.substring(0, 60)}...
                    </p>
                  </div>
                )}
                {assessment && (
                  <div className="p-2 bg-muted/30 border border-border rounded-lg">
                    <h4 className="text-xs font-semibold text-foreground mb-1">Assessment</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {assessment.substring(0, 60)}...
                    </p>
                  </div>
                )}
              </div>

              {/* Safety & Quality Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Safety Status */}
                {safetyStatus !== undefined && (
                  <div className="p-2 bg-muted/30 border border-border rounded-lg">
                    <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                      {safetyStatus ? <Shield className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      Safety Status
                    </h4>
                    <p className="text-xs text-foreground">
                      {safetyStatus ? 'Safe' : 'Requires Attention'}
                    </p>
                  </div>
                )}

                {/* Red Flags */}
                {redFlags.length > 0 && (
                  <div className="p-2 bg-muted/30 border border-border rounded-lg">
                    <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Red Flags ({redFlags.length})
                    </h4>
                    <p className="text-xs text-foreground">
                      {redFlags.slice(0, 2).join(', ')}
                      {redFlags.length > 2 && ` +${redFlags.length - 2} more`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => onViewSOAP(note)}
                  className="h-7 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTakeAction(note)}
                  className="h-7 px-2 text-xs"
                >
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Action
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadNote(note)}
                className="h-7 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SharedSOAPNoteCard.displayName = "SharedSOAPNoteCard";
