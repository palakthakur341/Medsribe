"use client";

import { useState, useMemo, useCallback } from "react";
import { SOAPNote, SearchFilters, UseSOAPFiltersReturn, SOAPUtils } from "../types";

/**
 * Custom hook for managing SOAP notes filtering and sorting
 * Provides advanced filtering capabilities with memoized results
 */
export function useSOAPFilters(
  notes: SOAPNote[] = []
): UseSOAPFiltersReturn {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Update a specific filter
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  }, []);

  // Check if any filters are active (enhanced)
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.dateRange ||
      filters.qualityRange ||
      filters.sharedOnly ||
      filters.specialty?.length ||
      filters.safetyStatus !== "all" ||
      filters.hasEnhancedData !== undefined ||
      filters.qualityLevel?.length ||
      filters.hasRedFlags !== undefined ||
      filters.transcriptionConfidence
    );
  }, [filters]);

  // Apply filters and sorting
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Apply enhanced search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      result = result.filter(note => {
        // Use enhanced search with SOAPUtils
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
        const searchTerms = searchTerm.split(' ').filter(t => t.length > 0);
        return searchTerms.every(term => searchableContent.includes(term));
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      result = result.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= from && noteDate <= to;
      });
    }

    // Apply enhanced quality range filter
    if (filters.qualityRange) {
      const { min, max } = filters.qualityRange;
      result = result.filter(note => {
        const quality = SOAPUtils.getQualityScore(note) || 0;
        return quality >= min && quality <= max;
      });
    }

    // Apply specialty filter
    if (filters.specialty && filters.specialty.length > 0) {
      result = result.filter(note => {
        const noteSpecialty = SOAPUtils.getSpecialty(note);
        return noteSpecialty && filters.specialty!.includes(noteSpecialty);
      });
    }

    // Apply safety status filter
    if (filters.safetyStatus && filters.safetyStatus !== "all") {
      result = result.filter(note => {
        const safetyStatus = SOAPUtils.getSafetyStatus(note);
        if (filters.safetyStatus === "safe") {
          return safetyStatus === true;
        } else if (filters.safetyStatus === "unsafe") {
          return safetyStatus === false;
        }
        return true;
      });
    }

    // Apply enhanced data filter
    if (filters.hasEnhancedData !== undefined) {
      result = result.filter(note => {
        return SOAPUtils.hasEnhancedData(note) === filters.hasEnhancedData;
      });
    }

    // Apply quality level filter
    if (filters.qualityLevel && filters.qualityLevel.length > 0) {
      result = result.filter(note => {
        const qualityScore = SOAPUtils.getQualityScore(note);
        if (!qualityScore) return filters.qualityLevel!.includes("poor");

        let level: "excellent" | "good" | "fair" | "poor";
        if (qualityScore >= 90) level = "excellent";
        else if (qualityScore >= 75) level = "good";
        else if (qualityScore >= 60) level = "fair";
        else level = "poor";

        return filters.qualityLevel!.includes(level);
      });
    }

    // Apply red flags filter
    if (filters.hasRedFlags !== undefined) {
      result = result.filter(note => {
        const redFlags = SOAPUtils.getRedFlags(note);
        return filters.hasRedFlags ? redFlags.length > 0 : redFlags.length === 0;
      });
    }

    // Apply transcription confidence filter
    if (filters.transcriptionConfidence) {
      const { min, max } = filters.transcriptionConfidence;
      result = result.filter(note => {
        const confidence = note.data?.transcription?.confidence;
        if (!confidence) return false;
        const confidencePercent = confidence * 100;
        return confidencePercent >= min && confidencePercent <= max;
      });
    }

    // Apply shared only filter
    if (filters.sharedOnly) {
      // This would need to be implemented with shared notes data
      // For now, we'll skip this filter
    }

    // Apply enhanced sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "date":
          comparison = a.createdAt - b.createdAt;
          break;
        case "quality":
          const qualityA = SOAPUtils.getQualityScore(a) || 0;
          const qualityB = SOAPUtils.getQualityScore(b) || 0;
          comparison = qualityA - qualityB;
          break;
        case "specialty":
          const specialtyA = SOAPUtils.getSpecialty(a) || "";
          const specialtyB = SOAPUtils.getSpecialty(b) || "";
          comparison = specialtyA.localeCompare(specialtyB);
          break;
        case "safety":
          const safetyA = SOAPUtils.getSafetyStatus(a);
          const safetyB = SOAPUtils.getSafetyStatus(b);
          // Safe notes first, then unsafe, then unknown
          if (safetyA === safetyB) comparison = 0;
          else if (safetyA === true && safetyB !== true) comparison = -1;
          else if (safetyA !== true && safetyB === true) comparison = 1;
          else if (safetyA === false && safetyB === undefined) comparison = -1;
          else if (safetyA === undefined && safetyB === false) comparison = 1;
          else comparison = 0;
          break;
        case "shared":
          // This would need shared notes data
          comparison = 0;
          break;
        case "alphabetical":
          const subjectiveA = SOAPUtils.getSubjective(a);
          const subjectiveB = SOAPUtils.getSubjective(b);
          comparison = subjectiveA.localeCompare(subjectiveB);
          break;
        default:
          comparison = a.createdAt - b.createdAt;
      }

      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [notes, filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredNotes,
    hasActiveFilters,
  };
}
