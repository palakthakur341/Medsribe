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
  type: string;
  diagnosis?: string;
  prescriptions?: string[];
  nextAppointment?: string;
  instructions?: string;
}

export function generateAppointmentFollowupEmail(
  email: string,
  patientName: string,
  doctorName: string,
  appointmentDetails: AppointmentDetails
): EmailOptions {
  return {
    to: email,
    subject: "Follow-up: Your Recent Appointment",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Follow-up</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">📋</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Appointment Follow-up</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Your care summary
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${patientName}! 🌟</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              Thank you for visiting <strong>Dr. ${doctorName}</strong> on ${appointmentDetails.date}. 
              Here's a summary of your appointment and next steps for your care.
            </p>
            
            <!-- Appointment Summary Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Appointment Summary</h3>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">👨‍⚕️ Doctor:</span>
                  <span style="color: #1f2937; font-weight: 600;">Dr. ${doctorName}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">📅 Date:</span>
                  <span style="color: #1f2937;">${appointmentDetails.date} at ${appointmentDetails.time}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">🏥 Type:</span>
                  <span style="color: #1f2937;">${appointmentDetails.type}</span>
                </div>
                
                ${appointmentDetails.diagnosis ? `
                <div style="display: flex; align-items: flex-start; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">🔍 Diagnosis:</span>
                  <span style="color: #1f2937;">${appointmentDetails.diagnosis}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Prescriptions Section -->
            ${appointmentDetails.prescriptions && appointmentDetails.prescriptions.length > 0 ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💊 Prescriptions</h3>
              <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                The following medications have been prescribed for you:
              </p>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${appointmentDetails.prescriptions.map(prescription => `<li style="margin-bottom: 4px;">${prescription}</li>`).join('')}
              </ul>
              <p style="color: #92400e; margin: 15px 0 0 0; font-size: 14px; font-weight: 600;">
                📋 Please follow the dosage instructions carefully and contact your doctor if you have any questions.
              </p>
            </div>
            ` : ''}
            
            <!-- Instructions Section -->
            ${appointmentDetails.instructions ? `
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">📝 Care Instructions</h3>
              <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.6;">
                ${appointmentDetails.instructions}
              </p>
            </div>
            ` : ''}
            
            <!-- Next Appointment -->
            ${appointmentDetails.nextAppointment ? `
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #047857; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">📅 Next Appointment</h3>
              <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.6;">
                Your next appointment is scheduled for: <strong>${appointmentDetails.nextAppointment}</strong>
              </p>
            </div>
            ` : ''}
            
            <!-- Important Reminders -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">⚠️ Important Reminders</h3>
              <ul style="color: #dc2626; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
                <li>Take all medications as prescribed</li>
                <li>Follow up if symptoms worsen or new symptoms appear</li>
                <li>Keep track of any side effects from medications</li>
                <li>Contact your doctor if you have any concerns</li>
                <li>Don't stop medications without consulting your doctor</li>
              </ul>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointmentDetails.id}" 
                 style="display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                View Full Report
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/book" 
                 style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                Book Follow-up
              </a>
            </div>
            
            <!-- Contact Information -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h3>
              <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                If you have any questions about your treatment or need to reach Dr. ${doctorName}, 
                please don't hesitate to contact us through the MedScribe platform.
              </p>
              <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>Emergency:</strong> If you're experiencing a medical emergency, call 911 immediately.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">
              Thank you for choosing MedScribe for your healthcare needs.<br>
              <strong>Dr. ${doctorName} and the MedScribe Team</strong>
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
    text: `Appointment Follow-up

Hello ${patientName},

Thank you for visiting Dr. ${doctorName} on ${appointmentDetails.date}. Here's a summary of your appointment:

Appointment Details:
- Doctor: Dr. ${doctorName}
- Date: ${appointmentDetails.date} at ${appointmentDetails.time}
- Type: ${appointmentDetails.type}
${appointmentDetails.diagnosis ? `- Diagnosis: ${appointmentDetails.diagnosis}` : ''}

${appointmentDetails.prescriptions && appointmentDetails.prescriptions.length > 0 ? `
Prescriptions:
${appointmentDetails.prescriptions.map(prescription => `- ${prescription}`).join('\n')}

Please follow dosage instructions carefully.
` : ''}

${appointmentDetails.instructions ? `
Care Instructions:
${appointmentDetails.instructions}
` : ''}

${appointmentDetails.nextAppointment ? `
Next Appointment: ${appointmentDetails.nextAppointment}
` : ''}

Important Reminders:
- Take all medications as prescribed
- Follow up if symptoms worsen
- Contact your doctor with any concerns

View full report: ${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointmentDetails.id}

Emergency: Call 911 for medical emergencies.

Thank you for choosing MedScribe.
Dr. ${doctorName} and the MedScribe Team`
  };
}
