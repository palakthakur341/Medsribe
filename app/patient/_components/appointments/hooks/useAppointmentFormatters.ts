"use client";

import { useMemo } from "react";
import { UseAppointmentFormattersReturn, AppointmentType, AppointmentStatus, StatusVariant } from "../types";

/**
 * Custom hook for appointment formatting utilities
 * 
 * Features:
 * - Date and time formatting functions
 * - Relative date formatting (Today, Tomorrow, etc.)
 * - Appointment type label mapping
 * - Status label and variant mapping
 * - Duration formatting
 * - Memoized for performance
 * 
 * @returns {UseAppointmentFormattersReturn} Formatting utilities
 */
export function useAppointmentFormatters(): UseAppointmentFormattersReturn {
  // Memoized formatting functions for performance
  const formatters = useMemo(() => {
    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const formatTime = (timestamp: number): string => {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const formatDateTime = (timestamp: number): string => {
      const date = new Date(timestamp);
      return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
    };

    const formatRelativeDate = (timestamp: number): string => {
      const date = new Date(timestamp);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset time for comparison
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

      if (dateOnly.getTime() === todayOnly.getTime()) {
        return "Today";
      } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
        return "Tomorrow";
      } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return "Yesterday";
      } else {
        return formatDate(timestamp);
      }
    };

    const getAppointmentTypeLabel = (type: AppointmentType): string => {
      const typeMap: Record<AppointmentType, string> = {
        'new_patient': 'New Patient',
        'follow_up': 'Follow-up',
        'consultation': 'Consultation',
        'procedure': 'Procedure',
        'telemedicine': 'Telemedicine',
        'emergency': 'Emergency'
      };
      return typeMap[type] || type;
    };

    const getStatusLabel = (status: AppointmentStatus): string => {
      const statusMap: Record<AppointmentStatus, string> = {
        'scheduled': 'Scheduled',
        'confirmed': 'Confirmed',
        'checked_in': 'Checked In',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'no_show': 'No Show'
      };
      return statusMap[status] || status;
    };

    const getStatusVariant = (status: AppointmentStatus): StatusVariant => {
      switch (status) {
        case 'completed':
          return 'success';
        case 'cancelled':
        case 'no_show':
          return 'error';
        case 'in_progress':
          return 'warning';
        default:
          return 'pending';
      }
    };

    const getDurationLabel = (duration: number): string => {
      if (duration < 60) {
        return `${duration}min`;
      } else {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        if (minutes === 0) {
          return `${hours}h`;
        } else {
          return `${hours}h ${minutes}min`;
        }
      }
    };

    return {
      formatDate,
      formatTime,
      formatDateTime,
      formatRelativeDate,
      getAppointmentTypeLabel,
      getStatusLabel,
      getStatusVariant,
      getDurationLabel,
    };
  }, []);

  return formatters;
}
