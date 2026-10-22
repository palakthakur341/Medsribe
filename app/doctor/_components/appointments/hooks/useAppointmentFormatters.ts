import { useMemo } from "react";
import * as React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import type { UseAppointmentFormattersReturn, AppointmentStatus } from "../types";

/**
 * Custom hook for appointment formatting utilities
 * 
 * Features:
 * - Date and time formatting
 * - Status color and icon mapping
 * - Relative time calculations
 * - Consistent formatting across components
 * 
 * @returns {UseAppointmentFormattersReturn} Formatting utilities
 */
export function useAppointmentFormatters(): UseAppointmentFormattersReturn {
  // Memoized formatters to prevent unnecessary re-renders
  const formatters = useMemo(() => ({
    formatTime: (dateTime: number): string => {
      return new Date(dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    formatDate: (dateTime: number): string => {
      return new Date(dateTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    formatDateTime: (dateTime: number): string => {
      const date = new Date(dateTime);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    getStatusColor: (status: AppointmentStatus): string => {
      switch (status) {
        case "scheduled":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "confirmed":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        case "in_progress":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "completed":
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        case "cancelled":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      }
    },

    getStatusIcon: (status: AppointmentStatus): React.ReactNode => {
      switch (status) {
        case "scheduled":
          return React.createElement(Clock, { className: "h-3 w-3" });
        case "confirmed":
          return React.createElement(CheckCircle, { className: "h-3 w-3" });
        case "in_progress":
          return React.createElement(PlayCircle, { className: "h-3 w-3" });
        case "completed":
          return React.createElement(CheckCircle, { className: "h-3 w-3" });
        case "cancelled":
          return React.createElement(XCircle, { className: "h-3 w-3" });
        default:
          return React.createElement(AlertCircle, { className: "h-3 w-3" });
      }
    },

    getRelativeTime: (dateTime: number): string => {
      const now = new Date();
      const appointmentDate = new Date(dateTime);
      const diffInMinutes = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 0) {
        const absDiff = Math.abs(diffInMinutes);
        if (absDiff < 60) {
          return `${absDiff} minutes ago`;
        } else if (absDiff < 1440) { // 24 hours
          return `${Math.floor(absDiff / 60)} hours ago`;
        } else {
          return `${Math.floor(absDiff / 1440)} days ago`;
        }
      } else {
        if (diffInMinutes < 60) {
          return `in ${diffInMinutes} minutes`;
        } else if (diffInMinutes < 1440) { // 24 hours
          return `in ${Math.floor(diffInMinutes / 60)} hours`;
        } else {
          return `in ${Math.floor(diffInMinutes / 1440)} days`;
        }
      }
    }
  }), []);

  return formatters;
}
