"use client";

import { useMemo, useCallback, useState } from "react";
import { SOAPNote, SharedSOAPNote, SOAPStats, UseSOAPStatsReturn, SOAPUtils } from "../types";

/**
 * Custom hook for calculating and managing SOAP notes statistics
 * Optimized with memoization for expensive calculations
 */
export function useSOAPStats(
  notes: SOAPNote[] = [],
  sharedNotes: SharedSOAPNote[] = []
): UseSOAPStatsReturn {
  // Enhanced memoized stats calculation
  const stats = useMemo((): SOAPStats => {
    const totalNotes = notes.length;
    const sharedCount = sharedNotes.length;

    // Calculate average quality score using enhanced data structure
    const notesWithQuality = notes.filter(note => {
      const qualityScore = SOAPUtils.getQualityScore(note);
      return qualityScore !== undefined && qualityScore !== null;
    });

    const avgQuality = notesWithQuality.length > 0
      ? Math.round(
          notesWithQuality.reduce((acc, note) => {
            const qualityScore = SOAPUtils.getQualityScore(note);
            return acc + (qualityScore || 0);
          }, 0) / notesWithQuality.length
        )
      : 0;

    // Calculate recent notes (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentNotes = notes.filter(note => note.createdAt > sevenDaysAgo).length;

    // Enhanced metrics calculations
    const enhancedNotesCount = notes.filter(note => SOAPUtils.hasEnhancedData(note)).length;

    const safeNotesCount = notes.filter(note => SOAPUtils.getSafetyStatus(note) === true).length;
    const unsafeNotesCount = notes.filter(note => SOAPUtils.getSafetyStatus(note) === false).length;

    const redFlagsCount = notes.filter(note => SOAPUtils.getRedFlags(note).length > 0).length;

    // Specialty breakdown
    const specialtyBreakdown: Record<string, number> = {};
    notes.forEach(note => {
      const specialty = SOAPUtils.getSpecialty(note);
      if (specialty) {
        specialtyBreakdown[specialty] = (specialtyBreakdown[specialty] || 0) + 1;
      }
    });

    // Quality distribution
    const qualityDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };

    notes.forEach(note => {
      const qualityScore = SOAPUtils.getQualityScore(note);
      if (qualityScore !== undefined) {
        if (qualityScore >= 90) qualityDistribution.excellent++;
        else if (qualityScore >= 75) qualityDistribution.good++;
        else if (qualityScore >= 60) qualityDistribution.fair++;
        else qualityDistribution.poor++;
      } else {
        qualityDistribution.poor++;
      }
    });

    // Average transcription confidence
    const notesWithTranscription = notes.filter(note => note.data?.transcription?.confidence);
    const avgTranscriptionConfidence = notesWithTranscription.length > 0
      ? Math.round(
          notesWithTranscription.reduce((acc, note) =>
            acc + (note.data?.transcription?.confidence || 0), 0
          ) / notesWithTranscription.length * 100
        )
      : 0;

    // Average processing time (in seconds)
    const notesWithProcessingTime = notes.filter(note => {
      const processingTime = SOAPUtils.getProcessingTime(note);
      return processingTime && processingTime.includes('seconds');
    });

    const avgProcessingTime = notesWithProcessingTime.length > 0
      ? Math.round(
          notesWithProcessingTime.reduce((acc, note) => {
            const processingTime = SOAPUtils.getProcessingTime(note);
            const seconds = processingTime ? parseFloat(processingTime.replace(' seconds', '')) : 0;
            return acc + seconds;
          }, 0) / notesWithProcessingTime.length
        )
      : 0;

    return {
      totalNotes,
      sharedCount,
      avgQuality,
      recentNotes,
      enhancedNotesCount,
      safeNotesCount,
      unsafeNotesCount,
      redFlagsCount,
      specialtyBreakdown,
      qualityDistribution,
      avgTranscriptionConfidence,
      avgProcessingTime,
    };
  }, [notes, sharedNotes]);

  // Refresh stats function (placeholder)
  const refreshStats = useCallback(() => {
    // Stats will be recalculated automatically due to memoization
  }, []);

  const loading = false; // Since we're calculating from existing data
  const error = null; // Simplified - no error state to prevent re-renders

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}

/**
 * Utility function to get quality level from score or note
 */
export function getQualityLevel(score?: number, note?: SOAPNote): "excellent" | "good" | "fair" | "poor" {
  const qualityScore = score ?? (note ? SOAPUtils.getQualityScore(note) : undefined);

  if (!qualityScore) return "poor";
  if (qualityScore >= 90) return "excellent";
  if (qualityScore >= 75) return "good";
  if (qualityScore >= 60) return "fair";
  return "poor";
}

/**
 * Utility function to get quality color classes with enhanced data support
 */
export function getQualityColor(score?: number, note?: SOAPNote): string {
  const level = getQualityLevel(score, note);

  const colorMap = {
    excellent: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
    good: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
    fair: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
    poor: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
  };

  return colorMap[level];
}
