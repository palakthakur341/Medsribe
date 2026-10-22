import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { 
  UseReferralsDataReturn, 
  Referral, 
  ReferralsFilters,
  Doctor 
} from "../types";

/**
 * Custom hook for managing referrals data and filtering
 * 
 * Features:
 * - Fetches received and sent referrals for a doctor
 * - Provides comprehensive filtering functionality
 * - Handles search across multiple fields
 * - Manages filter state
 * - Optimized with proper memoization
 * 
 * @param doctorProfile - The doctor's profile data
 * @returns {UseReferralsDataReturn} Referrals data and filtering utilities
 */
export function useReferralsData(
  doctorProfile: Doctor | null | undefined
): UseReferralsDataReturn {
  // Filter state
  const [filters, setFilters] = useState<ReferralsFilters>({
    searchTerm: "",
    statusFilter: "all",
  });

  // Fetch received referrals
  const receivedReferrals = useQuery(
    api.referrals.getReceivedReferrals,
    doctorProfile ? { toDoctorId: doctorProfile._id } : "skip"
  );

  // Fetch sent referrals
  const sentReferrals = useQuery(
    api.referrals.getSentReferrals,
    doctorProfile ? { fromDoctorId: doctorProfile._id } : "skip"
  );

  // Filter received referrals
  const filteredReceivedReferrals = useMemo((): Referral[] => {
    if (!receivedReferrals) return [];

    return receivedReferrals.filter(referral => {
      // Search filter - comprehensive search across multiple fields
      const matchesSearch = !filters.searchTerm ||
        referral.patient?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.patient?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.fromDoctor?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.fromDoctor?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.reasonForReferral.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.clinicalQuestion?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filters.statusFilter === "all" || referral.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receivedReferrals, filters]);

  // Filter sent referrals
  const filteredSentReferrals = useMemo((): Referral[] => {
    if (!sentReferrals) return [];

    return sentReferrals.filter(referral => {
      // Search filter - comprehensive search across multiple fields
      const matchesSearch = !filters.searchTerm ||
        referral.patient?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.patient?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.toDoctor?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.toDoctor?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.reasonForReferral.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.clinicalQuestion?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        referral.specialtyRequired?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filters.statusFilter === "all" || referral.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sentReferrals, filters]);

  // Filter update functions
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
    });
  }, []);

  return {
    receivedReferrals,
    sentReferrals,
    filteredReceivedReferrals,
    filteredSentReferrals,
    isLoading: receivedReferrals === undefined || sentReferrals === undefined,
    error: null, // Convex queries don't expose errors in the same way
    filters,
    setSearchTerm,
    setStatusFilter,
    clearAllFilters,
  };
}
