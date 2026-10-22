# MedScribe 2.0 - Comprehensive Features and APIs Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Core Features by Role](#core-features-by-role)
4. [Convex Backend APIs](#convex-backend-apis)
5. [Next.js API Routes](#nextjs-api-routes)
6. [External API Integrations](#external-api-integrations)
7. [Feature Matrix](#feature-matrix)

---

## System Overview

**MedScribe 2.0** is a comprehensive healthcare management platform built with:
- **Frontend**: Next.js 15.3.3 (App Router), React 19, TypeScript
- **Backend**: Convex (real-time database)
- **Authentication**: NextAuth.js with JWT
- **UI Framework**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 4.0

### Key Technologies
- Real-time data synchronization via Convex WebSockets
- AI-powered SOAP note generation
- RAG (Retrieval-Augmented Generation) for medical knowledge
- Email automation via Gmail API
- Time-slot based appointment scheduling
- E-prescription management
- Drug interaction checking

---

## Database Schema

### Core Tables

#### Users & Authentication
- **users**: User accounts (doctor, patient, pharmacy, admin)
- **passwordResetTokens**: Password reset token management
- **emailPreferences**: User email notification preferences

#### Healthcare Providers
- **doctors**: Doctor profiles with credentials, specialties, availability
- **pharmacies**: Pharmacy directory with NCPDP IDs, locations, services
- **pharmacyStaff**: Pharmacy staff members

#### Patients
- **patients**: Patient profiles with demographics, MRN, insurance
- **patientMedicalHistory**: Medical conditions and diagnoses
- **patientAllergies**: Allergy records with severity
- **patientInsurance**: Insurance information

#### Clinical Documentation
- **soapNotes**: Enhanced SOAP notes with AI processing results
- **audioRecordings**: Audio files for transcription
- **sharedSoapNotes**: SOAP note sharing between providers
- **treatmentPlans**: Treatment plans with medication details

#### Appointments & Scheduling
- **doctorPatients**: Doctor-patient relationships
- **appointments**: Appointment records with status tracking
- **doctorAvailability**: Weekly availability templates
- **timeSlots**: Pre-generated appointment time slots
- **doctorExceptions**: Unavailability exceptions (vacation, sick days)
- **appointmentRescheduleRequests**: Patient reschedule requests

#### Referrals & Communication
- **referrals**: Inter-provider referrals with specialty matching
- **doctorPatientConversations**: Doctor-patient messaging threads
- **doctorPatientMessages**: Individual messages in conversations
- **chatSessions**: AI assistant chat sessions
- **chatMessages**: AI assistant messages with RAG context

#### Prescriptions & Pharmacy
- **prescriptions**: E-prescriptions with safety checks
- **prescriptionOrders**: Pharmacy order fulfillment
- **drugInteractions**: Drug interaction database

#### Notifications & Automation
- **notifications**: In-app notifications with categories and priorities
- **emailAutomation**: Scheduled email automation

---

## Core Features by Role

### Doctor Role Features

#### 1. Patient Management
- Assign/remove patients
- Patient search and filtering
- Patient statistics and overview
- View patient medical history, allergies, insurance
- Doctor-patient relationship management

#### 2. Clinical Documentation
- **SOAP Note Generation**:
  - Audio-to-SOAP transcription
  - Text-to-SOAP conversion
  - Enhanced AI pipeline with quality scoring
  - Specialty detection
  - Safety validation
  - Quality metrics and recommendations
- View and edit SOAP notes
- SOAP note sharing with other doctors
- SOAP note search and filtering

#### 3. Appointment Management
- Time-slot based scheduling
- Weekly availability template management
- View upcoming, today's, and week's appointments
- Appointment status updates (confirmed, checked-in, in-progress, completed)
- Appointment cancellation with slot release
- Appointment rescheduling with slot management
- Handle patient reschedule requests

#### 4. Referral System
- Create referrals to specialists
- Open referrals (no specific doctor)
- Accept/decline received referrals
- View sent and received referrals
- Referral status tracking
- Specialty-based referral matching

#### 5. Prescription Management
- E-prescription creation
- Drug interaction checking
- Allergy alerts
- Prescription status tracking
- Pharmacy selection and integration

#### 6. Treatment Planning
- Create comprehensive treatment plans
- Medication details with NDC/RxCUI codes
- Treatment goals and tracking
- Link treatments to SOAP notes
- Pharmacy integration

#### 7. AI Medical Assistant
- Context-aware clinical decision support
- RAG-enhanced responses
- Medical knowledge base integration
- Specialty-specific AI agents
- Chat session management

#### 8. Communication
- Secure messaging with patients
- Read receipts
- Message threading
- Unread message tracking

#### 9. Profile Management
- Medical credentials (license, NPI, DEA)
- Specialty and board certifications
- Practice information
- Availability schedule
- Accepting new patients status

### Patient Role Features

#### 1. Health Dashboard
- Personal health metrics
- Treatment progress tracking
- Medication adherence
- Health insights and trends

#### 2. Medical Records Access
- View SOAP notes (read-only)
- Search and filter medical history
- View treatment plans
- Access prescription history
- Medical history timeline

#### 3. Appointment Management
- Book appointments with preferred doctors
- View upcoming appointments
- Request appointment reschedules
- Appointment reminders
- Appointment history

#### 4. AI Health Assistant
- Personal health guidance
- Medical education
- Symptom tracking and analysis
- Health recommendations
- RAG-enhanced responses

#### 5. Communication
- Secure messaging with doctors
- Read receipts
- Message history

#### 6. Prescription Tracking
- View prescription status
- Pharmacy integration
- Delivery tracking
- Prescription history

#### 7. Profile Management
- Personal information
- Medical history management
- Allergy tracking
- Insurance information
- Preferred pharmacy selection

### Pharmacy Role Features

#### 1. Prescription Orders
- Receive prescription orders
- Process and fulfill orders
- Order status updates
- Delivery management
- Pickup coordination

#### 2. Inventory Management
- Track medication availability
- Order management

#### 3. Patient Communication
- Prescription status updates
- Delivery notifications

#### 4. Safety Checks
- Drug interaction verification
- Allergy verification
- Dosage validation

#### 5. Profile Management
- Pharmacy credentials (NCPDP ID, license, DEA)
- Location and hours
- Services offered
- Staff management

---

## Convex Backend APIs

### Users API (`convex/users.ts`)

#### Mutations
- `createUser`: Create new user account (credentials)
- `createOAuthUser`: Create OAuth user account
- `updateUser`: Update user information
- `createPasswordResetToken`: Generate password reset token
- `resetPasswordWithToken`: Reset password using token
- `deleteUserAccount`: Delete user and all related data

#### Queries
- `getUserByEmail`: Get user by email address
- `getUserById`: Get user by ID
- `validatePasswordResetToken`: Validate reset token
- `getInactiveUsers`: Get users inactive for specified period

#### Actions
- `generatePasswordResetToken`: Generate and send password reset email

### Doctors API (`convex/doctors.ts`)

#### Mutations
- `createOrUpdateDoctorProfile`: Create or update doctor profile
- `updateDoctorProfile`: Update existing doctor profile
- `updateDoctorStatus`: Update doctor active status
- `updateDoctorAvailability`: Update weekly availability schedule
- `updateAcceptingNewPatients`: Update accepting new patients status
- `seedSampleDoctors`: Seed sample doctors (development)

#### Queries
- `getDoctorProfile`: Get doctor by user ID
- `getDoctorById`: Get doctor by doctor ID
- `getById`: Alias for getDoctorById
- `getDoctorByUserId`: Get doctor by user ID
- `getCurrentDoctor`: Get current doctor profile
- `getAll`: Get all doctors (excluding specified)
- `searchDoctors`: Enhanced doctor search with filters
- `getAllActiveDoctors`: Get all active doctors
- `getDoctorsBySpecialization`: Get doctors by specialty
- `getAvailableSpecialties`: Get list of available specialties
- `getDoctorStats`: Get doctor statistics

### Patients API (`convex/patients.ts`)

#### Mutations
- `createPatientProfile`: Create patient profile
- `updatePatientProfile`: Update patient profile
- `addMedicalHistory`: Add medical history entry
- `addAllergy`: Add allergy record
- `addInsurance`: Add insurance information
- `deleteMedicalHistory`: Delete medical history entry
- `deleteAllergy`: Delete allergy record
- `deleteInsurance`: Delete insurance record

#### Queries
- `getPatientByUserId`: Get patient by user ID
- `getPatientById`: Get patient by patient ID
- `getPatientMedicalHistory`: Get patient's medical history
- `getPatientAllergies`: Get patient's allergies
- `getPatientInsurance`: Get patient's insurance

### Appointments API (`convex/appointments.ts`)

#### Mutations
- `createWithSlot`: Create appointment using time slot (RECOMMENDED)
- `create`: Create appointment (legacy, deprecated)
- `updateStatus`: Update appointment status
- `reschedule`: Reschedule appointment
- `rescheduleWithSlot`: Reschedule with slot management
- `cancelWithSlotRelease`: Cancel appointment and release slot
- `cancel`: Cancel appointment (legacy, deprecated)

#### Queries
- `getByPatient`: Get appointments for a patient
- `getByDoctor`: Get appointments for a doctor
- `getUpcomingByDoctor`: Get upcoming appointments for doctor
- `getUpcomingByPatient`: Get upcoming appointments for patient
- `getById`: Get appointment by ID
- `getTodayByDoctor`: Get today's appointments for doctor
- `getWeekByDoctor`: Get week's appointments for doctor

### SOAP Notes API (`convex/soapNotes.ts`)

#### Mutations
- `create`: Create SOAP note from enhanced API response
- `update`: Update SOAP note
- `remove`: Delete SOAP note
- `addAssistance`: Add doctor assistance to SOAP note

#### Queries
- `getByPatientId`: Get SOAP notes by patient ID
- `getById`: Get SOAP note by ID
- `getRecentByPatientId`: Get recent SOAP notes (last 5)
- `getStatsByPatientId`: Get SOAP note statistics
- `searchByContent`: Search SOAP notes by content
- `getBySessionId`: Get SOAP note by session ID
- `getBySpecialty`: Get SOAP notes by specialty
- `getBySafetyStatus`: Get SOAP notes by safety status
- `getByStatus`: Get SOAP notes by status

### Treatment Plans API (`convex/treatmentPlans.ts`)

#### Mutations
- `create`: Create treatment plan
- `update`: Update treatment plan
- `remove`: Delete treatment plan

#### Queries
- `getByDoctorPatientId`: Get treatment plans by doctor-patient relationship
- `getActiveByDoctorPatientId`: Get active treatment plans
- `getById`: Get treatment plan by ID
- `getWithDetailsById`: Get treatment plan with full details
- `getWithDetailsByDoctorPatientId`: Get treatment plans with details
- `getWithDetailsByPatientId`: Get treatment plans by patient ID

### Referrals API (`convex/referrals.ts`)

#### Mutations
- `create`: Create referral
- `accept`: Accept referral
- `decline`: Decline referral
- `complete`: Mark referral as completed
- `cancel`: Cancel referral

#### Queries
- `getByFromDoctor`: Get referrals sent by doctor
- `getByToDoctor`: Get referrals received by doctor
- `getReceivedReferrals`: Alias for getByToDoctor
- `getSentReferrals`: Alias for getByFromDoctor
- `getByPatient`: Get referrals for a patient
- `getById`: Get referral by ID
- `getPendingBySpecialty`: Get pending referrals by specialty
- `getPendingCountForDoctor`: Get pending referral count
- `getRecentActivity`: Get recent referral activity
- `getStatsByDoctor`: Get referral statistics
- `searchReferrals`: Search referrals with filters

### Prescriptions API (`convex/prescriptions.ts`)

#### Mutations
- `create`: Create prescription
- `updateStatus`: Update prescription status
- `addSafetyChecks`: Add drug interaction and allergy checks

#### Actions
- `sendElectronically`: Send prescription to pharmacy electronically

#### Queries
- `getByPatientId`: Get prescriptions for a patient
- `getByDoctorId`: Get prescriptions for a doctor
- `getById`: Get prescription by ID

### Pharmacies API (`convex/pharmacies.ts`)

#### Mutations
- `createPharmacy`: Create pharmacy profile (for pharmacy users)
- `updatePharmacy`: Update pharmacy profile
- `create`: Add pharmacy to directory
- `update`: Update pharmacy information
- `setPatientPreferredPharmacy`: Set patient's preferred pharmacy
- `seedPharmacyData`: Seed sample pharmacy data

#### Queries
- `getPharmacyByUserId`: Get pharmacy by user ID
- `getById`: Get pharmacy by ID
- `getByNcpdpId`: Get pharmacy by NCPDP ID
- `searchByZipCode`: Search pharmacies by zip code
- `searchByChain`: Search pharmacies by chain name
- `getPatientPreferredPharmacy`: Get patient's preferred pharmacy
- `getAllActive`: Get all active pharmacies
- `getActivePharmaciesForPrescription`: Get pharmacies for prescription selection

### Chat Sessions API (`convex/chatSessions.ts`)

#### Mutations
- `createSession`: Create new chat session
- `updateSession`: Update session metadata
- `archiveSession`: Archive chat session
- `deleteSession`: Delete session and messages
- `createOrGetDoctorPatientSession`: Create or get doctor-patient session

#### Queries
- `getUserSessions`: Get all sessions for a user
- `getSession`: Get specific chat session
- `getRecentSessions`: Get recent sessions with limit
- `getDoctorPatientSession`: Get doctor-patient chat session

### Chat Messages API (`convex/chatMessages.ts`)

#### Mutations
- `addMessage`: Add message to chat session
- `deleteMessage`: Delete specific message

#### Queries
- `getSessionMessages`: Get all messages for a session
- `getRecentMessages`: Get recent messages with limit
- `getSessionStats`: Get message statistics for session

### Notifications API (`convex/notifications.ts`)

#### Mutations
- `createNotification`: Create comprehensive notification
- `markAsRead`: Mark notification as read
- `markAllAsRead`: Mark all notifications as read for user
- `deleteNotification`: Delete notification
- `createTestNotification`: Create test notification
- `notifySOAPShared`: Notify about SOAP note sharing
- `notifyReferralReceived`: Notify about referral received
- `notifyAppointmentScheduled`: Notify about appointment scheduled

#### Queries
- `getByUser`: Get notifications for a user
- `getUnreadCount`: Get unread notification count
- `getByCategory`: Get notifications by category
- `getByPriority`: Get notifications by priority
- `getByType`: Get notifications by type

### Doctor-Patient Relationships API (`convex/doctorPatients.ts`)

#### Mutations
- `assignPatient`: Assign patient to doctor
- `deactivateRelationship`: Deactivate doctor-patient relationship

#### Queries
- `getPatientsByDoctor`: Get patients assigned to doctor
- `getDoctorsByPatient`: Get doctors assigned to patient
- `isPatientAssignedToDoctor`: Check if patient is assigned
- `getDoctorPatientRelationship`: Get relationship by IDs
- `getDoctorPatientStats`: Get relationship statistics
- `getById`: Get relationship by ID

### Shared SOAP Notes API (`convex/sharedSoapNotes.ts`)

#### Mutations
- `shareSOAPNote`: Share SOAP note with doctor
- `markAsRead`: Mark shared note as read
- `updateActionStatus`: Update action status (assistance, appointment, referral, treatment)
- `shareViaReferral`: Share SOAP note via referral
- `removeSharedSOAPNote`: Remove shared SOAP note

#### Queries
- `getSharedSOAPNotesForDoctor`: Get shared notes for doctor
- `getSharedNotesForDoctor`: Get shared notes for specific patient-doctor
- `getCompletedActionsForDoctor`: Get completed actions
- `getSharedSOAPNotesByPatient`: Get shared notes by patient
- `getUnreadCountForDoctor`: Get unread shared notes count
- `getSharedSOAPNoteById`: Get shared note by ID
- `getShareHistoryForSOAPNote`: Get share history for SOAP note

### Audio Recordings API (`convex/audioRecordings.ts`)

#### Mutations
- `create`: Create audio recording record
- `updateStatus`: Update recording status
- `remove`: Delete audio recording

#### Queries
- `getByPatientId`: Get recordings by patient ID
- `getById`: Get recording by ID
- `getByStatus`: Get recordings by status
- `getRecentByPatientId`: Get recent recordings
- `getStatsByPatientId`: Get recording statistics

### Doctor Availability API (`convex/doctorAvailability.ts`)

#### Mutations
- `setDoctorAvailability`: Set availability for specific day
- `setWeeklyAvailability`: Bulk update weekly availability
- `deleteDoctorAvailability`: Delete availability for day

#### Queries
- `getDoctorAvailability`: Get all availability for doctor
- `getDoctorAvailabilityByDay`: Get availability for specific day
- `getAllDoctorsAvailability`: Get availability for all active doctors
- `validateAvailabilityTimes`: Validate availability times
- `getDoctorAvailabilitySummary`: Get availability summary

### Time Slots API (`convex/timeSlots.ts`)

#### Mutations
- `generateTimeSlots`: Generate time slots for date range
- `bookTimeSlot`: Book a time slot
- `releaseTimeSlot`: Release a time slot
- `blockTimeSlots`: Block time slots for unavailability

#### Queries
- `getAvailableSlots`: Get available slots for doctor and date
- `getAvailableSlotsInRange`: Get available slots in date range
- `getDoctorDaySlots`: Get all slots for doctor on date
- `getDoctorSlotStats`: Get slot statistics for doctor

### Doctor Exceptions API (`convex/doctorExceptions.ts`)

#### Mutations
- `createDoctorException`: Create unavailability exception
- `updateDoctorException`: Update exception
- `deleteDoctorException`: Delete exception and restore slots

#### Queries
- `getDoctorExceptions`: Get exceptions for date range
- `getExceptionsByType`: Get exceptions by type
- `checkDoctorAvailabilityOnDate`: Check availability on specific date
- `getRecurringExceptions`: Get recurring exceptions with future instances
- `getDoctorExceptionStats`: Get exception statistics

### Appointment Reschedule Requests API (`convex/appointmentRescheduleRequests.ts`)

#### Mutations
- `createRescheduleRequest`: Create reschedule request
- `approveRequest`: Approve reschedule request
- `rejectRequest`: Reject reschedule request
- `cancelRequest`: Cancel reschedule request (patient)

#### Queries
- `getByDoctor`: Get requests for doctor
- `getByPatient`: Get requests for patient

### Prescription Orders API (`convex/prescriptionOrders.ts`)

#### Mutations
- `createPrescriptionOrder`: Create prescription order
- `updateOrderStatus`: Update order status
- `cancelOrder`: Cancel order

#### Queries
- `getOrdersForPharmacy`: Get orders for pharmacy
- `getOrdersForPatient`: Get orders for patient
- `getOrdersForDoctor`: Get orders for doctor
- `getOrderById`: Get order with full details
- `getOrdersByTreatmentPlanId`: Get orders by treatment plan
- `getPharmacyOrderStats`: Get order statistics for pharmacy

### Doctor-Patient Conversations API (`convex/doctorPatientConversations.ts`)

#### Mutations
- `createOrGetConversation`: Create or get conversation
- `sendMessage`: Send message in conversation

#### Queries
- `getConversation`: Get conversation between doctor and patient
- `getDoctorConversations`: Get all conversations for doctor
- `getPatientConversations`: Get all conversations for patient
- `getMessages`: Get messages for conversation
- `markMessagesAsRead`: Mark messages as read
- `getUnreadCount`: Get unread message count

### Email Automation API (`convex/emailAutomation.ts`)

#### Mutations
- `scheduleEmail`: Schedule email for delivery
- `markEmailAsSent`: Mark email as sent
- `markEmailAsFailed`: Mark email as failed with retry logic
- `cancelScheduledEmail`: Cancel scheduled email
- `updateEmailPreferences`: Update user email preferences

#### Actions
- `sendScheduledEmail`: Send scheduled email (scheduled action)

#### Queries
- `getEmailById`: Get email by ID
- `getUserEmailPreferences`: Get user email preferences
- `getRecentEmailByType`: Get recent email by type

### Slot Availability API (`convex/slotAvailability.ts`)

#### Mutations
- `reserveSlotTemporarily`: Reserve slot temporarily (for booking flow)

#### Queries
- `getMultiDoctorAvailability`: Get availability for multiple doctors
- `getNextAvailableSlot`: Get next available slot for doctor
- `checkSlotAvailability`: Check if specific slot is available
- `getWeeklyAvailabilitySummary`: Get weekly availability summary
- `findAlternativeSlots`: Find alternative slots when preferred unavailable
- `bulkCheckAvailability`: Bulk check multiple slots
- `getPeakAvailabilityTimes`: Get peak availability times

---

## Next.js API Routes

### Authentication Routes (`app/api/auth/`)

#### `/api/auth/[...nextauth]/route.ts`
- NextAuth.js authentication handler
- Supports credentials and OAuth providers
- JWT token generation
- Session management

#### `/api/auth/forgot-password/route.ts`
- POST: Request password reset
- Generates reset token
- Sends reset email

#### `/api/auth/reset-password/route.ts`
- POST: Reset password with token
- Validates token
- Updates password

#### `/api/auth/send-otp/route.ts`
- POST: Send OTP for verification
- Stores OTP temporarily

#### `/api/auth/verify-otp/route.ts`
- POST: Verify OTP
- Validates OTP code

#### `/api/auth/send-welcome-email/route.ts`
- POST: Send welcome email to new user
- Uses email templates

#### `/api/auth/delete-account/route.ts`
- POST: Delete user account
- Cascades deletion of related data

### Doctor Routes (`app/api/doctor/`)

#### `/api/doctor/create-profile/route.ts`
- POST: Create doctor profile
- Validates credentials
- Creates doctor record

#### `/api/doctor/assistant/chat/route.ts`
- POST: Doctor AI assistant chat
- RAG-enhanced responses
- Context-aware medical assistance

### Patient Routes (`app/api/patient/`)

#### `/api/patient/create-profile/route.ts`
- POST: Create patient profile
- Validates patient data
- Creates patient record

#### `/api/patient/assistant/chat/route.ts`
- POST: Patient AI assistant chat
- Health guidance and education
- RAG-enhanced responses

#### `/api/patient/soap/route.ts`
- POST: Process audio file for SOAP generation
- Uploads audio file
- Calls external SOAP API
- Returns enhanced SOAP response

#### `/api/patient/soap/text/route.ts`
- POST: Process text for SOAP generation
- Validates text input
- Calls external SOAP API
- Returns enhanced SOAP response

### Health Check Routes (`app/api/health/`)

#### `/api/health/soap/route.ts`
- GET: Health check for SOAP API
- Verifies external API connectivity

---

## External API Integrations

### MedScribe SOAP API (`lib/api/medscribe-api.ts`)

#### Class: `MedScribeAPI`

**Methods:**
- `processAudio(audioFile, patientId, onProgress)`: Process audio file for SOAP generation
- `processText(text, patientId, onProgress)`: Process text for SOAP generation
- `validateAudioFile(file)`: Validate audio file before processing
- `validateText(text)`: Validate text before processing
- `checkHealth()`: Check API health status
- `getConfig()`: Get API configuration
- `updateConfig(config)`: Update API configuration

**Features:**
- Retry logic with exponential backoff
- Progress callbacks
- Timeout handling
- Error handling and validation

### RAG API Service (`lib/services/rag-api.ts`)

#### Class: `RAGAPIService`

**Methods:**
- `search(params)`: Search for role-specific information using RAG
  - Endpoints: `/search/doctor`, `/search/patient`
  - Returns: Relevant documents, structured responses, context
- `embed(params)`: Store data in RAG system (embedding)
  - Endpoint: `/embed`
  - Stores: Event data with metadata
- `getSummary(roleType, roleId)`: Get knowledge base summary
  - Endpoint: `/{roleType}/{roleId}/summary`
  - Returns: Statistics and summary
- `healthCheck()`: Health check for RAG system
  - Endpoint: `/health`

**Convenience Functions:**
- `searchDoctorRAG(doctorId, query, options)`: Doctor-specific search
- `searchPatientRAG(patientId, query, options)`: Patient-specific search
- `embedDoctorData(doctorId, eventType, data, metadata)`: Embed doctor data
- `embedPatientData(patientId, eventType, data, metadata)`: Embed patient data

### Email Service (`convex/emailService.ts`)

**Functions:**
- `generateEmailContent(emailType, templateData)`: Generate email content from templates
- `sendEmail(emailOptions)`: Send email via Gmail API

**Email Types Supported:**
- `welcome`: Welcome email for new users
- `profile_completion_reminder`: Profile completion reminders
- `appointment_reminder_24h`: 24-hour appointment reminder
- `appointment_reminder_1h`: 1-hour appointment reminder
- `appointment_followup`: Post-appointment follow-up
- `treatment_reminder`: Treatment reminders
- `inactive_user_reengagement`: Re-engagement for inactive users
- `security_alert`: Security alerts
- `system_maintenance`: System maintenance notifications
- `password_reset`: Password reset emails

**Gmail API Integration:**
- OAuth2 token refresh
- Base64url encoding
- Direct Gmail API calls

### RAG Hooks (`lib/services/`)

#### `appointment-rag-hooks.ts`
- Appointment-related RAG operations
- Embedding appointment data
- Searching appointment context

#### `medical-rag-hooks.ts`
- Medical knowledge RAG operations
- Clinical decision support

#### `soap-rag-hooks.ts`
- SOAP note RAG operations
- Embedding SOAP notes
- Searching SOAP history

#### `user-rag-hooks.ts`
- User-specific RAG operations
- Profile and preference embedding

---

## Feature Matrix

### Authentication & User Management
| Feature | Doctor | Patient | Pharmacy | Admin |
|---------|--------|---------|----------|-------|
| User Registration | ✅ | ✅ | ✅ | ✅ |
| OAuth Login | ✅ | ✅ | ✅ | ✅ |
| Password Reset | ✅ | ✅ | ✅ | ✅ |
| Email Verification | ✅ | ✅ | ✅ | ✅ |
| OTP Verification | ✅ | ✅ | ✅ | ✅ |
| Account Deletion | ✅ | ✅ | ✅ | ✅ |
| Email Preferences | ✅ | ✅ | ✅ | ✅ |

### Profile Management
| Feature | Doctor | Patient | Pharmacy |
|---------|--------|---------|----------|
| Profile Creation | ✅ | ✅ | ✅ |
| Profile Updates | ✅ | ✅ | ✅ |
| Credentials Management | ✅ | - | ✅ |
| Medical History | - | ✅ | - |
| Allergies Tracking | - | ✅ | - |
| Insurance Information | - | ✅ | - |
| Availability Schedule | ✅ | - | - |
| Pharmacy Services | - | - | ✅ |

### Clinical Documentation
| Feature | Doctor | Patient |
|---------|--------|---------|
| SOAP Note Generation (Audio) | ✅ | ✅ |
| SOAP Note Generation (Text) | ✅ | ✅ |
| SOAP Note Viewing | ✅ | ✅ (Read-only) |
| SOAP Note Editing | ✅ | ❌ |
| SOAP Note Sharing | ✅ | ✅ |
| Quality Scoring | ✅ | ✅ |
| Specialty Detection | ✅ | ✅ |
| Safety Validation | ✅ | ✅ |

### Appointment Management
| Feature | Doctor | Patient |
|---------|--------|---------|
| Create Appointment | ✅ | ✅ |
| View Appointments | ✅ | ✅ |
| Update Status | ✅ | ❌ |
| Cancel Appointment | ✅ | ✅ |
| Reschedule Appointment | ✅ | ✅ (Request) |
| Reschedule Requests | ✅ (Approve/Reject) | ✅ (Create) |
| Availability Management | ✅ | ❌ |
| Time Slot Generation | ✅ | ❌ |
| Exception Management | ✅ | ❌ |

### Referrals
| Feature | Doctor | Patient |
|---------|--------|---------|
| Create Referral | ✅ | ❌ |
| Accept Referral | ✅ | ❌ |
| Decline Referral | ✅ | ❌ |
| View Sent Referrals | ✅ | ✅ |
| View Received Referrals | ✅ | ❌ |
| Specialty Matching | ✅ | ❌ |

### Prescriptions
| Feature | Doctor | Patient | Pharmacy |
|---------|--------|---------|----------|
| Create Prescription | ✅ | ❌ | ❌ |
| View Prescriptions | ✅ | ✅ | ✅ |
| Drug Interaction Check | ✅ | ❌ | ✅ |
| Allergy Alerts | ✅ | ❌ | ✅ |
| Send to Pharmacy | ✅ | ❌ | ❌ |
| Process Order | ❌ | ❌ | ✅ |
| Update Order Status | ❌ | ❌ | ✅ |
| Track Prescription | ❌ | ✅ | ✅ |

### Treatment Plans
| Feature | Doctor | Patient |
|---------|--------|---------|
| Create Treatment Plan | ✅ | ❌ |
| View Treatment Plans | ✅ | ✅ |
| Update Treatment Plan | ✅ | ❌ |
| Medication Details | ✅ | ✅ |
| Pharmacy Integration | ✅ | ✅ |

### Communication
| Feature | Doctor | Patient |
|---------|--------|---------|
| Doctor-Patient Messaging | ✅ | ✅ |
| Read Receipts | ✅ | ✅ |
| Message History | ✅ | ✅ |
| Unread Tracking | ✅ | ✅ |

### AI Assistant
| Feature | Doctor | Patient |
|---------|--------|---------|
| Medical Assistant Chat | ✅ | ✅ |
| RAG-Enhanced Responses | ✅ | ✅ |
| Context Awareness | ✅ | ✅ |
| Chat Session Management | ✅ | ✅ |
| Medical Knowledge Base | ✅ | ✅ |

### Notifications
| Feature | Doctor | Patient | Pharmacy |
|---------|--------|---------|----------|
| In-App Notifications | ✅ | ✅ | ✅ |
| Email Notifications | ✅ | ✅ | ✅ |
| SMS Notifications | ✅ | ✅ | ❌ |
| Push Notifications | ✅ | ✅ | ❌ |
| Notification Categories | ✅ | ✅ | ✅ |
| Priority Levels | ✅ | ✅ | ✅ |

### Analytics & Reporting
| Feature | Doctor | Patient | Pharmacy |
|---------|--------|---------|----------|
| Patient Statistics | ✅ | ❌ | ❌ |
| Appointment Statistics | ✅ | ❌ | ❌ |
| SOAP Note Statistics | ✅ | ✅ | ❌ |
| Prescription Statistics | ✅ | ❌ | ✅ |
| Order Statistics | ❌ | ❌ | ✅ |
| Referral Statistics | ✅ | ❌ | ❌ |

---

## API Endpoint Summary

### Convex Functions: **150+**
- Users: 8 functions
- Doctors: 15 functions
- Patients: 10 functions
- Appointments: 12 functions
- SOAP Notes: 11 functions
- Treatment Plans: 8 functions
- Referrals: 13 functions
- Prescriptions: 6 functions
- Pharmacies: 12 functions
- Chat Sessions: 7 functions
- Chat Messages: 5 functions
- Notifications: 12 functions
- Doctor-Patient Relationships: 7 functions
- Shared SOAP Notes: 9 functions
- Audio Recordings: 6 functions
- Doctor Availability: 7 functions
- Time Slots: 5 functions
- Doctor Exceptions: 6 functions
- Reschedule Requests: 5 functions
- Prescription Orders: 8 functions
- Doctor-Patient Conversations: 6 functions
- Email Automation: 7 functions
- Slot Availability: 8 functions

### Next.js API Routes: **14**
- Authentication: 7 routes
- Doctor: 2 routes
- Patient: 4 routes
- Health: 1 route

### External API Integrations: **3**
- MedScribe SOAP API
- RAG API Service
- Gmail API (Email Service)

---

## Data Flow Examples

### SOAP Note Generation Flow
1. Patient/Doctor uploads audio or enters text
2. Next.js API route receives request (`/api/patient/soap` or `/api/patient/soap/text`)
3. API calls external MedScribe SOAP API
4. External API processes and returns enhanced SOAP data
5. Convex mutation `soapNotes.create` stores SOAP note
6. RAG embedding hooks store SOAP note in knowledge base
7. Notifications sent to relevant users
8. SOAP note available for viewing/sharing

### Appointment Booking Flow
1. Patient selects doctor and date
2. Convex query `timeSlots.getAvailableSlots` returns available slots
3. Patient selects time slot
4. Convex mutation `appointments.createWithSlot` creates appointment
5. Time slot marked as booked via `timeSlots.bookTimeSlot`
6. Notifications sent to patient and doctor
7. Email automation scheduled for reminders
8. Appointment appears in both user dashboards

### Referral Flow
1. Doctor creates referral via `referrals.create`
2. Notification sent to receiving doctor
3. Receiving doctor accepts via `referrals.accept`
4. Doctor-patient relationship created if needed
5. SOAP note shared automatically if attached
6. Notifications sent to referring doctor and patient
7. Referral status tracked throughout process

### Prescription Flow
1. Doctor creates prescription via `prescriptions.create`
2. Safety checks performed (drug interactions, allergies)
3. Prescription order created via `prescriptionOrders.createPrescriptionOrder`
4. Order sent to pharmacy
5. Pharmacy processes order via `prescriptionOrders.updateOrderStatus`
6. Patient receives status updates
7. Order fulfilled and tracked

---

## Security & Compliance

### HIPAA Compliance Measures
- Role-based access control
- Data encryption in transit
- Secure authentication (JWT, OAuth)
- Audit logging via notifications
- Data minimization principles
- Secure password handling (bcrypt)

### Access Control
- Middleware-based route protection
- Role verification on all operations
- Patient data isolation
- Doctor data isolation
- Pharmacy data isolation

---

## Performance Optimizations

### Database
- Comprehensive indexing strategy
- Query optimization
- Real-time subscriptions via Convex
- Efficient data relationships

### Frontend
- React Server Components
- Code splitting
- Image optimization
- Virtual scrolling for large lists
- Debounced search

### Caching
- Convex automatic query caching
- Static generation where possible
- Service worker for offline support

---

## Future Enhancements

### Planned Features
- Video consultation integration
- Advanced analytics dashboard
- Mobile applications (iOS/Android)
- Enhanced drug interaction database
- Multi-language support
- Advanced reporting
- Integration with EHR systems
- Wearable device integration
- Telemedicine capabilities

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Total API Endpoints**: 164+  
**Total Features**: 100+  

