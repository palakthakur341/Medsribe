"use client";

import * as React from "react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Loader2 } from "lucide-react";
import {
  usePatientAuth,
  usePatientProfile,
  ProfileHeader,
  PersonalInfoSection,
  AddressSection,
  MedicalInfoSection,
  EmergencyContactSection,
  ConsentSection,
  type PatientProfileFormData,
} from "@/app/patient/_components/profile";
import {
  patientProfileSchema,
} from "@/lib/validations/patient";

/**
 * Patient Profile Page - Refactored with performance optimizations
 *
 * Features:
 * - Single form with multiple sections (no tabs)
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable form section components
 * - Comprehensive form validation
 * - Better UX with sectioned layout
 */
const PatientProfilePage = React.memo(() => {
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    session,
    patientProfile: profileData
  } = usePatientAuth();

  const {
    updateProfile,
    createProfile,
    isUpdating
  } = usePatientProfile(profileData, session);

  // Memoized loading state
  const isLoading = React.useMemo(() => authLoading, [authLoading]);

  // Memoized authentication check
  const isAuthorized = React.useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );

  // Form setup
  const form = useForm<PatientProfileFormData>({
    resolver: zodResolver(patientProfileSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "M",
      primaryPhone: "",
      secondaryPhone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      nationalId: "",
      bloodType: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      preferredLanguage: "English",
      consentForTreatment: true,
      consentForDataSharing: false,
      advanceDirectives: "",
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (profileData) {
      form.reset({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        dateOfBirth: profileData.dateOfBirth || "",
        gender: profileData.gender || "M",
        primaryPhone: profileData.primaryPhone || "",
        secondaryPhone: profileData.secondaryPhone || "",
        email: profileData.email || "",
        addressLine1: profileData.addressLine1 || "",
        addressLine2: profileData.addressLine2 || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zipCode: profileData.zipCode || "",
        country: profileData.country || "United States",
        nationalId: profileData.nationalId || "",
        bloodType: profileData.bloodType || undefined,
        emergencyContactName: profileData.emergencyContactName || "",
        emergencyContactPhone: profileData.emergencyContactPhone || "",
        emergencyContactRelation: profileData.emergencyContactRelation || "",
        preferredLanguage: profileData.preferredLanguage || "English",
        consentForTreatment: profileData.consentForTreatment ?? true,
        consentForDataSharing: profileData.consentForDataSharing ?? false,
        advanceDirectives: profileData.advanceDirectives || "",
      });
    }
  }, [profileData, form]);

  // Memoized form submission handler
  const onSubmit = React.useCallback(async (data: PatientProfileFormData) => {
    try {
      if (profileData) {
        await updateProfile(data);
      } else {
        await createProfile(data);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error("Form submission error:", error);
    }
  }, [profileData, updateProfile, createProfile]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <ProfileHeader
        patientProfile={profileData}
        session={session}
        className="flex-shrink-0"
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            {/* Form Content - Scrollable */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full scrollbar-hide">
                <div className="space-y-8 p-1">
                  {/* Personal Information Section */}
                  <PersonalInfoSection form={form} />

                  {/* Address Section */}
                  <AddressSection form={form} />

                  {/* Medical Information Section */}
                  <MedicalInfoSection form={form} />

                  {/* Emergency Contact Section */}
                  <EmergencyContactSection form={form} />

                  {/* Consent Section */}
                  <ConsentSection form={form} />
                </div>
              </ScrollArea>
            </div>

            {/* Submit Button */}
            <div className="flex-shrink-0 pt-4 border-t">
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
});

PatientProfilePage.displayName = "PatientProfilePage";

export default PatientProfilePage;

