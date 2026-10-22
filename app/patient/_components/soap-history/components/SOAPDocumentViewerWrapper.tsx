"use client";

import React from "react";
import { SOAPNoteDocumentViewer } from "./SOAPNoteDocumentViewer";
import { useSOAPDocumentViewer } from "../hooks/useSOAPDocumentViewer";
import { SOAPNote } from "../types";

interface SOAPDocumentViewerWrapperProps {
  children: (props: {
    openDocument: (note: SOAPNote) => void;
    closeDocument: () => void;
    isViewingDocument: boolean;
    selectedNote: SOAPNote | null;
  }) => React.ReactNode;
  showBackButton?: boolean;
  backButtonOverlay?: boolean;
  className?: string;
}

/**
 * SOAP Document Viewer Wrapper Component
 * 
 * Provides a render prop pattern for easy integration with any component
 * that needs to display SOAP notes in a full document view.
 * 
 * Usage:
 * <SOAPDocumentViewerWrapper>
 *   {({ openDocument, isViewingDocument }) => (
 *     isViewingDocument ? null : (
 *       <Button onClick={() => openDocument(note)}>View Document</Button>
 *     )
 *   )}
 * </SOAPDocumentViewerWrapper>
 */
export const SOAPDocumentViewerWrapper = React.memo<SOAPDocumentViewerWrapperProps>(({
  children,
  showBackButton = true,
  backButtonOverlay = false,
  className,
}) => {
  const { selectedNote, isViewingDocument, openDocument, closeDocument } = useSOAPDocumentViewer();

  // If viewing document, show the document viewer
  if (isViewingDocument && selectedNote) {
    return (
      <SOAPNoteDocumentViewer
        note={selectedNote}
        onBack={closeDocument}
        showBackButton={showBackButton}
        backButtonOverlay={backButtonOverlay}
        className={className}
      />
    );
  }

  // Otherwise, render children with document controls
  return (
    <>
      {children({
        openDocument,
        closeDocument,
        isViewingDocument,
        selectedNote,
      })}
    </>
  );
});

SOAPDocumentViewerWrapper.displayName = "SOAPDocumentViewerWrapper";

/**
 * Alternative: Simple hook-based approach
 * For components that prefer to manage the document viewer directly
 */
export function useSOAPDocumentViewerComponent(props: {
  showBackButton?: boolean;
  backButtonOverlay?: boolean;
  className?: string;
} = {}) {
  const viewerState = useSOAPDocumentViewer();
  
  const DocumentViewerComponent = React.useMemo(() => {
    if (!viewerState.isViewingDocument || !viewerState.selectedNote) {
      return null;
    }
    
    return (
      <SOAPNoteDocumentViewer
        note={viewerState.selectedNote}
        onBack={viewerState.closeDocument}
        showBackButton={props.showBackButton}
        backButtonOverlay={props.backButtonOverlay}
        className={props.className}
      />
    );
  }, [
    viewerState.isViewingDocument,
    viewerState.selectedNote,
    viewerState.closeDocument,
    props.showBackButton,
    props.className,
  ]);

  return {
    ...viewerState,
    DocumentViewerComponent,
  };
}
