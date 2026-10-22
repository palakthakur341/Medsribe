import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SOAPUtils } from "@/app/patient/_components/soap-history/types";
import type {
  UseSharedSOAPNotesReturn,
  SharedSOAPNote,
  SharedSOAPFilters,
  Doctor
} from "../types";

/**
 * Custom hook for managing shared SOAP notes data and filtering
 * 
 * Features:
 * - Fetches shared SOAP notes for a doctor
 * - Provides comprehensive filtering functionality
 * - Handles search across multiple fields
 * - Manages filter state
 * - Optimized with proper memoization
 * 
 * @param doctorProfile - The doctor's profile data
 * @returns {UseSharedSOAPNotesReturn} Notes data and filtering utilities
 */
export function useSharedSOAPNotes(
  doctorProfile: Doctor | null | undefined
): UseSharedSOAPNotesReturn {
  // Filter state
  const [filters, setFilters] = useState<SharedSOAPFilters>({
    searchTerm: "",
    filterUnread: false,
    filterShareType: "all",
    filterDateRange: "all",
  });

  // Fetch shared SOAP notes
  const sharedSOAPNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesForDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Enhanced filtering logic
  const filteredNotes = useMemo((): SharedSOAPNote[] => {
    if (!sharedSOAPNotes) return [];

    return sharedSOAPNotes.filter(note => {
      // Enhanced search filter using SOAPUtils for comprehensive search
      const matchesSearch = !filters.searchTerm || (() => {
        const searchTerm = filters.searchTerm.toLowerCase();

        // Search patient information
        const patientMatch =
          note.patient?.firstName.toLowerCase().includes(searchTerm) ||
          note.patient?.lastName.toLowerCase().includes(searchTerm) ||
          note.patient?.mrn?.toLowerCase().includes(searchTerm);

        if (patientMatch) return true;

        // Search SOAP content using enhanced data structure
        if (note.soapNote) {
          const subjective = SOAPUtils.getSubjective(note.soapNote);
          const objective = SOAPUtils.getObjective(note.soapNote);
          const assessment = SOAPUtils.getAssessment(note.soapNote);
          const plan = SOAPUtils.getPlan(note.soapNote);
          const specialty = SOAPUtils.getSpecialty(note.soapNote);
          const chiefComplaint = SOAPUtils.getChiefComplaint(note.soapNote);
          const primaryDiagnosis = SOAPUtils.getPrimaryDiagnosis(note.soapNote);
          const medications = SOAPUtils.getMedications(note.soapNote);

          const soapContent = [
            subjective,
            objective,
            assessment,
            plan,
            specialty,
            chiefComplaint,
            primaryDiagnosis,
            ...medications,
            // Also search in structured data if available
            note.soapNote.data?.soap_notes?.soap_notes?.subjective?.history_present_illness,
            note.soapNote.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.clinical_reasoning,
            ...(note.soapNote.data?.soap_notes?.soap_notes?.plan?.patient_education || []),
            ...(note.soapNote.data?.quality_metrics?.red_flags || []),
            ...(note.soapNote.data?.safety_check?.red_flags || [])
          ].filter(Boolean).join(' ').toLowerCase();

          return soapContent.includes(searchTerm);
        }

        return false;
      })();

      // Read status filter
      const matchesReadFilter = !filters.filterUnread || !note.isRead;

      // Share type filter
      const matchesShareType = filters.filterShareType === "all" || 
        note.shareType === filters.filterShareType;

      // Date range filter
      const matchesDateRange = (() => {
        if (filters.filterDateRange === "all") return true;
        const now = Date.now();
        const noteDate = note.createdAt;

        switch (filters.filterDateRange) {
          case "today":
            return now - noteDate < 24 * 60 * 60 * 1000;
          case "week":
            return now - noteDate < 7 * 24 * 60 * 60 * 1000;
          case "month":
            return now - noteDate < 30 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesReadFilter && matchesShareType && matchesDateRange;
    });
  }, [sharedSOAPNotes, filters]);

  // Filter update functions
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setFilterUnread = useCallback((unread: boolean) => {
    setFilters(prev => ({ ...prev, filterUnread: unread }));
  }, []);

  const setFilterShareType = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, filterShareType: type }));
  }, []);

  const setFilterDateRange = useCallback((range: string) => {
    setFilters(prev => ({ ...prev, filterDateRange: range }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      filterUnread: false,
      filterShareType: "all",
      filterDateRange: "all",
    });
  }, []);

  return {
    sharedSOAPNotes,
    filteredNotes,
    isLoading: sharedSOAPNotes === undefined,
    error: null, // Convex queries don't expose errors in the same way
    filters,
    setSearchTerm,
    setFilterUnread,
    setFilterShareType,
    setFilterDateRange,
    clearAllFilters,
  };
}
