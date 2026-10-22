"use client";

import { useState, useCallback } from "react";
import { SOAPNote } from "../types";

export interface UseSOAPNoteDialogReturn {
  // State
  selectedNote: SOAPNote | null;
  isOpen: boolean;
  
  // Actions
  openDialog: (note: SOAPNote) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing SOAP Note Dialog state
 * Provides clean interface for opening/closing dialog with note data
 */
export function useSOAPNoteDialog(): UseSOAPNoteDialogReturn {
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Open dialog with specific note
  const openDialog = useCallback((note: SOAPNote) => {
    setSelectedNote(note);
    setIsOpen(true);
  }, []);

  // Close dialog and clear selected note
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the note to allow for exit animation
    setTimeout(() => {
      setSelectedNote(null);
    }, 150);
  }, []);

  // Set open state directly (for controlled usage)
  const setOpen = useCallback((open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      closeDialog();
    }
  }, [closeDialog]);

  return {
    selectedNote,
    isOpen,
    openDialog,
    closeDialog,
    setOpen,
  };
}
