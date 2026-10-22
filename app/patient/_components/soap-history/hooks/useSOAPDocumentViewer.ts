"use client";

import { useState, useCallback } from "react";
import { SOAPNote } from "../types";

export interface UseSOAPDocumentViewerReturn {
  // State
  selectedNote: SOAPNote | null;
  isViewingDocument: boolean;
  
  // Actions
  openDocument: (note: SOAPNote) => void;
  closeDocument: () => void;
  setViewingDocument: (viewing: boolean) => void;
}

/**
 * Custom hook for managing SOAP Document Viewer state
 * Provides clean interface for showing/hiding document view
 */
export function useSOAPDocumentViewer(): UseSOAPDocumentViewerReturn {
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState(false);

  // Open document viewer with specific note
  const openDocument = useCallback((note: SOAPNote) => {
    setSelectedNote(note);
    setIsViewingDocument(true);
  }, []);

  // Close document viewer and clear selected note
  const closeDocument = useCallback(() => {
    setIsViewingDocument(false);
    setSelectedNote(null);
  }, []);

  // Set viewing state directly (for controlled usage)
  const setViewingDocument = useCallback((viewing: boolean) => {
    if (viewing) {
      setIsViewingDocument(true);
    } else {
      closeDocument();
    }
  }, [closeDocument]);

  return {
    selectedNote,
    isViewingDocument,
    openDocument,
    closeDocument,
    setViewingDocument,
  };
}
