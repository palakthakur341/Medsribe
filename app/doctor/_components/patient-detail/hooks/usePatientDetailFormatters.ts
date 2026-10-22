import { useCallback } from "react";

/**
 * Custom hook for patient detail formatting utilities
 * 
 * Features:
 * - Age calculation from date of birth
 * - Patient name formatting
 * - Date formatting utilities
 * - Status badge variants
 * 
 * @returns Formatting utility functions
 */
export function usePatientDetailFormatters() {
  // Calculate age from date of birth
  const calculateAge = useCallback((dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, []);

  // Format patient full name
  const formatPatientName = useCallback((patient: { firstName: string; lastName: string }): string => {
    return `${patient.firstName} ${patient.lastName}`;
  }, []);

  // Format date for display
  const formatDate = useCallback((timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options
    });
  }, []);

  // Format date for compact display
  const formatCompactDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Get status badge variant
  const getStatusBadgeVariant = useCallback((status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "discontinued":
        return "destructive";
      default:
        return "outline";
    }
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  }, []);

  // Format address
  const formatAddress = useCallback((address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }): string => {
    if (!address) return "";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }, []);

  // Get initials from name
  const getInitials = useCallback((firstName: string, lastName: string): string => {
    return `${firstName[0]?.toUpperCase() || ''}${lastName[0]?.toUpperCase() || ''}`;
  }, []);

  return {
    calculateAge,
    formatPatientName,
    formatDate,
    formatCompactDate,
    getStatusBadgeVariant,
    formatPhoneNumber,
    formatAddress,
    getInitials,
  };
}
