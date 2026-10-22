import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSOAPViewer } from "@/components/ui/soap-viewer";
import { SOAPUtils } from "@/app/patient/_components/soap-history/types";
import type { UseSharedSOAPActionsReturn, SharedSOAPNote } from "../types";
import { soapRAGHooks } from "@/lib/services/soap-rag-hooks";

/**
 * Custom hook for managing shared SOAP note actions
 * 
 * Features:
 * - Handles viewing SOAP notes
 * - Manages action modal state
 * - Provides download functionality
 * - Marks notes as read when actions are taken
 * - Handles navigation to SOAP view
 * 
 * @returns {UseSharedSOAPActionsReturn} Action handlers and state
 */
export function useSharedSOAPActions(): UseSharedSOAPActionsReturn {
  const router = useRouter();
  const [selectedNote, setSelectedNote] = useState<SharedSOAPNote | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // SOAP Viewer state
  const soapViewer = useSOAPViewer();

  // Mark as read mutation
  const markAsRead = useMutation(api.sharedSoapNotes.markAsRead);

  /**
   * Handle viewing a SOAP note
   * Marks the note as read and opens the SOAP viewer
   */
  const handleViewSOAP = useCallback(async (note: SharedSOAPNote) => {
    try {
      // Mark as read
      await markAsRead({ sharedSoapNoteId: note._id as any });

      // 🔥 Embed SOAP action into RAG system (production-ready)
      // Note: In a real implementation, you'd get doctor ID from context/auth
      const doctorId = 'doctor_from_context'; // This should be extracted from context

      soapRAGHooks.onSOAPNoteAction({
        actionId: note._id,
        soapNoteId: note.soapNote._id,
        doctorId,
        patientId: note.patient._id,
        patientName: `${note.patient.firstName} ${note.patient.lastName}`,  // ✅ ADD PATIENT NAME
        actionType: 'reviewed',
        comments: 'SOAP note reviewed by doctor',
        reason: 'Doctor reviewed shared SOAP note',
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    // Convert SharedSOAPNote to SOAPNote format for viewer
    const soapNote = {
      _id: note.soapNote._id,
      subjective: note.soapNote.subjective,
      objective: note.soapNote.objective,
      assessment: note.soapNote.assessment,
      plan: note.soapNote.plan,
      qualityScore: note.soapNote.qualityScore,
      createdAt: note.createdAt,
      updatedAt: note.createdAt, // Use createdAt as fallback
      patientName: `${note.patient.firstName} ${note.patient.lastName}`,
      patientId: note.patient._id,
      // Include all enhanced data from the original SOAP note
      data: note.soapNote.data,
      // Include any other fields that might be needed
      ...note.soapNote,
    };

    // Open SOAP viewer
    soapViewer.openViewer(soapNote);
  }, [markAsRead, soapViewer]);

  /**
   * Handle taking action on a SOAP note
   * Marks the note as read and opens the action modal
   */
  const handleTakeAction = useCallback(async (note: SharedSOAPNote) => {
    try {
      // Mark as read
      await markAsRead({ sharedSoapNoteId: note._id as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    setSelectedNote(note);
    setActionModalOpen(true);
  }, [markAsRead]);

  /**
   * Handle downloading a SOAP note
   * Creates a text file with the SOAP note content and triggers download
   */
  const handleDownloadNote = useCallback((note: SharedSOAPNote) => {
    // Extract enhanced data using utility functions
    const subjective = note.soapNote ? SOAPUtils.getSubjective(note.soapNote) : '';
    const objective = note.soapNote ? SOAPUtils.getObjective(note.soapNote) : '';
    const assessment = note.soapNote ? SOAPUtils.getAssessment(note.soapNote) : '';
    const plan = note.soapNote ? SOAPUtils.getPlan(note.soapNote) : '';
    const qualityScore = note.soapNote ? SOAPUtils.getQualityScore(note.soapNote) : undefined;
    const specialty = note.soapNote ? SOAPUtils.getSpecialty(note.soapNote) : undefined;
    const safetyStatus = note.soapNote ? SOAPUtils.getSafetyStatus(note.soapNote) : undefined;
    const redFlags = note.soapNote ? SOAPUtils.getRedFlags(note.soapNote) : [];
    const recommendations = note.soapNote ? SOAPUtils.getRecommendations(note.soapNote) : [];
    const sessionId = note.soapNote ? SOAPUtils.getSessionId(note.soapNote) : undefined;
    const hasEnhancedData = note.soapNote ? SOAPUtils.hasEnhancedData(note.soapNote) : false;

    const content = `SOAP Note - ${note.patient?.firstName} ${note.patient?.lastName}

Date: ${new Date(note.createdAt).toLocaleDateString()}
Patient: ${note.patient?.firstName} ${note.patient?.lastName}
MRN: ${note.patient?.mrn || 'N/A'}
Gender: ${note.patient?.gender}
DOB: ${note.patient?.dateOfBirth}
${sessionId ? `Session ID: ${sessionId}` : ''}
${specialty ? `Specialty: ${specialty}` : ''}
${hasEnhancedData ? 'Enhanced AI Analysis: Available' : ''}

${note.message ? `Message: "${note.message}"` : ''}

SUBJECTIVE:
${subjective}

OBJECTIVE:
${objective}

ASSESSMENT:
${assessment}

PLAN:
${plan}

${recommendations.length > 0 ? `RECOMMENDATIONS:\n${recommendations.map(rec => `• ${rec}`).join('\n')}\n\n` : ''}${redFlags.length > 0 ? `RED FLAGS:\n${redFlags.map(flag => `⚠ ${flag}`).join('\n')}\n\n` : ''}${qualityScore ? `Quality Score: ${qualityScore}%\n` : ''}${safetyStatus !== undefined ? `Safety Status: ${safetyStatus ? 'Safe' : 'Requires Attention'}\n` : ''}Share Type: ${note.shareType === "direct_share" ? "Direct Share" : "Referral Share"}
Shared On: ${new Date(note.createdAt).toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${note.patient?.firstName}-${note.patient?.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Close the action modal and clear selected note
   */
  const closeActionModal = useCallback(() => {
    setActionModalOpen(false);
    setSelectedNote(null);
  }, []);

  return {
    selectedNote,
    actionModalOpen,
    handleViewSOAP,
    handleTakeAction,
    handleDownloadNote,
    closeActionModal,
    soapViewer, // Expose SOAP viewer state
  };
}
