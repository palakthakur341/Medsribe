interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function generatePasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
): EmailOptions {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  
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
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">🔒</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Password Reset Request</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello${firstName ? ` ${firstName}` : ''}! 🔐</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              You requested to reset your password for your MedScribe account. No worries, it happens to the best of us!
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              Click the button below to create a new password:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">
                Reset My Password
              </a>
            </div>
            
            <!-- Security Info -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">⚠️ Security Notice</h3>
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                This password reset link will expire in <strong>1 hour</strong> for your security. 
                If you don't reset your password within this time, you'll need to request a new link.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 0 0 30px 0; word-break: break-all;">
              <code style="color: #374151; font-size: 14px;">${resetUrl}</code>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 0 0 30px 0; border-radius: 4px;">
              <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. 
                Your password will remain unchanged and your account is secure.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">
              Best regards,<br>
              <strong>The MedScribe Security Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px;">
              This is an automated security email from MedScribe.
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              © 2024 MedScribe. All rights reserved.<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Reset Your MedScribe Password

Hello${firstName ? ` ${firstName}` : ''},

You requested to reset your password for your MedScribe account.

Click this link to reset your password: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The MedScribe Security Team`
  };
}
