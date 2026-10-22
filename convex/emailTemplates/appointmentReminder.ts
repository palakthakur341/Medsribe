interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AppointmentDetails {
  id: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  location?: string;
  notes?: string;
}

export function generateAppointmentReminderEmail(
  email: string,
  patientName: string,
  doctorName: string,
  appointmentDetails: AppointmentDetails,
  reminderType: "24h" | "1h"
): EmailOptions {
  const timeFrame = reminderType === "24h" ? "24 hours" : "1 hour";
  const urgencyColor = reminderType === "24h" ? "#2563eb" : "#dc2626";
  const appointmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointmentDetails.id}`;
  
  return {
    to: email,
    subject: `Appointment Reminder - ${timeFrame} Notice`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">📅</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Appointment Reminder</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              ${timeFrame} notice
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${patientName}! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              This is a friendly reminder that you have an upcoming appointment with 
              <strong>Dr. ${doctorName}</strong> in ${timeFrame}.
            </p>
            
            <!-- Appointment Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Appointment Details</h3>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">👨‍⚕️ Doctor:</span>
                  <span style="color: #1f2937; font-weight: 600;">Dr. ${doctorName}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">📅 Date:</span>
                  <span style="color: #1f2937;">${appointmentDetails.date}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">⏰ Time:</span>
                  <span style="color: #1f2937;">${appointmentDetails.time}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">⏱️ Duration:</span>
                  <span style="color: #1f2937;">${appointmentDetails.duration} minutes</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">🏥 Type:</span>
                  <span style="color: #1f2937;">${appointmentDetails.type}</span>
                </div>
                
                ${appointmentDetails.location ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 100px; display: inline-block;">📍 Location:</span>
                  <span style="color: #1f2937;">${appointmentDetails.location}</span>
                </div>
                ` : ''}
              </div>
              
              ${appointmentDetails.notes ? `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px;">📝 Notes:</h4>
                <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">${appointmentDetails.notes}</p>
              </div>
              ` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${appointmentUrl}" 
                 style="display: inline-block; background-color: ${urgencyColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                View Appointment
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointmentDetails.id}/reschedule" 
                 style="display: inline-block; background-color: #6b7280; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                Reschedule
              </a>
            </div>
            
            <!-- Preparation Tips -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">💡 Preparation Tips</h3>
              <ul style="color: #0c4a6e; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
                <li>Arrive 15 minutes early for check-in</li>
                <li>Bring a valid ID and insurance card</li>
                <li>Prepare a list of current medications</li>
                <li>Write down any questions or concerns</li>
                ${reminderType === "1h" ? '<li style="font-weight: 600;">⚠️ Your appointment is in 1 hour - please leave now if needed!</li>' : ''}
              </ul>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
              If you need to cancel or reschedule, please do so at least 24 hours in advance.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">
              Best regards,<br>
              <strong>The MedScribe Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              © 2024 MedScribe. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Appointment Reminder - ${timeFrame} Notice

Hello ${patientName},

This is a reminder that you have an upcoming appointment with Dr. ${doctorName} in ${timeFrame}.

Appointment Details:
- Doctor: Dr. ${doctorName}
- Date: ${appointmentDetails.date}
- Time: ${appointmentDetails.time}
- Duration: ${appointmentDetails.duration} minutes
- Type: ${appointmentDetails.type}
${appointmentDetails.location ? `- Location: ${appointmentDetails.location}` : ''}

${appointmentDetails.notes ? `Notes: ${appointmentDetails.notes}` : ''}

View appointment: ${appointmentUrl}

Preparation tips:
- Arrive 15 minutes early
- Bring ID and insurance card
- Prepare list of medications
- Write down questions

Best regards,
The MedScribe Team`
  };
}
