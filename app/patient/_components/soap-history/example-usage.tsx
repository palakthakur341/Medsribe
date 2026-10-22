"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  useSOAPStats,
  SOAPHistoryHeader,
  SOAPSearchBar,
  SOAPStatsOverview,
  SOAPNotesGrid,
  SOAPNoteCard,
  SOAPEmptyState,
  SOAPErrorBoundary,
  SOAPNoteDialogWrapper,
  useSOAPNoteDialogComponent,
  SOAPDocumentViewerWrapper,
  useSOAPDocumentViewerComponent,
  SOAPViewer,
  useSOAPViewer,
  type SOAPNote,
} from "./index";

/**
 * Example 1: Basic SOAP History Page
 * This is the most common usage pattern
 */
export function BasicSOAPHistoryExample({ patientId }: { patientId: string }) {
  const {
    filteredNotes,
    stats,
    searchTerm,
    setSearchTerm,
    handleShareNote,
    handleDownloadNote,
    handleClearSearch,
    loading,
    patientProfile,
  } = useSOAPHistory(patientId);

  // New Universal SOAP Viewer
  const soapViewer = useSOAPViewer();

  return (
    <SOAPErrorBoundary>
      <div className="space-y-6 p-6">
        {/* Header with patient info and create button */}
        <SOAPHistoryHeader 
          patientProfile={patientProfile}
          title="My SOAP Notes"
          subtitle="View and manage your clinical documentation"
        />
        
        {/* Statistics overview */}
        <SOAPStatsOverview 
          stats={stats} 
          loading={loading}
          showTrends
        />
        
        {/* Search bar */}
        <SOAPSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredCount={filteredNotes.length}
          totalCount={stats.totalNotes}
          showFilters
        />
        
        {/* Notes grid or empty state */}
        {filteredNotes.length === 0 ? (
          <SOAPEmptyState 
            searchTerm={searchTerm}
            onClearSearch={handleClearSearch}
          />
        ) : (
          <SOAPNotesGrid
            notes={filteredNotes}
            onShare={handleShareNote}
            onDownload={handleDownloadNote}
            loading={loading}
            virtualized={filteredNotes.length > 50}
          />
        )}
      </div>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 2: Compact Dashboard Widget
 * Shows how to use components in a compact layout
 */
export function CompactSOAPWidgetExample({ patientId }: { patientId: string }) {
  const { filteredNotes, stats, loading } = useSOAPHistory(patientId);
  
  // Show only recent notes (last 5)
  const recentNotes = filteredNotes.slice(0, 5);

  return (
    <SOAPErrorBoundary>
      <div className="space-y-4 p-4 bg-card rounded-lg border">
        <h3 className="font-semibold text-lg">Recent SOAP Notes</h3>
        
        {/* Compact stats */}
        <SOAPStatsOverview 
          stats={stats} 
          loading={loading}
          compact
        />
        
        {/* Compact note cards */}
        <div className="space-y-2">
          {recentNotes.map(note => (
            <SOAPNoteCard
              key={note._id}
              note={note}
              compact
              showActions={false}
            />
          ))}
        </div>
        
        {recentNotes.length === 0 && (
          <SOAPEmptyState 
            title="No recent notes"
            description="You haven't created any SOAP notes recently."
            showCreateAction
          />
        )}
      </div>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 3: Custom Implementation with Individual Hooks
 * Shows how to use hooks separately for custom functionality
 */
export function CustomSOAPImplementationExample({ 
  notes, 
  sharedNotes 
}: { 
  notes: SOAPNote[];
  sharedNotes: any[];
}) {
  // Use individual hooks for custom logic
  const { 
    filteredNotes, 
    searchTerm, 
    setSearchTerm,
    clearSearch 
  } = useSOAPSearch(notes, 500); // Custom debounce timing

  const { stats, loading: statsLoading } = useSOAPStats(filteredNotes, sharedNotes);
  
  const { 
    openShareDialog, 
    shareDialogOpen,
    selectedSoapNoteId 
  } = useSOAPSharing();

  // Custom filter logic
  const highQualityNotes = filteredNotes.filter(note => 
    (note.qualityScore || 0) >= 80
  );

  return (
    <div className="space-y-6">
      {/* Custom header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">High Quality SOAP Notes</h2>
        <div className="text-sm text-muted-foreground">
          {highQualityNotes.length} of {filteredNotes.length} notes
        </div>
      </div>

      {/* Custom search with different styling */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <SOAPSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredCount={highQualityNotes.length}
          totalCount={notes.length}
          placeholder="Search high-quality notes..."
        />
      </div>

      {/* Custom stats display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SOAPStatsOverview 
          stats={stats} 
          loading={statsLoading}
        />
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium mb-2">Quality Distribution</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Excellent (90%+)</span>
              <span>{notes.filter(n => (n.qualityScore || 0) >= 90).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Good (75-89%)</span>
              <span>{notes.filter(n => (n.qualityScore || 0) >= 75 && (n.qualityScore || 0) < 90).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Fair (60-74%)</span>
              <span>{notes.filter(n => (n.qualityScore || 0) >= 60 && (n.qualityScore || 0) < 75).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom notes display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {highQualityNotes.map(note => (
          <SOAPNoteCard
            key={note._id}
            note={note}
            onShare={openShareDialog}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>

      {/* Custom empty state */}
      {highQualityNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No high-quality notes match "${searchTerm}"`
              : "No high-quality notes found"
            }
          </p>
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="text-primary hover:underline"
            >
              Clear search to see all notes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Error Handling and Loading States
 * Shows proper error boundaries and loading state management
 */
export function ErrorHandlingExample({ patientId }: { patientId: string }) {
  const soapHistoryData = useSOAPHistory(patientId);

  // Custom error fallback
  const CustomErrorFallback = ({ error, retry }: { error?: Error; retry: () => void }) => (
    <div className="text-center py-12 bg-destructive/5 rounded-lg border border-destructive/20">
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Failed to load SOAP notes
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || "Something went wrong"}
      </p>
      <button 
        onClick={retry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <SOAPErrorBoundary 
      fallback={CustomErrorFallback}
      onError={(error, errorInfo) => {
        // Custom error logging
        console.error("SOAP History Error:", { error, errorInfo, patientId });
      }}
    >
      <div className="space-y-6">
        {soapHistoryData.loading ? (
          // Custom loading state
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : (
          // Regular content
          <BasicSOAPHistoryExample patientId={patientId} />
        )}
      </div>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 5: Using SOAP Note Dialog
 * Shows how to use the new dialog overlay for viewing notes
 */
export function SOAPDialogExample({ notes }: { notes: SOAPNote[] }) {
  const handleDownload = useCallback((note: SOAPNote) => {
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

  const handleShare = useCallback((noteId: string) => {
    console.log("Share note:", noteId);
  }, []);

  return (
    <SOAPErrorBoundary>
      {/* Simple document-style dialog wrapper */}
      <SOAPNoteDialogWrapper>
        {({ openDialog }) => (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SOAP Notes - Document View</h3>
            <p className="text-sm text-muted-foreground">
              Click any note to view it as a clean, readable document
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <div
                  key={note._id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => openDialog(note)}
                >
                  <h4 className="font-medium">SOAP Clinical Note</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {note.subjective.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SOAPNoteDialogWrapper>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 6: Using the Dialog Hook Directly
 * Shows how to use the hook for more control
 */
export function SOAPDialogHookExample({ notes }: { notes: SOAPNote[] }) {
  const { openDialog, DialogComponent } = useSOAPNoteDialogComponent();

  return (
    <SOAPErrorBoundary>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Document-Style SOAP Dialog</h3>
        <p className="text-sm text-muted-foreground">
          Clean, readable document format in a dialog overlay
        </p>
        <div className="flex flex-wrap gap-2">
          {notes.map(note => (
            <Button
              key={note._id}
              variant="outline"
              onClick={() => openDialog(note)}
              className="text-left"
            >
              📄 {new Date(note.createdAt).toLocaleDateString()}
            </Button>
          ))}
        </div>
      </div>

      {/* Simple document dialog */}
      {DialogComponent}
    </SOAPErrorBoundary>
  );
}

/**
 * Example 7: Using SOAP Document Viewer (Full Page)
 * Shows how to use the standalone document viewer component
 */
export function SOAPDocumentViewerExample({ notes }: { notes: SOAPNote[] }) {
  return (
    <SOAPErrorBoundary>
      {/* Method 1: Using the wrapper component with render props */}
      <SOAPDocumentViewerWrapper>
        {({ openDocument, isViewingDocument }) => {
          // If viewing document, the wrapper handles rendering the document viewer
          if (isViewingDocument) {
            return null; // Wrapper will show the document viewer
          }

          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SOAP Notes - Full Document View</h3>
              <p className="text-sm text-muted-foreground">
                Click any note to view it as a full-page document with better width and readability
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <div
                    key={note._id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => openDocument(note)}
                  >
                    <h4 className="font-medium">📄 SOAP Clinical Note</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {note.subjective.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      </SOAPDocumentViewerWrapper>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 8: Using Document Viewer Hook Directly
 * Shows how to use the hook for more control
 */
export function SOAPDocumentViewerHookExample({ notes }: { notes: SOAPNote[] }) {
  const { openDocument, DocumentViewerComponent, isViewingDocument } = useSOAPDocumentViewerComponent();

  if (isViewingDocument) {
    return DocumentViewerComponent;
  }

  return (
    <SOAPErrorBoundary>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Document Viewer</h3>
        <p className="text-sm text-muted-foreground">
          Full-page document view with optimal width and typography for clinical notes
        </p>
        <div className="flex flex-wrap gap-2">
          {notes.map(note => (
            <Button
              key={note._id}
              variant="default"
              onClick={() => openDocument(note)}
              className="text-left"
            >
              📋 View Document - {new Date(note.createdAt).toLocaleDateString()}
            </Button>
          ))}
        </div>
      </div>
    </SOAPErrorBoundary>
  );
}

/**
 * Example 9: Using the New Universal SOAP Viewer
 * Shows how to use the new full-screen overlay SOAP viewer
 */
export function UniversalSOAPViewerExample({ notes }: { notes: SOAPNote[] }) {
  const soapViewer = useSOAPViewer();

  const handleDownload = useCallback((note: SOAPNote) => {
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

  const handleShare = useCallback((note: SOAPNote) => {
    console.log("Share note:", note._id);
    // Implement share functionality
  }, []);

  return (
    <SOAPErrorBoundary>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Universal SOAP Viewer</h3>
        <p className="text-sm text-muted-foreground">
          Full-screen overlay with document-like layout, enhanced features, and professional presentation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <div
              key={note._id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => soapViewer.openViewer(note)}
            >
              <h4 className="font-medium">📋 SOAP Clinical Note</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
              {note.qualityScore && (
                <div className="mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Quality: {note.qualityScore}%
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {note.subjective.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>

        {/* Universal SOAP Viewer - Full Screen Overlay (No Dialog Constraints) */}
        <SOAPViewer
          note={soapViewer.selectedNote}
          open={soapViewer.isOpen}
          onOpenChange={soapViewer.setOpen}
          config={{
            showBackButton: true,
            showActions: true,
            showPatientInfo: false, // Patient context - no need to show patient info
            showMetadata: true,
            allowPrint: true,
            allowDownload: true,
            allowCopy: true,
            allowShare: true,
            backButtonText: "Back to History",
            documentTitle: "SOAP Clinical Note"
          }}
          actions={{
            onBack: soapViewer.closeViewer,
            onDownload: handleDownload,
            onShare: handleShare,
          }}
        />
      </div>
    </SOAPErrorBoundary>
  );
}
