"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  TreatmentViewer, 
  useTreatmentViewer, 
  type TreatmentPlan 
} from "@/components/ui/treatment-viewer";

/**
 * Example usage of TreatmentViewer component
 * This shows how to integrate the TreatmentViewer in both doctor and patient contexts
 */

// Example treatment data
const exampleTreatment: TreatmentPlan = {
  _id: "treatment_123456789",
  title: "Hypertension Management Plan",
  diagnosis: "Essential Hypertension (Primary)",
  plan: "Initiate antihypertensive therapy with ACE inhibitor. Monitor blood pressure weekly for first month, then monthly. Lifestyle modifications including low-sodium diet and regular exercise.",
  goals: [
    "Achieve target blood pressure <130/80 mmHg within 3 months",
    "Reduce cardiovascular risk factors",
    "Improve patient adherence to medication regimen",
    "Establish regular monitoring routine"
  ],
  status: "active",
  startDate: "2024-01-15",
  endDate: "2024-07-15",
  createdAt: Date.now() - 86400000, // 1 day ago
  updatedAt: Date.now(),
  
  medicationDetails: [
    {
      name: "Lisinopril",
      genericName: "Lisinopril",
      strength: "10mg",
      dosageForm: "tablet",
      ndc: "0093-1530-01",
      rxcui: "29046",
      quantity: "30",
      frequency: "Once daily",
      duration: "6 months",
      instructions: "Take with or without food. Take at the same time each day. Do not stop taking without consulting your doctor.",
      refills: 5
    },
    {
      name: "Amlodipine",
      genericName: "Amlodipine Besylate",
      strength: "5mg",
      dosageForm: "tablet",
      ndc: "0093-5892-01",
      rxcui: "17767",
      quantity: "30",
      frequency: "Once daily",
      duration: "6 months",
      instructions: "Take in the morning with or without food. May cause swelling of ankles or feet - contact doctor if severe.",
      refills: 5
    }
  ],
  
  pharmacy: {
    _id: "pharmacy_123",
    name: "MedCenter Pharmacy",
    chainName: "CVS Health",
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102"
    },
    phone: "(415) 555-0123",
    isVerified: true,
    isActive: true
  },
  
  doctor: {
    _id: "doctor_123",
    firstName: "Sarah",
    lastName: "Johnson",
    primarySpecialty: "Internal Medicine",
    email: "dr.johnson@medscribe.com",
    phone: "(415) 555-0100",
    licenseNumber: "CA12345678"
  },
  
  patient: {
    _id: "patient_123",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(415) 555-0199",
    dateOfBirth: "1975-03-15"
  },
  
  soapNote: {
    _id: "soap_123",
    timestamp: Date.now() - 172800000, // 2 days ago
    status: "completed",
    data: {
      session_id: "session_abc123",
      specialty_detection: {
        specialty: "Internal Medicine",
        confidence: 0.95
      },
      soap_notes: {
        subjective: "Patient reports feeling well overall. Denies chest pain, shortness of breath, or palpitations. Has been taking medications as prescribed. Reports occasional mild headaches in the morning.",
        objective: "BP: 142/88 mmHg, HR: 72 bpm, regular. No peripheral edema. Heart sounds normal, no murmurs. Lungs clear to auscultation bilaterally.",
        assessment: "Hypertension, currently not at goal. Patient appears to be responding to current regimen but needs optimization.",
        plan: "Increase Lisinopril to 20mg daily. Continue Amlodipine 5mg daily. Follow up in 4 weeks to reassess blood pressure control."
      },
      quality_metrics: {
        overall_score: 92,
        completeness_score: 88,
        accuracy_score: 95
      },
      safety_checks: {
        red_flags: [],
        contraindications: ["Pregnancy", "Bilateral renal artery stenosis"],
        drug_interactions: ["NSAIDs may reduce effectiveness"]
      }
    }
  },
  
  patientName: "John Smith",
  doctorName: "Dr. Sarah Johnson"
};

/**
 * Example 1: Doctor Context Usage
 * Shows how a doctor would view a treatment plan with full details
 */
export function DoctorTreatmentViewerExample() {
  const treatmentViewer = useTreatmentViewer();

  const handleViewTreatment = () => {
    treatmentViewer.openViewer(exampleTreatment);
  };

  const handleDownload = (treatment: TreatmentPlan) => {
    console.log("Downloading treatment:", treatment.title);
    // Implement download logic
  };

  const handleShare = (treatment: TreatmentPlan) => {
    console.log("Sharing treatment:", treatment.title);
    // Implement share logic
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Doctor View Example</h2>
      <Button onClick={handleViewTreatment}>
        View Treatment Plan (Doctor Context)
      </Button>

      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true, // Show patient info in doctor context
          showDoctorInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: true,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to Patient",
          documentTitle: "Treatment Plan - Doctor View"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
          onDownload: handleDownload,
          onShare: handleShare,
        }}
      />
    </div>
  );
}

/**
 * Example 2: Patient Context Usage
 * Shows how a patient would view their treatment plan
 */
export function PatientTreatmentViewerExample() {
  const treatmentViewer = useTreatmentViewer();

  const handleViewTreatment = () => {
    treatmentViewer.openViewer(exampleTreatment);
  };

  const handleDownload = (treatment: TreatmentPlan) => {
    console.log("Patient downloading treatment:", treatment.title);
    // Implement download logic
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Patient View Example</h2>
      <Button onClick={handleViewTreatment}>
        View My Treatment Plan
      </Button>

      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: false, // Don't show patient info in patient context
          showDoctorInfo: true,   // Show doctor info for patient
          showMetadata: false,    // Hide technical metadata from patient
          allowPrint: true,
          allowDownload: true,
          allowShare: false,      // Patients typically don't share
          allowCopy: true,
          allowExportPDF: false,  // Simplified for patient
          backButtonText: "Back to My Treatments",
          documentTitle: "My Treatment Plan"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
          onDownload: handleDownload,
        }}
      />
    </div>
  );
}

/**
 * Example 3: Integration with TreatmentDetails
 * Shows how to integrate with existing treatment components
 */
export function TreatmentDetailsWithViewer() {
  const treatmentViewer = useTreatmentViewer();

  const handleViewTreatment = () => {
    treatmentViewer.openViewer(exampleTreatment);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Integration Example</h2>
      <p className="text-muted-foreground mb-4">
        This shows how to integrate TreatmentViewer with existing components like TreatmentDetails.
        The TreatmentDetails component now has an onView prop that can trigger the viewer.
      </p>
      
      <Button onClick={handleViewTreatment}>
        Open Treatment Viewer
      </Button>

      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true,
          showDoctorInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: true,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to Treatment Details",
          documentTitle: "Comprehensive Treatment Plan"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
        }}
      />
    </div>
  );
}
