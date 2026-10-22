interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function generateInactiveUserEmail(
  email: string,
  firstName: string,
  role: string,
  lastLoginDate: string
): EmailOptions {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${role}`;
  const roleDisplayName = role === "doctor" ? "Doctor" : 
                         role === "patient" ? "Patient" : 
                         role === "pharmacy" ? "Pharmacy" : "User";

  return {
    to: email,
    subject: "We Miss You at MedScribe! 👋",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We Miss You!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">👋</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">We Miss You!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Come back and see what's new
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${firstName}! 🌟</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              We noticed you haven't logged into MedScribe since <strong>${lastLoginDate}</strong>. 
              We miss you and wanted to check in!
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              We've made several improvements to the platform that you might find useful, 
              and we'd love to have you back to experience them.
            </p>
            
            <!-- What's New Section -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🆕 What's New</h3>
              
              <div style="display: grid; gap: 16px;">
                ${role === "doctor" ? `
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">📊</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Enhanced Analytics</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">New patient insights and practice performance metrics</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">💬</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Improved Messaging</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Better communication tools with patients and staff</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">📱</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Mobile Optimization</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Better mobile experience for on-the-go access</p>
                  </div>
                </div>
                ` : role === "patient" ? `
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">🗓️</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Easier Booking</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Streamlined appointment scheduling with your favorite doctors</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">📋</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Health Records</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Enhanced medical history tracking and sharing</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">💊</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Medication Reminders</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Smart notifications to help you stay on track</p>
                  </div>
                </div>
                ` : role === "pharmacy" ? `
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">📦</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Inventory Management</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Advanced tools for tracking and managing stock</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">🔄</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Prescription Processing</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Faster and more efficient prescription handling</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">📊</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Business Analytics</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Insights into your pharmacy's performance and trends</p>
                  </div>
                </div>
                ` : `
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #7c3aed; font-size: 18px;">✨</span>
                  <div>
                    <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Enhanced Experience</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Improved user interface and better performance</p>
                  </div>
                </div>
                `}
              </div>
            </div>
            
            <!-- Special Offer -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🎁 Welcome Back Offer</h3>
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                As a welcome back gesture, we're offering you priority support for the next 30 days. 
                Our team is here to help you get the most out of MedScribe!
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; background-color: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2);">
                Welcome Back - Sign In
              </a>
            </div>
            
            <!-- Quick Links -->
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">🔗 Quick Links</h3>
              <div style="display: grid; gap: 8px;">
                <a href="${dashboardUrl}" style="color: #1e40af; text-decoration: none; font-size: 14px; padding: 4px 0;">
                  → Your Dashboard
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="color: #1e40af; text-decoration: none; font-size: 14px; padding: 4px 0;">
                  → Update Profile
                </a>
                ${role === "patient" ? `
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/book" style="color: #1e40af; text-decoration: none; font-size: 14px; padding: 4px 0;">
                  → Book Appointment
                </a>
                ` : role === "doctor" ? `
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/patients" style="color: #1e40af; text-decoration: none; font-size: 14px; padding: 4px 0;">
                  → View Patients
                </a>
                ` : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #1e40af; text-decoration: none; font-size: 14px; padding: 4px 0;">
                  → Get Support
                </a>
              </div>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
              If you're no longer interested in receiving these emails, you can 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${email}" style="color: #6b7280; text-decoration: underline;">unsubscribe here</a>.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">
              We'd love to have you back!<br><br>
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
    text: `We Miss You at MedScribe!

Hello ${firstName},

We noticed you haven't logged into MedScribe since ${lastLoginDate}. We miss you and wanted to check in!

We've made several improvements to the platform that you might find useful:

${role === "doctor" ? `
- Enhanced Analytics: New patient insights and practice performance metrics
- Improved Messaging: Better communication tools with patients and staff
- Mobile Optimization: Better mobile experience for on-the-go access
` : role === "patient" ? `
- Easier Booking: Streamlined appointment scheduling
- Health Records: Enhanced medical history tracking
- Medication Reminders: Smart notifications to help you stay on track
` : role === "pharmacy" ? `
- Inventory Management: Advanced tools for tracking and managing stock
- Prescription Processing: Faster and more efficient prescription handling
- Business Analytics: Insights into your pharmacy's performance
` : `
- Enhanced Experience: Improved user interface and better performance
`}

Welcome Back Offer: Priority support for the next 30 days!

Sign in now: ${loginUrl}

Quick Links:
- Your Dashboard: ${dashboardUrl}
- Update Profile: ${process.env.NEXT_PUBLIC_APP_URL}/profile
${role === "patient" ? `- Book Appointment: ${process.env.NEXT_PUBLIC_APP_URL}/appointments/book` : ''}
${role === "doctor" ? `- View Patients: ${process.env.NEXT_PUBLIC_APP_URL}/patients` : ''}

We'd love to have you back!

Best regards,
The MedScribe Team

Unsubscribe: ${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${email}`
  };
}
