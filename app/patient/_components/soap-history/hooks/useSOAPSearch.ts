"use client";

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SOAPNote, UseSOAPSearchReturn, SOAPUtils } from "../types";

/**
 * Custom hook for SOAP notes search functionality with debouncing
 * Optimized for performance with proper memoization
 */
export function useSOAPSearch(
  notes: SOAPNote[] = [],
  debounceMs: number = 300
): UseSOAPSearchReturn {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Enhanced search function for better performance with new data structure
  const searchNotes = useCallback((notes: SOAPNote[], term: string): SOAPNote[] => {
    if (!term.trim()) return notes;

    const searchTermLower = term.toLowerCase().trim();

    return notes.filter(note => {
      // Extract data using utility functions for consistent access
      const subjective = SOAPUtils.getSubjective(note);
      const objective = SOAPUtils.getObjective(note);
      const assessment = SOAPUtils.getAssessment(note);
      const plan = SOAPUtils.getPlan(note);
      const recommendations = SOAPUtils.getRecommendations(note);
      const specialty = SOAPUtils.getSpecialty(note);
      const chiefComplaint = SOAPUtils.getChiefComplaint(note);
      const primaryDiagnosis = SOAPUtils.getPrimaryDiagnosis(note);
      const medications = SOAPUtils.getMedications(note);
      const allergies = SOAPUtils.getAllergies(note);

      // Create comprehensive searchable content including enhanced fields
      const searchableContent = [
        subjective,
        objective,
        assessment,
        plan,
        ...recommendations,
        specialty,
        chiefComplaint,
        primaryDiagnosis,
        ...medications,
        ...allergies,
        // Also search in structured data if available
        note.data?.soap_notes?.soap_notes?.subjective?.history_present_illness,
        note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.clinical_reasoning,
        ...(note.data?.soap_notes?.soap_notes?.plan?.patient_education || []),
        ...(note.data?.quality_metrics?.red_flags || []),
        ...(note.data?.safety_check?.red_flags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      // Support multiple search terms (AND logic)
      const searchTerms = searchTermLower.split(' ').filter(t => t.length > 0);

      return searchTerms.every(term =>
        searchableContent.includes(term)
      );
    });
  }, []);

  // Memoized filtered notes
  const filteredNotes = useMemo(() => 
    searchNotes(notes, debouncedSearchTerm),
    [notes, debouncedSearchTerm, searchNotes]
  );

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Search count for display
  const searchCount = filteredNotes.length;

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    filteredNotes,
    searchCount,
  };
}
