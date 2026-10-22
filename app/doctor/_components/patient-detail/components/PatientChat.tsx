import React from "react";
import { DoctorPatientChat } from "@/components/doctor/doctor-patient-chat";
import type { PatientChatProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientChat Component
 * 
 * Wrapper component for the doctor-patient chat interface
 * Provides consistent styling and integration with patient detail page
 * Optimized for performance with React.memo
 */
export const PatientChat = React.memo<PatientChatProps>(({
  doctorId,
  patientId,
  patientName,
  onClose,
  className = "",
}) => {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <DoctorPatientChat
        doctorId={doctorId}
        patientId={patientId}
        patientName={patientName}
        onClose={onClose}
      />
    </div>
  );
});

PatientChat.displayName = "PatientChat";
