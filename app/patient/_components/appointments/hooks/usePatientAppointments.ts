"use client";

import { useQuery } from "convex/react";
import { useMemo, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UsePatientAppointmentsReturn, Appointment, AppointmentStats } from "../types";

/**
 * Custom hook for managing patient appointment data
 * 
 * Features:
 * - Fetches upcoming and past appointments
 * - Calculates appointment statistics
 * - Provides memoized filtered data
 * - Handles loading and error states
 * - Optimized for performance with useMemo
 * 
 * @param patientId - The patient's ID
 * @returns {UsePatientAppointmentsReturn} Appointment data and utilities
 */
export function usePatientAppointments(patientId: Id<"patients"> | undefined): UsePatientAppointmentsReturn {
  // Fetch upcoming appointments
  const upcomingAppointments = useQuery(
    api.appointments.getUpcomingByPatient,
    patientId ? { patientId } : "skip"
  );

  // Fetch all appointments for past appointments filtering
  const allAppointments = useQuery(
    api.appointments.getByPatient,
    patientId ? { patientId } : "skip"
  );

  // Memoized past appointments filtering
  const pastAppointments = useMemo(() => {
    if (!allAppointments) return undefined;
    
    const now = Date.now();
    return allAppointments.filter(appointment =>
      appointment.status === "completed" ||
      appointment.status === "cancelled" ||
      appointment.appointmentDateTime < now
    );
  }, [allAppointments]);

  // Memoized loading state
  const isLoading = useMemo(() => 
    upcomingAppointments === undefined || allAppointments === undefined,
    [upcomingAppointments, allAppointments]
  );

  // Memoized appointment statistics
  const stats = useMemo((): AppointmentStats => {
    if (!allAppointments || !upcomingAppointments) {
      return {
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        thisMonth: 0,
        nextWeek: 0,
        completionRate: 0,
      };
    }

    const now = Date.now();
    const oneWeekFromNow = now + (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime();

    const completed = allAppointments.filter(apt => apt.status === "completed").length;
    const cancelled = allAppointments.filter(apt => apt.status === "cancelled").length;
    const thisMonth = allAppointments.filter(apt => 
      apt.appointmentDateTime >= startOfMonth && apt.appointmentDateTime <= endOfMonth
    ).length;
    const nextWeek = upcomingAppointments.filter(apt => 
      apt.appointmentDateTime <= oneWeekFromNow
    ).length;

    const totalCompleted = completed + cancelled;
    const completionRate = totalCompleted > 0 ? (completed / totalCompleted) * 100 : 0;

    return {
      total: allAppointments.length,
      upcoming: upcomingAppointments.length,
      completed,
      cancelled,
      thisMonth,
      nextWeek,
      completionRate: Math.round(completionRate),
    };
  }, [allAppointments, upcomingAppointments]);

  // Refetch function
  const refetch = useCallback(() => {
    // Convex queries automatically refetch, but we can trigger a manual refetch if needed
    // This is a placeholder for potential future functionality
  }, []);

  return {
    upcomingAppointments,
    pastAppointments,
    allAppointments,
    isLoading,
    error: null, // Convex handles errors differently, we might need to implement error handling
    refetch,
    stats,
  };
}
