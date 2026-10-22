import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { 
  UseDoctorAppointmentsReturn, 
  Appointment, 
  CategorizedAppointments, 
  AppointmentStats,
  AppointmentCategory,
  Doctor
} from "../types";

/**
 * Custom hook for managing doctor appointments data
 * 
 * Features:
 * - Fetches appointments for a specific doctor
 * - Categorizes appointments by time periods
 * - Provides filtering and search functionality
 * - Calculates appointment statistics
 * - Handles loading and error states
 * 
 * @param doctorProfile - The doctor's profile data
 * @returns {UseDoctorAppointmentsReturn} Appointments data and utilities
 */
export function useDoctorAppointments(
  doctorProfile: Doctor | null | undefined
): UseDoctorAppointmentsReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppointmentCategory>("all");

  // Fetch appointments
  const appointments = useQuery(
    api.appointments.getByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  ) as any; // Using any to handle complex type matching with API response

  // Categorize appointments by time periods
  const categorizedAppointments = useMemo((): CategorizedAppointments => {
    if (!appointments) {
      return {
        today: [],
        tomorrow: [],
        thisWeek: [],
        upcoming: [],
        past: []
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return {
      today: appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDateTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      }),
      tomorrow: appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDateTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === tomorrow.getTime();
      }),
      thisWeek: appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate > tomorrow && aptDate <= weekFromNow;
      }),
      upcoming: appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate > weekFromNow;
      }),
      past: appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate < today;
      })
    };
  }, [appointments]);

  // Filter appointments based on search and category
  const filteredAppointments = useMemo((): Appointment[] => {
    let filtered: Appointment[] = [];

    // Select appointments by category
    switch (selectedCategory) {
      case "today":
        filtered = categorizedAppointments.today;
        break;
      case "tomorrow":
        filtered = categorizedAppointments.tomorrow;
        break;
      case "thisWeek":
        filtered = categorizedAppointments.thisWeek;
        break;
      case "upcoming":
        filtered = categorizedAppointments.upcoming;
        break;
      case "past":
        filtered = categorizedAppointments.past;
        break;
      default:
        filtered = appointments || [];
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patient?.firstName?.toLowerCase().includes(searchLower) ||
        apt.patient?.lastName?.toLowerCase().includes(searchLower) ||
        apt.visitReason?.toLowerCase().includes(searchLower) ||
        apt.appointmentType?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [appointments, categorizedAppointments, selectedCategory, searchTerm]);

  // Calculate statistics
  const stats = useMemo((): AppointmentStats => {
    if (!appointments) {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        completed: 0,
        cancelled: 0,
        upcoming: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return {
      total: appointments.length,
      today: categorizedAppointments.today.length,
      thisWeek: categorizedAppointments.thisWeek.length + categorizedAppointments.today.length + categorizedAppointments.tomorrow.length,
      completed: appointments.filter((apt: any) => apt.status === "completed").length,
      cancelled: appointments.filter((apt: any) => apt.status === "cancelled").length,
      upcoming: appointments.filter((apt: any) => new Date(apt.appointmentDateTime) >= today).length
    };
  }, [appointments, categorizedAppointments]);

  return {
    appointments,
    categorizedAppointments,
    filteredAppointments,
    stats,
    isLoading: appointments === undefined,
    error: null, 
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
  };
}
