"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSOAPSearch } from "./useSOAPSearch";
import { useSOAPStats } from "./useSOAPStats";
import { useSOAPSharing } from "./useSOAPSharing";
import { SOAPNote, SharedSOAPNote, UseSOAPHistoryReturn, SOAPUtils } from "../types";

/**
 * Main SOAP History hook that orchestrates all SOAP-related functionality
 * Optimized with proper memoization and separated concerns
 */
export function useSOAPHistory(patientId: string): UseSOAPHistoryReturn {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // Data fetching - only if patientId is provided
  const soapNotes = useQuery(
    api.soapNotes.getByPatientId,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );
  
  const sharedNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );
  
  const referrals = useQuery(
    api.referrals.getByPatient,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );
  
  const patientProfile = useQuery(
    api.patients.getPatientById,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Memoize arrays to prevent infinite re-renders
  const memoizedSoapNotes = useMemo(() => soapNotes || [], [soapNotes]);
  const memoizedSharedNotes = useMemo(() => sharedNotes || [], [sharedNotes]);

  // Use specialized hooks
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredNotes,
    searchCount,
  } = useSOAPSearch(memoizedSoapNotes);

  const { stats } = useSOAPStats(filteredNotes, memoizedSharedNotes);

  const {
    shareDialogOpen,
    selectedSoapNoteId,
    openShareDialog,
    closeShareDialog,
    handleShareSuccess: onShareSuccess,
  } = useSOAPSharing();

  // Create shared notes map for efficient lookups
  const sharedNotesMap = useMemo(() => {
    const map = new Map<string, SharedSOAPNote[]>();
    memoizedSharedNotes.forEach(shared => {
      const noteId = shared.soapNoteId;
      if (!map.has(noteId)) {
        map.set(noteId, []);
      }
      map.get(noteId)!.push(shared);
    });
    return map;
  }, [memoizedSharedNotes]);

  // Loading state
  const loading = useMemo(() => {
    return soapNotes === undefined || 
           sharedNotes === undefined || 
           referrals === undefined || 
           (patientId && patientProfile === undefined);
  }, [soapNotes, sharedNotes, referrals, patientProfile, patientId]);

  // Error state (simplified for now)
  const error = null;

  // Utility functions (defined first to avoid circular dependencies)
  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getQualityColor = useCallback((score?: number, note?: SOAPNote): string => {
    // Use provided score or extract from note
    const qualityScore = score ?? (note ? SOAPUtils.getQualityScore(note) : undefined);

    if (!qualityScore) return "text-gray-500 bg-gray-50 border-gray-200";
    if (qualityScore >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (qualityScore >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (qualityScore >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  }, []);

  // Event handlers
  const handleShareNote = useCallback((soapNoteId: string) => {
    openShareDialog(soapNoteId);
  }, [openShareDialog]);

  const handleShareSuccess = useCallback(() => {
    onShareSuccess();
  }, [onShareSuccess]);

  const handleDownloadNote = useCallback((note: SOAPNote) => {
    try {
      // Extract data using utility functions
      const subjective = SOAPUtils.getSubjective(note);
      const objective = SOAPUtils.getObjective(note);
      const assessment = SOAPUtils.getAssessment(note);
      const plan = SOAPUtils.getPlan(note);
      const qualityScore = SOAPUtils.getQualityScore(note);
      const specialty = SOAPUtils.getSpecialty(note);
      const recommendations = SOAPUtils.getRecommendations(note);
      const safetyStatus = SOAPUtils.getSafetyStatus(note);
      const redFlags = SOAPUtils.getRedFlags(note);
      const sessionId = SOAPUtils.getSessionId(note);

      // Create enhanced downloadable content
      const content = `
SOAP Clinical Note
Generated: ${formatDate(note.createdAt)}
${sessionId ? `Session ID: ${sessionId}` : ''}
${specialty ? `Specialty: ${specialty}` : ''}
Quality Score: ${qualityScore || 'N/A'}${typeof qualityScore === 'number' ? '%' : ''}
${safetyStatus !== undefined ? `Safety Status: ${safetyStatus ? 'Safe' : 'Requires Attention'}` : ''}

SUBJECTIVE:
${subjective}

OBJECTIVE:
${objective}

ASSESSMENT:
${assessment}

PLAN:
${plan}

${recommendations?.length ? `RECOMMENDATIONS:\n${recommendations.join('\n')}` : ''}

${redFlags?.length ? `RED FLAGS:\n${redFlags.join('\n')}` : ''}

${SOAPUtils.hasEnhancedData(note) ? '\n--- ENHANCED DATA AVAILABLE ---\nThis note contains structured medical data for advanced analysis.' : ''}
      `.trim();

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soap-note-${formatDate(note.createdAt).replace(/[/,\s:]/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download note:', error);
    }
  }, [formatDate]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  const setShareDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      closeShareDialog();
    }
  }, [closeShareDialog]);

  return {
    // Data
    soapNotes,
    sharedNotes,
    referrals,
    patientProfile,
    filteredNotes,
    sharedNotesMap,
    stats,
    
    // State
    searchTerm,
    selectedNote,
    selectedSoapNoteId,
    shareDialogOpen,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    setSelectedNote,
    setShareDialogOpen,
    handleShareNote,
    handleShareSuccess,
    handleDownloadNote,
    handleClearSearch,
    
    // Utils
    formatDate,
    getQualityColor,
  };
}
