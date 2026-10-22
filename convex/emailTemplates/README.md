# Email Templates

This directory contains organized email templates for the MedScribe application. Each template is in its own file for better maintainability and reusability.

## Available Templates

### 1. Welcome Email (`welcome.ts`)
Sent when a new user registers.
```typescript
import { generateWelcomeEmail } from './emailTemplates/welcome';

const emailOptions = generateWelcomeEmail(
  "user@example.com",
  "John",
  "doctor"
);
```

### 2. Password Reset (`resetPassword.ts`)
Sent when a user requests a password reset.
```typescript
import { generatePasswordResetEmail } from './emailTemplates/resetPassword';

const emailOptions = generatePasswordResetEmail(
  "user@example.com",
  "John",
  "reset-token-123"
);
```

### 3. Profile Completion Reminder (`profileCompletion.ts`)
Sent to remind users to complete their profile.
```typescript
import { generateProfileCompletionEmail } from './emailTemplates/profileCompletion';

const emailOptions = generateProfileCompletionEmail(
  "user@example.com",
  "John",
  "doctor",
  75, // completion percentage
  ["Phone number", "Specialization"] // missing fields
);
```

### 4. Appointment Reminder (`appointmentReminder.ts`)
Sent 24h or 1h before an appointment.
```typescript
import { generateAppointmentReminderEmail } from './emailTemplates/appointmentReminder';

const appointmentDetails = {
  id: "apt-123",
  date: "2024-01-15",
  time: "10:00 AM",
  duration: 30,
  type: "Consultation",
  location: "Room 101",
  notes: "Bring previous test results"
};

const emailOptions = generateAppointmentReminderEmail(
  "patient@example.com",
  "Jane Doe",
  "Dr. Smith",
  appointmentDetails,
  "24h" // or "1h"
);
```

### 5. Appointment Follow-up (`appointmentFollowup.ts`)
Sent after an appointment is completed.
```typescript
import { generateAppointmentFollowupEmail } from './emailTemplates/appointmentFollowup';

const appointmentDetails = {
  id: "apt-123",
  date: "2024-01-15",
  time: "10:00 AM",
  type: "Consultation",
  diagnosis: "Common cold",
  prescriptions: ["Paracetamol 500mg", "Rest for 3 days"],
  nextAppointment: "2024-01-22 at 2:00 PM",
  instructions: "Take medication as prescribed and get plenty of rest."
};

const emailOptions = generateAppointmentFollowupEmail(
  "patient@example.com",
  "Jane Doe",
  "Dr. Smith",
  appointmentDetails
);
```

### 6. Security Alert (`securityAlert.ts`)
Sent when security events occur.
```typescript
import { generateSecurityAlertEmail } from './emailTemplates/securityAlert';

const alertDetails = {
  type: "login",
  timestamp: "2024-01-15 10:30 AM",
  location: "New York, NY",
  ipAddress: "192.168.1.1",
  device: "iPhone 15",
  browser: "Safari 17.0"
};

const emailOptions = generateSecurityAlertEmail(
  "user@example.com",
  "John",
  alertDetails
);
```

### 7. Inactive User Re-engagement (`inactiveUser.ts`)
Sent to users who haven't logged in recently.
```typescript
import { generateInactiveUserEmail } from './emailTemplates/inactiveUser';

const emailOptions = generateInactiveUserEmail(
  "user@example.com",
  "John",
  "doctor",
  "December 1, 2023"
);
```

## Using the Template Factory

You can also use the centralized template factory function:

```typescript
import { generateEmailTemplate } from './emailTemplates';

// Welcome email
const welcomeEmail = generateEmailTemplate("welcome", {
  email: "user@example.com",
  firstName: "John",
  role: "doctor"
});

// Password reset email
const resetEmail = generateEmailTemplate("password_reset", {
  email: "user@example.com",
  firstName: "John",
  resetToken: "token-123"
});

// Profile completion reminder
const profileEmail = generateEmailTemplate("profile_completion_reminder", {
  email: "user@example.com",
  firstName: "John",
  role: "doctor",
  completionPercentage: 75,
  missingFields: ["Phone number", "Specialization"]
});
```

## Email Structure

All email templates follow a consistent structure:
- **Professional header** with MedScribe branding
- **Responsive design** that works on all devices
- **Clear call-to-action buttons**
- **Consistent typography and colors**
- **Both HTML and plain text versions**
- **Security and privacy considerations**

## Customization

Each template can be customized by:
1. Modifying the template files directly
2. Passing different data to the template functions
3. Extending the template interfaces for new data fields

## Integration with Email Service

These templates integrate seamlessly with the email service:

```typescript
import { generateEmailContent, sendEmailProduction } from './emailService';

// Generate email using the service
const emailOptions = generateEmailContent("welcome", {
  email: "user@example.com",
  firstName: "John",
  role: "doctor"
});

// Send the email
const success = await sendEmailProduction(emailOptions);
```

## Environment Variables

Make sure these environment variables are set:
- `NEXT_PUBLIC_APP_URL` - Your application URL for links
- `GOOGLE_CLIENT_ID` - Gmail API client ID
- `GOOGLE_CLIENT_SECRET` - Gmail API client secret
- `GMAIL_REFRESH_TOKEN` - Gmail API refresh token
- `GMAIL_USER` - Gmail user email for sending

## Best Practices

1. **Always include plain text versions** for accessibility
2. **Test emails across different clients** (Gmail, Outlook, etc.)
3. **Keep subject lines under 50 characters**
4. **Use clear, actionable CTAs**
5. **Include unsubscribe links where appropriate**
6. **Maintain consistent branding**
7. **Consider mobile responsiveness**
