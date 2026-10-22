interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SecurityAlertDetails {
  type: "login" | "password_change" | "profile_update" | "suspicious_activity" | "account_locked";
  timestamp: string;
  location?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  action?: string;
}

export function generateSecurityAlertEmail(
  email: string,
  firstName: string,
  alertDetails: SecurityAlertDetails
): EmailOptions {
  const getAlertInfo = (type: string) => {
    switch (type) {
      case "login":
        return {
          title: "New Login Detected",
          icon: "🔐",
          message: "A new login was detected on your MedScribe account.",
          severity: "info"
        };
      case "password_change":
        return {
          title: "Password Changed",
          icon: "🔑",
          message: "Your MedScribe account password was successfully changed.",
          severity: "success"
        };
      case "profile_update":
        return {
          title: "Profile Updated",
          icon: "👤",
          message: "Important changes were made to your MedScribe profile.",
          severity: "info"
        };
      case "suspicious_activity":
        return {
          title: "Suspicious Activity Detected",
          icon: "⚠️",
          message: "We detected unusual activity on your MedScribe account.",
          severity: "warning"
        };
      case "account_locked":
        return {
          title: "Account Temporarily Locked",
          icon: "🚫",
          message: "Your MedScribe account has been temporarily locked for security reasons.",
          severity: "danger"
        };
      default:
        return {
          title: "Security Alert",
          icon: "🔒",
          message: "A security event occurred on your MedScribe account.",
          severity: "info"
        };
    }
  };

  const alertInfo = getAlertInfo(alertDetails.type);
  const severityColors = {
    info: "#2563eb",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626"
  };
  const headerColor = severityColors[alertInfo.severity as keyof typeof severityColors];

  return {
    to: email,
    subject: `MedScribe Security Alert: ${alertInfo.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">${alertInfo.icon}</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Security Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              ${alertInfo.title}
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${firstName}! 🔐</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
              ${alertInfo.message}
            </p>
            
            <!-- Alert Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid ${headerColor}; border-radius: 12px; padding: 24px; margin: 0 0 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Event Details</h3>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">⏰ Time:</span>
                  <span style="color: #1f2937;">${alertDetails.timestamp}</span>
                </div>
                
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">🎯 Event Type:</span>
                  <span style="color: #1f2937;">${alertInfo.title}</span>
                </div>
                
                ${alertDetails.location ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">📍 Location:</span>
                  <span style="color: #1f2937;">${alertDetails.location}</span>
                </div>
                ` : ''}
                
                ${alertDetails.ipAddress ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">🌐 IP Address:</span>
                  <span style="color: #1f2937; font-family: monospace;">${alertDetails.ipAddress}</span>
                </div>
                ` : ''}
                
                ${alertDetails.device ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">📱 Device:</span>
                  <span style="color: #1f2937;">${alertDetails.device}</span>
                </div>
                ` : ''}
                
                ${alertDetails.browser ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">🌍 Browser:</span>
                  <span style="color: #1f2937;">${alertDetails.browser}</span>
                </div>
                ` : ''}
                
                ${alertDetails.action ? `
                <div style="display: flex; align-items: center; padding: 8px 0;">
                  <span style="color: #6b7280; font-weight: 600; width: 120px; display: inline-block;">⚡ Action:</span>
                  <span style="color: #1f2937;">${alertDetails.action}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Action Required Section -->
            ${alertDetails.type === "suspicious_activity" || alertDetails.type === "account_locked" ? `
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🚨 Action Required</h3>
              <p style="color: #991b1b; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                ${alertDetails.type === "account_locked" 
                  ? "Your account has been temporarily locked. Please contact support to regain access."
                  : "If this activity was not authorized by you, please take immediate action to secure your account."
                }
              </p>
              <ul style="color: #991b1b; margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
                <li>Change your password immediately</li>
                <li>Review your recent account activity</li>
                <li>Enable two-factor authentication</li>
                <li>Contact our security team if needed</li>
              </ul>
            </div>
            ` : `
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
              <h3 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">✅ What This Means</h3>
              <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.5;">
                ${alertDetails.type === "login" 
                  ? "If this was you, no action is needed. If not, please secure your account immediately."
                  : alertDetails.type === "password_change"
                  ? "Your password change was successful. If you didn't make this change, contact support immediately."
                  : "This is a routine security notification. If you didn't make these changes, please contact support."
                }
              </p>
            </div>
            `}
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/security" 
                 style="display: inline-block; background-color: ${headerColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                Security Settings
              </a>
              ${alertDetails.type === "suspicious_activity" || alertDetails.type === "account_locked" ? `
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" 
                 style="display: inline-block; background-color: #6b7280; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                Contact Support
              </a>
              ` : ''}
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
              This is an automated security notification. We recommend regularly reviewing your account activity.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">
              Best regards,<br>
              <strong>The MedScribe Security Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px;">
              This is an automated security alert from MedScribe.
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
    text: `MedScribe Security Alert: ${alertInfo.title}

Hello ${firstName},

${alertInfo.message}

Event Details:
- Time: ${alertDetails.timestamp}
- Event Type: ${alertInfo.title}
${alertDetails.location ? `- Location: ${alertDetails.location}` : ''}
${alertDetails.ipAddress ? `- IP Address: ${alertDetails.ipAddress}` : ''}
${alertDetails.device ? `- Device: ${alertDetails.device}` : ''}
${alertDetails.browser ? `- Browser: ${alertDetails.browser}` : ''}
${alertDetails.action ? `- Action: ${alertDetails.action}` : ''}

${alertDetails.type === "suspicious_activity" || alertDetails.type === "account_locked" 
  ? `ACTION REQUIRED: If this activity was not authorized by you, please:
- Change your password immediately
- Review your recent account activity
- Enable two-factor authentication
- Contact our security team`
  : `If this was not you, please contact our security team immediately.`
}

Security Settings: ${process.env.NEXT_PUBLIC_APP_URL}/settings/security

Best regards,
The MedScribe Security Team`
  };
}
