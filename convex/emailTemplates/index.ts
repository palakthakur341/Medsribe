// Email Templates Index
// This file exports all email template functions for easy importing

import { generateWelcomeEmail } from './welcome';
import { generatePasswordResetEmail } from './resetPassword';
import { generateProfileCompletionEmail } from './profileCompletion';
import { generateAppointmentReminderEmail } from './appointmentReminder';
import { generateAppointmentFollowupEmail } from './appointmentFollowup';
import { generateSecurityAlertEmail } from './securityAlert';
import { generateInactiveUserEmail } from './inactiveUser';

export {
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateProfileCompletionEmail,
  generateAppointmentReminderEmail,
  generateAppointmentFollowupEmail,
  generateSecurityAlertEmail,
  generateInactiveUserEmail
};

// Email template types for type safety
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentDetails {
  id: string;
  date: string;
  time: string;
  duration?: number;
  type: string;
  location?: string;
  notes?: string;
  diagnosis?: string;
  prescriptions?: string[];
  nextAppointment?: string;
  instructions?: string;
}

export interface SecurityAlertDetails {
  type: "login" | "password_change" | "profile_update" | "suspicious_activity" | "account_locked";
  timestamp: string;
  location?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  action?: string;
}

// Email template factory function
export function generateEmailTemplate(
  templateType: string,
  templateData: any
): EmailOptions {
  switch (templateType) {
    case "welcome":
      return generateWelcomeEmail(
        templateData.email,
        templateData.firstName,
        templateData.role
      );
      
    case "password_reset":
      return generatePasswordResetEmail(
        templateData.email,
        templateData.firstName,
        templateData.resetToken
      );
      
    case "profile_completion_reminder":
      return generateProfileCompletionEmail(
        templateData.email,
        templateData.firstName,
        templateData.role,
        templateData.completionPercentage,
        templateData.missingFields
      );
      
    case "appointment_reminder_24h":
    case "appointment_reminder_1h":
      return generateAppointmentReminderEmail(
        templateData.email,
        templateData.patientName,
        templateData.doctorName,
        templateData.appointmentDetails,
        templateType === "appointment_reminder_1h" ? "1h" : "24h"
      );
      
    case "appointment_followup":
      return generateAppointmentFollowupEmail(
        templateData.email,
        templateData.patientName,
        templateData.doctorName,
        templateData.appointmentDetails
      );
      
    case "security_alert":
      return generateSecurityAlertEmail(
        templateData.email,
        templateData.firstName,
        templateData.alertDetails
      );
      
    case "inactive_user_reengagement":
      return generateInactiveUserEmail(
        templateData.email,
        templateData.firstName,
        templateData.role,
        templateData.lastLoginDate
      );
      
    default:
      throw new Error(`Unknown email template type: ${templateType}`);
  }
}
