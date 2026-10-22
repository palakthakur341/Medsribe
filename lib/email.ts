// Email utility with Gmail API integration
import { getGmailService } from './gmail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const gmailService = getGmailService();
  const success = await gmailService.sendEmail(options);

  if (!success) {
    throw new Error("Gmail API failed to send email");
  }

  console.log(`Email sent successfully to ${options.to}`);
  return true;
}

// Email template functions
export function generatePasswordResetEmail(email: string, resetToken: string): EmailOptions {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  return {
    to: email,
    subject: "Reset Your MedScribe Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 30px;">Reset Your Password</h1>

            <p style="font-size: 16px; margin-bottom: 30px;">
              We received a request to reset your password for your MedScribe account.
            </p>

            <div style="margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>

            <p style="font-size: 14px; color: #666;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #999;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset Your MedScribe Password

      We received a request to reset your password for your MedScribe account.

      Click the link below to reset your password:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, you can safely ignore this email.
    `
  };
}

export function generateWelcomeEmail(email: string, firstName: string, role: string): EmailOptions {
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/login`;
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

  return {
    to: email,
    subject: "Welcome to MedScribe!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MedScribe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 30px;">Welcome to MedScribe!</h1>

            <p style="font-size: 18px; margin-bottom: 20px;">
              Hello ${firstName},
            </p>

            <p style="font-size: 16px; margin-bottom: 30px;">
              Your MedScribe account has been successfully created as a <strong>${role}</strong>.
              We're excited to have you join our healthcare platform!
            </p>

            <div style="margin: 30px 0;">
              <a href="${loginUrl}"
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Sign In Now
              </a>
              <a href="${dashboardUrl}"
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #0277bd; margin-bottom: 15px;">Getting Started</h3>
              <ul style="text-align: left; color: #555;">
                ${role === 'patient' ? `
                  <li>Complete your medical profile</li>
                  <li>Schedule your first appointment</li>
                  <li>Upload any relevant medical documents</li>
                ` : role === 'doctor' ? `
                  <li>Set up your practice profile</li>
                  <li>Configure your availability</li>
                  <li>Review patient management tools</li>
                ` : `
                  <li>Explore the admin dashboard</li>
                  <li>Review system settings</li>
                  <li>Manage user accounts</li>
                `}
              </ul>
            </div>

            <p style="font-size: 14px; color: #666;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #999;">
              This email was sent to ${email}. If you didn't create this account, please contact support immediately.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to MedScribe!

      Hello ${firstName},

      Your MedScribe account has been successfully created as a ${role}.
      We're excited to have you join our healthcare platform!

      Sign in to your account: ${loginUrl}
      Go to Dashboard: ${dashboardUrl}

      Getting Started:
      ${role === 'patient' ? `
      - Complete your medical profile
      - Schedule your first appointment
      - Upload any relevant medical documents
      ` : role === 'doctor' ? `
      - Set up your practice profile
      - Configure your availability
      - Review patient management tools
      ` : `
      - Explore the admin dashboard
      - Review system settings
      - Manage user accounts
      `}

      If you have any questions, please don't hesitate to contact our support team.

      This email was sent to ${email}. If you didn't create this account, please contact support immediately.
    `
  };
}

export function generateAppointmentConfirmationEmail(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDetails: {
    date: string;
    time: string;
    type: string;
    visitReason: string;
    location: {
      type: 'in_person' | 'telemedicine';
      address?: string;
      room?: string;
      meetingLink?: string;
    };
    duration: number;
  }
): EmailOptions {
  const { date, time, type, visitReason, location, duration } = appointmentDetails;

  return {
    to: patientEmail,
    subject: `Appointment Confirmed - ${date} at ${time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563eb; margin-bottom: 30px; text-align: center;">Appointment Confirmed</h1>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Dear ${patientName},
            </p>

            <p style="font-size: 16px; margin-bottom: 30px;">
              Your appointment has been successfully scheduled. Here are the details:
            </p>

            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 30px 0;">
              <h3 style="color: #2563eb; margin-bottom: 20px;">Appointment Details</h3>

              <div style="margin-bottom: 15px;">
                <strong>Doctor:</strong> Dr. ${doctorName}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Date:</strong> ${date}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Time:</strong> ${time}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Duration:</strong> ${duration} minutes
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Appointment Type:</strong> ${type.replace('_', ' ').toUpperCase()}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Visit Reason:</strong> ${visitReason}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Location:</strong> ${location.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}
              </div>

              ${location.type === 'in_person' && location.address ? `
                <div style="margin-bottom: 15px;">
                  <strong>Address:</strong> ${location.address}
                  ${location.room ? `<br><strong>Room:</strong> ${location.room}` : ''}
                </div>
              ` : ''}

              ${location.type === 'telemedicine' && location.meetingLink ? `
                <div style="margin-bottom: 15px;">
                  <strong>Meeting Link:</strong>
                  <a href="${location.meetingLink}" style="color: #2563eb;">${location.meetingLink}</a>
                </div>
              ` : ''}
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #d97706; margin-bottom: 15px;">Important Reminders</h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Please arrive 15 minutes early for in-person appointments</li>
                <li>Bring a valid ID and insurance card</li>
                <li>Prepare a list of current medications</li>
                ${location.type === 'telemedicine' ? '<li>Test your internet connection and camera before the appointment</li>' : ''}
              </ul>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center;">
              If you need to reschedule or cancel this appointment, please contact us as soon as possible.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This confirmation was sent to ${patientEmail}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Appointment Confirmed

      Dear ${patientName},

      Your appointment has been successfully scheduled. Here are the details:

      APPOINTMENT DETAILS:
      Doctor: Dr. ${doctorName}
      Date: ${date}
      Time: ${time}
      Duration: ${duration} minutes
      Appointment Type: ${type.replace('_', ' ').toUpperCase()}
      Visit Reason: ${visitReason}
      Location: ${location.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}

      ${location.type === 'in_person' && location.address ? `
      Address: ${location.address}
      ${location.room ? `Room: ${location.room}` : ''}
      ` : ''}

      ${location.type === 'telemedicine' && location.meetingLink ? `
      Meeting Link: ${location.meetingLink}
      ` : ''}

      IMPORTANT REMINDERS:
      - Please arrive 15 minutes early for in-person appointments
      - Bring a valid ID and insurance card
      - Prepare a list of current medications
      ${location.type === 'telemedicine' ? '- Test your internet connection and camera before the appointment' : ''}

      If you need to reschedule or cancel this appointment, please contact us as soon as possible.

      This confirmation was sent to ${patientEmail}
    `
  };
}

export function generateLoginNotificationEmail(email: string, firstName: string, loginDetails: {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}): EmailOptions {
  return {
    to: email,
    subject: "New Login to Your MedScribe Account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563eb; margin-bottom: 30px; text-align: center;">Login Notification</h1>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello ${firstName},
            </p>

            <p style="font-size: 16px; margin-bottom: 30px;">
              We detected a new login to your MedScribe account.
            </p>

            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
              <h3 style="color: #10b981; margin-bottom: 20px;">Login Details</h3>

              <div style="margin-bottom: 15px;">
                <strong>Time:</strong> ${loginDetails.timestamp}
              </div>

              ${loginDetails.ipAddress ? `
                <div style="margin-bottom: 15px;">
                  <strong>IP Address:</strong> ${loginDetails.ipAddress}
                </div>
              ` : ''}

              ${loginDetails.userAgent ? `
                <div style="margin-bottom: 15px;">
                  <strong>Device/Browser:</strong> ${loginDetails.userAgent}
                </div>
              ` : ''}
            </div>

            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #dc2626; margin-bottom: 15px;">Security Notice</h3>
              <p style="color: #991b1b; margin: 0;">
                If this wasn't you, please change your password immediately and contact our support team.
              </p>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center;">
              This is an automated security notification. You don't need to take any action if this login was authorized by you.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Login Notification

      Hello ${firstName},

      We detected a new login to your MedScribe account.

      LOGIN DETAILS:
      Time: ${loginDetails.timestamp}
      ${loginDetails.ipAddress ? `IP Address: ${loginDetails.ipAddress}` : ''}
      ${loginDetails.userAgent ? `Device/Browser: ${loginDetails.userAgent}` : ''}

      SECURITY NOTICE:
      If this wasn't you, please change your password immediately and contact our support team.

      This is an automated security notification. You don't need to take any action if this login was authorized by you.
    `
  };
}
