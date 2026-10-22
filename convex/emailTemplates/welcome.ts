interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function generateWelcomeEmail(
  email: string, 
  firstName: string, 
  role: string
): EmailOptions {
  const roleDisplayName = role === "doctor" ? "Doctor" : 
                         role === "patient" ? "Patient" : 
                         role === "pharmacy" ? "Pharmacy" : "User";

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
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">M</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to MedScribe!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${firstName}! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Welcome to MedScribe! We're excited to have you join our healthcare platform as a <strong>${roleDisplayName}</strong>.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              Your account has been successfully created and you can now access all the features available to you:
            </p>
            
            <!-- Features List -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What you can do:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${role === "doctor" ? `
                  <li>Manage patient appointments and consultations</li>
                  <li>Access patient medical records securely</li>
                  <li>Prescribe medications and treatments</li>
                  <li>Communicate with patients and pharmacies</li>
                ` : role === "patient" ? `
                  <li>Book appointments with healthcare providers</li>
                  <li>Access your medical records and history</li>
                  <li>Manage prescriptions and medications</li>
                  <li>Communicate securely with your doctors</li>
                ` : role === "pharmacy" ? `
                  <li>Manage prescription orders and inventory</li>
                  <li>Communicate with doctors and patients</li>
                  <li>Process medication dispensing</li>
                  <li>Track prescription history</li>
                ` : `
                  <li>Access your personalized dashboard</li>
                  <li>Manage your profile and settings</li>
                  <li>Connect with healthcare providers</li>
                `}
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/${role}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Get Started
              </a>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
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
    text: `Welcome to MedScribe!
    
Hello ${firstName},

Welcome to MedScribe! We're excited to have you join our healthcare platform as a ${roleDisplayName}.

Your account has been successfully created and you can now access all the features available to you.

Get started: ${process.env.NEXT_PUBLIC_APP_URL}/${role}

Best regards,
The MedScribe Team`
  };
}
