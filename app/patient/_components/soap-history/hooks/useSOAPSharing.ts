"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseSOAPSharingReturn } from "../types";

/**
 * Custom hook for managing SOAP note sharing functionality
 * Handles dialog state, sharing process, and success/error states
 */
export function useSOAPSharing(): UseSOAPSharingReturn {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSoapNoteId, setSelectedSoapNoteId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const { toast } = useToast();

  // Open share dialog for a specific note
  const openShareDialog = useCallback((soapNoteId: string) => {
    setSelectedSoapNoteId(soapNoteId);
    setShareDialogOpen(true);
    setShareError(null);
  }, []);

  // Close share dialog and reset state
  const closeShareDialog = useCallback(() => {
    setShareDialogOpen(false);
    setSelectedSoapNoteId(null);
    setShareError(null);
    setIsSharing(false);
  }, []);

  // Handle successful sharing
  const handleShareSuccess = useCallback(() => {
    toast({
      title: "SOAP Note Shared Successfully",
      description: "The SOAP note has been shared with the selected doctor.",
      variant: "default",
    });
    
    closeShareDialog();
  }, [toast, closeShareDialog]);

  // Handle sharing error
  const handleShareError = useCallback((error: string) => {
    setShareError(error);
    setIsSharing(false);
    
    toast({
      title: "Failed to Share SOAP Note",
      description: error || "An unexpected error occurred while sharing the note.",
      variant: "destructive",
    });
  }, [toast]);

  return {
    shareDialogOpen,
    selectedSoapNoteId,
    isSharing,
    shareError,
    openShareDialog,
    closeShareDialog,
    handleShareSuccess,
    handleShareError,
  };
}
