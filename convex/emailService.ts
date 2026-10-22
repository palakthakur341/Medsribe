// Email service for Convex actions
// This integrates Gmail API directly into Convex

import {
  generateEmailTemplate,
  type EmailOptions,
  type AppointmentDetails,
  type SecurityAlertDetails
} from './emailTemplates';

interface EmailTemplateData {
  email: string;
  firstName?: string;
  role?: string;
  patientName?: string;
  doctorName?: string;
  appointmentDetails?: AppointmentDetails;
  alertDetails?: SecurityAlertDetails;
  lastLoginDate?: string;
  completionPercentage?: number;
  missingFields?: string[];
  resetToken?: string;
}

// Generate email content based on type and template data
export function generateEmailContent(
  emailType: string,
  templateData: EmailTemplateData
): EmailOptions {
  try {
    return generateEmailTemplate(emailType, templateData);
  } catch (error) {
    // Fallback for unknown email types
    return {
      to: templateData.email,
      subject: `MedScribe Notification: ${emailType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">MedScribe Notification</h1>
          <p>Hello${templateData.firstName ? ` ${templateData.firstName}` : ''},</p>
          <p>You have a new notification from MedScribe.</p>
          <p>Best regards,<br>The MedScribe Team</p>
        </div>
      `,
      text: `Hello${templateData.firstName ? ` ${templateData.firstName}` : ''}, You have a new notification from MedScribe.`
    };
  }
}

// Production email sending function with direct Gmail API integration
export async function sendEmail(emailOptions: EmailOptions): Promise<boolean> {
  try {
    // Use Gmail API directly from Convex
    const gmailConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
      user: process.env.GMAIL_USER!,
    };

    // Check if Gmail is configured
    if (!gmailConfig.clientId || !gmailConfig.clientSecret || !gmailConfig.refreshToken || !gmailConfig.user) {
      console.error("Gmail configuration missing. Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER");
      return false;
    }

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: gmailConfig.clientId,
        client_secret: gmailConfig.clientSecret,
        refresh_token: gmailConfig.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create email message
    const emailMessage = [
      `To: ${emailOptions.to}`,
      `From: ${gmailConfig.user}`,
      `Subject: ${emailOptions.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      emailOptions.html
    ].join('\n');

    // Encode email in base64url (Convex-compatible)
    const base64 = btoa(unescape(encodeURIComponent(emailMessage)));
    const encodedMessage = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    return sendResponse.ok;
  } catch (error) {
    return false;
  }
}
