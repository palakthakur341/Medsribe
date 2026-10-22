"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SOAPViewer, useSOAPViewer } from "@/components/ui/soap-viewer";
import {
  FileText,
  Eye,
  Brain,
  Shield,
  Stethoscope,
  Share,
  UserCheck,
  ChevronRight,
  Search,
  X,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface PatientSOAPHistoryProps {
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  className?: string;
  onClose?: () => void;
}

/**
 * PatientSOAPHistory Component
 * 
 * Comprehensive SOAP notes viewer showing all shared and referred SOAP notes
 * for a patient that came to this doctor. Follows AppointmentsList UI patterns.
 */
export const PatientSOAPHistory: React.FC<PatientSOAPHistoryProps> = ({
  patientId,
  doctorId,
  className,
  onClose,
}) => {
  // Early return if required props are missing
  if (!patientId || !doctorId) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">Invalid Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Patient or doctor ID is missing
          </p>
        </div>
      </div>
    );
  }

  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "shared" | "referral">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // SOAP viewer hook
  const soapViewer = useSOAPViewer();

  // Fetch all shared SOAP notes for this patient to this doctor
  const sharedSoapNotes = useQuery(
    api.sharedSoapNotes.getSharedNotesForDoctor,
    { patientId, doctorId }
  );

  // Fetch patient details
  const patient = useQuery(api.patients.getPatientById, { patientId });

  // Loading state
  const isLoading = sharedSoapNotes === undefined || patient === undefined;

  // Filter and search SOAP notes
  const filteredNotes = React.useMemo(() => {
    if (!sharedSoapNotes || !Array.isArray(sharedSoapNotes)) return [];

    let filtered = [...sharedSoapNotes];

    // Apply filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(note => {
        if (selectedFilter === "shared") return note?.shareType === "direct_share";
        if (selectedFilter === "referral") return note?.shareType === "referral_share";
        return true;
      });
    }

    // Apply search
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => {
        if (!note?.soapNote) return false;

        try {
          // Search in SOAP note data
          const searchableText = [
            note.soapNote.status || '',
            JSON.stringify(note.soapNote.data || {})
          ].join(' ').toLowerCase();

          return searchableText.includes(query);
        } catch (error) {
          return false;
        }
      });
    }

    return filtered.sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
  }, [sharedSoapNotes, selectedFilter, searchQuery]);

  // Handle SOAP note viewing
  const handleViewSOAP = React.useCallback((soapNote: any) => {
    if (soapNote && soapViewer?.openViewer) {
      soapViewer.openViewer(soapNote);
    }
  }, [soapViewer]);

  // Get share type info
  const getShareTypeInfo = (shareType: string) => {
    switch (shareType) {
      case "referral_share":
        return {
          icon: <UserCheck className="h-3 w-3" />,
          label: "Referral",
          variant: "default" as const
        };
      case "direct_share":
        return {
          icon: <Share className="h-3 w-3" />,
          label: "Shared",
          variant: "secondary" as const
        };
      default:
        return {
          icon: <FileText className="h-3 w-3" />,
          label: "Note",
          variant: "outline" as const
        };
    }
  };

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
              <div className="h-3 w-40 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-8 bg-muted rounded animate-pulse" />
            {onClose && (
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="flex-shrink-0 p-4 border-b border-border/50 space-y-3">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-9 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">SOAP History</h3>
              <p className="text-xs text-muted-foreground">
                {patient?.firstName} {patient?.lastName} - Clinical Records
              </p>
            </div>
            <Badge variant="secondary">
              {filteredNotes.length}
            </Badge>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close SOAP history</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex-shrink-0 p-4 border-b border-border/50 space-y-3">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", icon: <FileText className="h-4 w-4" /> },
              { key: "shared", label: "Shared", icon: <Share className="h-4 w-4" /> },
              { key: "referral", label: "Referrals", icon: <UserCheck className="h-4 w-4" /> }
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={selectedFilter === filter.key ? "default" : "outline"}
                className="px-3"
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SOAP notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                  <Stethoscope className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-sm mb-1 text-foreground">
                  {searchQuery ? "No matching SOAP notes" : "No SOAP History"}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Patient hasn't shared any clinical records yet"
                  }
                </p>
                <Button
                  onClick={() => {
                    const testNote = {
                      _id: "test-soap-1",
                      subjective: "Patient reports feeling better after treatment. No side effects noted.",
                      objective: "Vital signs stable. Temperature 98.6°F, BP 120/80, HR 72.",
                      assessment: "Responding well to current treatment plan.",
                      plan: "Continue current medication. Follow up in 2 weeks.",
                      data: {
                        chiefComplaint: "Follow-up visit",
                        primaryDiagnosis: "Hypertension, controlled",
                        hasEnhancedData: true,
                        safetyStatus: true,
                        specialty_detection: { specialty: "Internal Medicine" }
                      }
                    };
                    handleViewSOAP(testNote);
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Test SOAP Viewer
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotes.map((note) => {
                  const shareTypeInfo = getShareTypeInfo(note.shareType);

                  return (
                    <div
                      key={note._id}
                      className="p-4 cursor-pointer group hover:bg-muted/30 transition-colors"
                      onClick={() => handleViewSOAP(note.soapNote)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Time and Date */}
                          <div className="flex flex-col items-center gap-1 min-w-[70px]">
                            <div className="text-sm font-medium text-foreground">
                              {new Date(note.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>

                          {/* SOAP Info */}
                          <div className="flex items-start gap-3 flex-1">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {note.soapNote?.status || "Clinical Note"}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {note.soapNote?.status?.substring(0, 100) || "No preview available"}
                                {(note.soapNote?.status?.length || 0) > 100 ? '...' : ''}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant={shareTypeInfo.variant}
                                  className="text-xs h-4 px-2"
                                >
                                  {shareTypeInfo.icon}
                                  <span className="ml-1">{shareTypeInfo.label}</span>
                                </Badge>
                                {note.soapNote?.data && (
                                  <Badge variant="outline" className="text-xs h-4 px-2">
                                    <Brain className="h-2 w-2 mr-1" />
                                    AI
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs h-4 px-2">
                                  <Shield className="h-2 w-2 mr-1" />
                                  Clinical
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground">
                            {note.shareType === "referral_share" ? "Referral" : "Shared"}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSOAP(note.soapNote);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* SOAP Viewer */}
      <SOAPViewer
        note={soapViewer.selectedNote}
        open={soapViewer.isOpen}
        onOpenChange={soapViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: false,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to SOAP History",
          documentTitle: "Shared SOAP Note"
        }}
        actions={{
          onBack: soapViewer.closeViewer,
        }}
      />
    </>
  );
};