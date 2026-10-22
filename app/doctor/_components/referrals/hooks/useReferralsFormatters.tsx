import React, { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { UseReferralsFormattersReturn } from "../types";

/**
 * Custom hook for referrals formatting utilities
 * 
 * Features:
 * - Date formatting for consistent display
 * - Urgency badge generation with appropriate styling
 * - Status badge generation with color coding
 * - Memoized functions for performance
 * 
 * @returns {UseReferralsFormattersReturn} Formatting utilities
 */
export function useReferralsFormatters(): UseReferralsFormattersReturn {
  /**
   * Format timestamp to readable date string
   */
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  /**
   * Generate urgency badge with appropriate styling and icons
   */
  const getUrgencyBadge = useCallback((urgency: string) => {
    switch (urgency) {
      case "urgent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Urgent
          </Badge>
        );
      case "stat":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            STAT
          </Badge>
        );
      case "routine":
        return <Badge variant="secondary">Routine</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  }, []);

  /**
   * Generate status badge with appropriate color coding
   */
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-blue-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  return {
    formatDate,
    getUrgencyBadge,
    getStatusBadge,
  };
}
