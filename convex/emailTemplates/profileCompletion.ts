interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function generateProfileCompletionEmail(
  email: string,
  firstName: string,
  role: string,
  completionPercentage: number,
  missingFields: string[]
): EmailOptions {
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${role}/profile`;
  const roleDisplayName = role === "doctor" ? "Doctor" : 
                         role === "patient" ? "Patient" : 
                         role === "pharmacy" ? "Pharmacy" : "User";

  return {
    to: email,
    subject: "Complete Your MedScribe Profile",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Profile</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">📝</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Complete Your Profile</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${firstName}! ✨</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              We noticed your MedScribe profile is <strong>${completionPercentage}% complete</strong>. 
              Completing your profile helps us provide you with a better, more personalized experience.
            </p>
            
            <!-- Progress Bar -->
            <div style="margin: 0 0 30px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #374151; font-weight: 600; font-size: 14px;">Profile Completion</span>
                <span style="color: #059669; font-weight: 600; font-size: 14px;">${completionPercentage}%</span>
              </div>
              <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                <div style="width: ${completionPercentage}%; height: 100%; background-color: #059669; transition: width 0.3s ease;"></div>
              </div>
            </div>
            
            <!-- Missing Fields -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Missing Information</h3>
              <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                Please complete the following fields to unlock all features:
              </p>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${missingFields.map(field => `<li style="margin-bottom: 4px;">${field}</li>`).join('')}
              </ul>
            </div>
            
            <!-- Benefits -->
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🎯 Why Complete Your Profile?</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${role === "doctor" ? `
                  <li>Better patient matching and recommendations</li>
                  <li>Enhanced credibility with verified credentials</li>
                  <li>Improved search visibility for patients</li>
                  <li>Access to advanced practice management tools</li>
                ` : role === "patient" ? `
                  <li>Personalized health recommendations</li>
                  <li>Better doctor matching based on your needs</li>
                  <li>Streamlined appointment booking</li>
                  <li>Comprehensive medical history tracking</li>
                ` : role === "pharmacy" ? `
                  <li>Enhanced visibility to healthcare providers</li>
                  <li>Better inventory management recommendations</li>
                  <li>Streamlined prescription processing</li>
                  <li>Improved patient communication</li>
                ` : `
                  <li>Personalized experience</li>
                  <li>Better feature recommendations</li>
                  <li>Enhanced security and verification</li>
                  <li>Improved platform functionality</li>
                `}
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${profileUrl}" 
                 style="display: inline-block; background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);">
                Complete My Profile
              </a>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
              It only takes a few minutes to complete, and you can always update your information later.
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
    text: `Complete Your MedScribe Profile

Hello ${firstName},

Your MedScribe profile is ${completionPercentage}% complete. Completing your profile helps us provide you with a better experience.

Missing information:
${missingFields.map(field => `- ${field}`).join('\n')}

Complete your profile: ${profileUrl}

Best regards,
The MedScribe Team`
  };
}
