"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SOAPViewer } from "@/components/ui/soap-viewer";
import {
  useReferralsAuth,
  useReferralsData,
  useReferralsActions,
  useReferralsFormatters,
  ReferralsFilters,
  ReceivedReferralsList,
  SentReferralsList,
} from "@/app/doctor/_components/referrals";

/**
 * DoctorReferralsPage - Refactored with clean separation of concerns
 *
 * Features:
 * - Custom hooks for authentication, data management, actions, and formatting
 * - Reusable components for UI elements
 * - Performance optimized with React.memo
 * - Clean error handling and loading states
 * - Comprehensive filtering and search functionality
 */
const DoctorReferralsPage = React.memo(() => {
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile,
  } = useReferralsAuth();

  const {
    filteredReceivedReferrals,
    filteredSentReferrals,
    filters,
    setSearchTerm,
    setStatusFilter,
    clearAllFilters,
  } = useReferralsData(doctorProfile);

  const {
    selectedReferral,
    responseNotes,
    setSelectedReferral,
    setResponseNotes,
    handleAcceptReferral,
    handleDeclineReferral,
    handleCompleteReferral,
    handleViewSOAP,
    isProcessing,
    soapViewer,
  } = useReferralsActions();

  const {
    formatDate,
    getUrgencyBadge,
    getStatusBadge,
  } = useReferralsFormatters();

  // Show loading while authentication is loading
  if (authLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </>
    );
  }

  // Redirect handled by useReferralsAuth hook
  if (!isAuthenticated || !isDoctor) {
    return null;
  }

  // Show profile completion prompt if no doctor profile
  if (!doctorProfile) {
    return (
      <>
        <div className="space-y-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-4">
              Please complete your doctor profile to manage referrals.
            </p>
            <Button onClick={() => window.location.href = "/doctor/settings/profile"}>
              Complete Profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground text-sm">
            Manage patient referrals received and sent
          </p>
        </div>

        {/* Search and Filters */}
        <ReferralsFilters
          filters={filters}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onClearFilters={clearAllFilters}
        />

        {/* Main Content - Flex Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Received Referrals */}
          <ReceivedReferralsList
            referrals={filteredReceivedReferrals}
            selectedReferral={selectedReferral}
            responseNotes={responseNotes}
            onSelectReferral={setSelectedReferral}
            onResponseNotesChange={setResponseNotes}
            onAccept={handleAcceptReferral}
            onDecline={handleDeclineReferral}
            onComplete={handleCompleteReferral}
            onViewSOAP={handleViewSOAP}
            formatDate={formatDate}
            getUrgencyBadge={getUrgencyBadge}
            getStatusBadge={getStatusBadge}
            isProcessing={isProcessing}
          />

          {/* Sent Referrals */}
          <SentReferralsList
            referrals={filteredSentReferrals}
            onViewSOAP={handleViewSOAP}
            formatDate={formatDate}
            getUrgencyBadge={getUrgencyBadge}
            getStatusBadge={getStatusBadge}
          />
        </div>

        {/* SOAP Viewer for full-screen document view */}
        {soapViewer.selectedNote && (
          <SOAPViewer
            note={soapViewer.selectedNote}
            open={soapViewer.isOpen}
            onOpenChange={soapViewer.setOpen}
            config={{
              showBackButton: true,
              showActions: true,
              showPatientInfo: true,
              showMetadata: true,
              allowPrint: true,
              allowDownload: true,
              allowShare: false,
              allowCopy: true,
              allowExportPDF: true,
              backButtonText: "Back to Referrals",
              documentTitle: "SOAP Clinical Note - Referral"
            }}
            actions={{
              onBack: soapViewer.closeViewer,
              onPrint: () => window.print(),
              onCopy: (note) => {
                navigator.clipboard.writeText(`SOAP Note ID: ${note._id}`);
              },
              onDownload: (note) => {
                // Handle download - could implement PDF generation
                console.log("Download SOAP note:", note._id);
              },
              onExportPDF: (note) => {
                // Handle PDF export
                console.log("Export PDF for SOAP note:", note._id);
              }
            }}
          />
        )}
      </div>
    </>
  );
});

DoctorReferralsPage.displayName = "DoctorReferralsPage";

export default DoctorReferralsPage;
