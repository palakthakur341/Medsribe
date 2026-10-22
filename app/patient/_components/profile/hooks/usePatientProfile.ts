import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import type { UsePatientProfileReturn, Patient, PatientProfileFormData } from "../types";

/**
 * Custom hook for managing patient profile operations
 * Handles profile creation, updates, and loading states
 */
export function usePatientProfile(
  patientProfile?: Patient,
  session?: any
): UsePatientProfileReturn {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mutations
  const updateProfileMutation = useMutation(api.patients.updatePatientProfile);
  const createProfileMutation = useMutation(api.patients.createPatientProfile);

  // Update profile function
  const updateProfile = useCallback(async (data: PatientProfileFormData) => {
    if (!patientProfile || !session?.user?.id) {
      throw new Error("Patient profile or session not available");
    }

    setIsUpdating(true);
    setError(null);

    try {
      await updateProfileMutation({
        patientId: patientProfile._id,
        lastModifiedBy: session.user.id as any,
        ...data,
      });

      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update profile");
      setError(error);
      
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [patientProfile, session?.user?.id, updateProfileMutation, toast]);

  // Create profile function
  const createProfile = useCallback(async (data: PatientProfileFormData) => {
    if (!session?.user?.id) {
      throw new Error("Session not available");
    }

    setIsUpdating(true);
    setError(null);

    try {
      await createProfileMutation({
        userId: session.user.id as any,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        primaryPhone: data.primaryPhone,
        email: data.email,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        consentForTreatment: data.consentForTreatment,
        consentForDataSharing: data.consentForDataSharing,
        // Optional fields
        secondaryPhone: data.secondaryPhone,
        addressLine2: data.addressLine2,
        nationalId: data.nationalId,
        bloodType: data.bloodType,
        preferredLanguage: data.preferredLanguage,
        advanceDirectives: data.advanceDirectives,
      });

      toast({
        title: "Profile created successfully!",
        description: "Your profile has been created.",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create profile");
      setError(error);
      
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, createProfileMutation, toast]);

  return {
    patientProfile,
    isLoading: patientProfile === undefined,
    updateProfile,
    createProfile,
    isUpdating,
    error,
  };
}
