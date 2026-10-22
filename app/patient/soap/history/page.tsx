"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import {
  SOAPHistoryHeader,
  SOAPEmptyState,
  SOAPNotesGrid,
  SOAPHistorySkeleton,
  SOAPErrorBoundary,
  ShareSOAPDialog,
} from "@/app/patient/_components/soap-history";
import { SOAPViewer, useSOAPViewer } from "@/components/ui/soap-viewer";
import { api } from "@/convex/_generated/api";

/**
 * SOAP History Page - Simplified Approach
 *
 * This page uses direct state management instead of complex hooks to prevent
 * infinite re-renders and ensure stable performance. All functionality is
 * preserved while maintaining clean, readable code.
 */

export default function SOAPHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Memoize patient ID to prevent infinite re-renders
  const patientId = useMemo(() => {
    return patientProfile?._id || "";
  }, [patientProfile?._id]);

  // Direct state management for stability and performance
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSoapNoteId, setSelectedSoapNoteId] = useState<string | null>(null);

  // Professional SOAP Viewer
  const soapViewer = useSOAPViewer();

  // Data fetching
  const soapNotes = useQuery(
    api.soapNotes.getByPatientId,
    patientId ? { patientId: patientId as any } : "skip"
  );

  const sharedNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );

  const referrals = useQuery(
    api.referrals.getByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );

  // Use notes directly without filtering
  const filteredNotes = soapNotes || [];

  // Simple shared notes map
  const sharedNotesMap = useMemo(() => {
    const map = new Map();
    (sharedNotes || []).forEach(shared => {
      const noteId = shared.soapNoteId;
      if (!map.has(noteId)) {
        map.set(noteId, []);
      }
      map.get(noteId).push(shared);
    });
    return map;
  }, [sharedNotes]);

  const loading = soapNotes === undefined || sharedNotes === undefined || referrals === undefined;

  // Simple handlers
  const handleShareNote = useCallback((soapNoteId: string) => {
    setSelectedSoapNoteId(soapNoteId);
    setShareDialogOpen(true);
  }, []);

  const handleShareSuccess = useCallback(() => {
    setShareDialogOpen(false);
    setSelectedSoapNoteId(null);
  }, []);

  const handleDownloadNote = useCallback((note: any) => {
    const content = `SOAP Note - ${new Date(note.createdAt).toLocaleDateString()}

SUBJECTIVE: ${note.subjective}
OBJECTIVE: ${note.objective}
ASSESSMENT: ${note.assessment}
PLAN: ${note.plan}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${new Date(note.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getQualityColor = useCallback((score?: number) => {
    if (!score) return "text-gray-500 bg-gray-50 border-gray-200";
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  }, []);

  // Handle viewing SOAP note with professional viewer
  const handleViewNote = useCallback((noteId: string) => {
    const note = filteredNotes.find(n => n._id === noteId);
    if (note) {
      soapViewer.openViewer(note);
    }
  }, [filteredNotes, soapViewer]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <SOAPHistorySkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Main SOAP History view
  return (
    <SOAPErrorBoundary>
      <div className="h-full flex flex-col p-4 space-y-3">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <SOAPHistoryHeader
            patientProfile={patientProfile || undefined}
            title="SOAP Notes History"
            subtitle="View and manage your generated clinical documentation"
          />
        </div>

        {/* SOAP Notes Grid - Scrollable */}
        <div className="flex-1 min-h-0">
          {filteredNotes.length === 0 ? (
            <SOAPEmptyState />
          ) : (
            <SOAPNotesGrid
              notes={filteredNotes}
              sharedNotesMap={sharedNotesMap}
              referrals={[] as any}
              onDownload={handleDownloadNote}
              onShare={handleShareNote}
              onView={handleViewNote}
              formatDate={formatDate}
              getQualityColor={getQualityColor}
              loading={loading}
              virtualized={filteredNotes.length > 50}
            />
          )}
        </div>

        {/* Share Dialog */}
        {selectedSoapNoteId && (
          <ShareSOAPDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            soapNoteId={selectedSoapNoteId}
            onSuccess={handleShareSuccess}
          />
        )}
      </div>

      {/* Professional SOAP Viewer for full-screen document view */}
      {soapViewer.selectedNote && (
        <SOAPViewer
          note={soapViewer.selectedNote}
          open={soapViewer.isOpen}
          onOpenChange={soapViewer.setOpen}
          config={{
            showBackButton: true,
            showActions: true,
            showPatientInfo: true,
            backButtonText: "Back to SOAP History"
          }}
          actions={{
            onBack: soapViewer.closeViewer,
            onDownload: () => {
              if (soapViewer.selectedNote) {
                handleDownloadNote(soapViewer.selectedNote._id);
              }
            }
          }}
        />
      )}
    </SOAPErrorBoundary>
  );
}