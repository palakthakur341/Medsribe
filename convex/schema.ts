import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.optional(v.string()), // Optional for OAuth users
    role: v.union(v.literal("doctor"), v.literal("patient"), v.literal("admin"), v.literal("pharmacy")),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),
    twoFactorEnabled: v.boolean(),
    // OAuth fields
    provider: v.optional(v.string()), // "credentials", "google", etc.
    providerId: v.optional(v.string()), // OAuth provider user ID
    name: v.optional(v.string()), // Full name from OAuth
    image: v.optional(v.string()), // Profile image from OAuth
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_role_active", ["role", "isActive"])
    .index("by_provider", ["provider"])
    .index("by_provider_id", ["provider", "providerId"]),

  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"])
    .index("by_expires", ["expiresAt"])
    .index("by_user_active", ["userId", "isUsed"]),

  patients: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("M"), v.literal("F"), v.literal("O"), v.literal("U")),
    primaryPhone: v.string(),
    secondaryPhone: v.optional(v.string()),
    email: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    mrn: v.string(),
    nationalId: v.optional(v.string()),
    bloodType: v.optional(v.union(
      v.literal("A+"), v.literal("A-"), v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"), v.literal("O+"), v.literal("O-")
    )),
    emergencyContactName: v.string(),
    emergencyContactPhone: v.string(),
    emergencyContactRelation: v.string(),
    primaryCarePhysicianId: v.optional(v.id("doctors")),
    preferredLanguage: v.optional(v.string()),
    // Pharmacy preferences
    preferredPharmacy: v.optional(v.object({
      ncpdpId: v.string(),
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    })),
    consentForTreatment: v.boolean(),
    consentForDataSharing: v.boolean(),
    advanceDirectives: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
  })
    .index("by_user_id", ["userId"])
    .index("by_mrn", ["mrn"])
    .index("by_primary_care", ["primaryCarePhysicianId"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_email", ["email"])
    .index("by_phone", ["primaryPhone"])
    .index("by_location", ["city", "state"])
    .index("by_active", ["isActive"]),

  patientMedicalHistory: defineTable({
    patientId: v.id("patients"),
    condition: v.string(),
    diagnosisDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  patientAllergies: defineTable({
    patientId: v.id("patients"),
    allergen: v.string(),
    reaction: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("Mild"),
      v.literal("Moderate"),
      v.literal("Severe")
    )),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  patientInsurance: defineTable({
    patientId: v.id("patients"),
    providerName: v.string(),
    policyNumber: v.string(),
    coverageDetails: v.optional(v.string()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  doctors: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    title: v.optional(v.string()),
    licenseNumber: v.string(),
    npiNumber: v.optional(v.string()),
    deaNumber: v.optional(v.string()),
    primarySpecialty: v.string(),
    secondarySpecialties: v.optional(v.array(v.string())),
    boardCertifications: v.optional(v.array(v.string())),
    medicalSchool: v.optional(v.string()),
    residency: v.optional(v.string()),
    fellowship: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    phone: v.string(),
    email: v.string(),
    practiceName: v.optional(v.string()),
    department: v.optional(v.string()),
    hospitalAffiliations: v.optional(v.array(v.string())),
    isAcceptingNewPatients: v.boolean(),
    consultationFee: v.optional(v.number()),
    availabilitySchedule: v.optional(v.object({
      monday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      tuesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      wednesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      thursday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      friday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      saturday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      sunday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
    })),
    languagesSpoken: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_license", ["licenseNumber"])
    .index("by_npi", ["npiNumber"])
    .index("by_specialty", ["primarySpecialty"])
    .index("by_active_verified", ["isActive", "isVerified"])
    .index("by_accepting_patients", ["isAcceptingNewPatients", "isActive"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_department", ["department"]),

  audioRecordings: defineTable({
    patientId: v.id("patients"),
    fileName: v.string(),
    fileSize: v.number(),
    duration: v.optional(v.number()),
    mimeType: v.string(),
    storageId: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient_id", ["patientId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  soapNotes: defineTable({
    // Core identifiers
    patientId: v.id("patients"),
    audioRecordingId: v.optional(v.id("audioRecordings")),
    status: v.optional(v.string()),
    timestamp: v.number(),

    // Main data structure containing all SOAP processing results
    data: v.optional(v.object({
      // Enhanced pipeline fields
      session_id: v.string(),
      patient_id: v.string(),
      enhanced_pipeline: v.boolean(),

      // Transcription (only for process-audio)
      transcription: v.optional(v.object({
        text: v.string(),
        confidence: v.number(),
        language: v.string(),
        duration: v.number(),
      })),

      validation_result: v.object({
        validated_text: v.string(),
        corrections: v.array(v.any()),
        flags: v.array(v.any()),
        confidence: v.number(),
      }),

      // Specialty detection
      specialty_detection: v.object({
        specialty: v.string(),
        confidence: v.number(),
        reasoning: v.string(),
        templates: v.any(),
      }),

      // Main SOAP notes data structure
      soap_notes: v.object({
        // Structured SOAP notes
        soap_notes: v.object({
          subjective: v.object({
            chief_complaint: v.string(),
            history_present_illness: v.string(),
            review_of_systems: v.array(v.string()),
            past_medical_history: v.array(v.string()),
            medications: v.array(v.string()),
            allergies: v.array(v.string()),
            social_history: v.string(),
          }),
          objective: v.object({
            vital_signs: v.any(), // Flexible object for various vital signs
            physical_exam: v.any(), // Flexible object for exam findings
            diagnostic_results: v.array(v.string()),
            mental_status: v.string(),
            functional_status: v.string(),
          }),
          assessment: v.object({
            primary_diagnosis: v.object({
              diagnosis: v.string(),
              icd10_code: v.string(),
              confidence: v.number(),
              severity: v.union(
                v.literal("mild"),
                v.literal("moderate"),
                v.literal("severe")
              ),
              clinical_reasoning: v.string(),
            }),
            differential_diagnoses: v.array(v.object({
              diagnosis: v.string(),
              icd10_code: v.string(),
              probability: v.number(),
              ruling_out_criteria: v.string(),
            })),
            problem_list: v.array(v.object({
              problem: v.string(),
              status: v.union(
                v.literal("active"),
                v.literal("resolved"),
                v.literal("chronic")
              ),
              priority: v.union(
                v.literal("high"),
                v.literal("medium"),
                v.literal("low")
              ),
            })),
            risk_level: v.union(
              v.literal("low"),
              v.literal("moderate"),
              v.literal("high")
            ),
            risk_factors: v.array(v.string()),
            prognosis: v.string(),
          }),
          plan: v.object({
            diagnostic_workup: v.array(v.string()),
            treatments: v.array(v.string()),
            medications: v.array(v.string()),
            follow_up: v.array(v.object({
              provider: v.string(),
              timeframe: v.string(),
              urgency: v.union(
                v.literal("routine"),
                v.literal("urgent"),
                v.literal("stat")
              ),
            })),
            patient_education: v.array(v.string()),
            referrals: v.array(v.string()),
          }),
          clinical_notes: v.string(),
        }),

        // Quality metrics at soap_notes level
        quality_metrics: v.object({
          completeness_score: v.number(),
          clinical_accuracy: v.number(),
          documentation_quality: v.number(),
          red_flags: v.array(v.string()),
          missing_information: v.array(v.string()),
        }),

        // SOAP notes metadata
        session_id: v.string(),
        specialty: v.string(),

      }),

      // Top-level quality metrics
      quality_metrics: v.object({
        completeness_score: v.number(),
        clinical_accuracy: v.number(),
        documentation_quality: v.number(),
        red_flags: v.array(v.string()),
        missing_information: v.array(v.string()),
      }),

      // Safety checks
      safety_check: v.object({
        is_safe: v.boolean(),
        red_flags: v.array(v.string()),
        critical_items: v.array(v.string()),
      }),

      // Quality assessment
      qa_results: v.object({
        quality_score: v.number(),
        errors: v.array(v.string()),
        warnings: v.array(v.string()),
        recommendations: v.array(v.string()),
        critical_flags: v.array(v.any()),
        approved: v.boolean(),
      }),

      // Document generation results
      document: v.optional(v.object({
        document_path: v.optional(v.string()),
        success: v.boolean(),
        error: v.optional(v.string()),
      })),

    })),



    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_patient", ["data.patient_id"])
  .index("by_session", ["data.session_id"])
  .index("by_status", ["status"])
  .index("by_timestamp", ["timestamp"])
  .index("by_specialty", ["data.specialty_detection.specialty"])
  .index("by_safety", ["data.safety_check.is_safe"])
  .index("by_patient_id", ["patientId"])
  .index("by_audio_recording_id", ["audioRecordingId"])
  .index("by_created_at", ["createdAt"]),

  sharedSoapNotes: defineTable({
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    sharedBy: v.union(v.id("patients"), v.id("doctors")),
    sharedByType: v.union(v.literal("patient"), v.literal("doctor")),
    sharedWith: v.id("doctors"),
    shareType: v.union(
      v.literal("direct_share"),
      v.literal("referral_share")
    ),
    referralId: v.optional(v.id("referrals")),
    message: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    // Action tracking fields
    actionStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_sent"),
      v.literal("treatment_initiated")
    )),
    actionTakenAt: v.optional(v.number()),
    actionDetails: v.optional(v.string()),
    relatedActionId: v.optional(v.union(
      v.id("appointments"),
      v.id("referrals"),
      v.id("treatmentPlans")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_soap_note_id", ["soapNoteId"])
    .index("by_shared_by", ["sharedBy"])
    .index("by_shared_by_type", ["sharedByType"])
    .index("by_shared_with", ["sharedWith"])
    .index("by_patient_id", ["patientId"])
    .index("by_share_type", ["shareType"])
    .index("by_referral_id", ["referralId"])
    .index("by_is_read", ["isRead"])
    .index("by_shared_with_unread", ["sharedWith", "isRead"])
    .index("by_shared_by_type_share", ["sharedByType", "shareType"]),

  doctorPatients: defineTable({
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    assignedBy: v.union(
      v.literal("referral_acceptance"),
      v.literal("appointment_scheduling"),
      v.literal("direct_assignment")
    ),
    relatedActionId: v.optional(v.union(v.id("appointments"), v.id("referrals"))),
    assignedAt: v.number(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_assigned_by", ["assignedBy"])
    .index("by_is_active", ["isActive"])
    .index("by_doctor_patient", ["doctorId", "patientId"])
    .index("by_assigned_at", ["assignedAt"]),

  appointments: defineTable({
    doctorPatientId: v.id("doctorPatients"),
    appointmentDateTime: v.number(),
    duration: v.number(),
    timeZone: v.string(),
    appointmentType: v.union(
      v.literal("new_patient"),
      v.literal("follow_up"),
      v.literal("consultation"),
      v.literal("procedure"),
      v.literal("telemedicine"),
      v.literal("emergency")
    ),
    visitReason: v.string(),
    location: v.object({
      type: v.union(v.literal("in_person"), v.literal("telemedicine")),
      address: v.optional(v.string()),
      room: v.optional(v.string()),
      meetingLink: v.optional(v.string())
    }),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("checked_in"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled"),
      v.literal("rescheduled")
    ),
    preVisitQuestionnaire: v.optional(v.string()),
    chiefComplaint: v.optional(v.string()),
    vitals: v.optional(v.object({
      height: v.optional(v.number()),
      weight: v.optional(v.number()),
      bmi: v.optional(v.number()),
      bloodPressure: v.optional(v.string()),
      temperature: v.optional(v.number()),
      heartRate: v.optional(v.number()),
      respiratoryRate: v.optional(v.number()),
      oxygenSaturation: v.optional(v.number())
    })),
    insuranceVerified: v.optional(v.boolean()),
    copayAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
    scheduledAt: v.number(),
    confirmedAt: v.optional(v.number()),
    checkedInAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_doctor_patient", ["doctorPatientId"])
    .index("by_datetime", ["appointmentDateTime"])
    .index("by_status", ["status"])
    .index("by_doctor_patient_date", ["doctorPatientId", "appointmentDateTime"])
    .index("by_appointment_type", ["appointmentType"])
    .index("by_doctor_patient_status", ["doctorPatientId", "status"]),

  referrals: defineTable({
    fromDoctorId: v.id("doctors"),
    toDoctorId: v.optional(v.id("doctors")), // Optional for open referrals
    patientId: v.id("patients"),
    soapNoteId: v.optional(v.id("soapNotes")), // Optional when no SOAP note attached
    specialtyRequired: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    reasonForReferral: v.string(),
    clinicalQuestion: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    responseMessage: v.optional(v.string()),
    sentAt: v.number(),
    respondedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_from_doctor", ["fromDoctorId"])
    .index("by_to_doctor", ["toDoctorId"])
    .index("by_patient", ["patientId"])
    .index("by_soap_note", ["soapNoteId"])
    .index("by_status", ["status"])
    .index("by_specialty", ["specialtyRequired"])
    .index("by_urgency", ["urgency"])
    .index("by_to_doctor_status", ["toDoctorId", "status"])
    .index("by_specialty_status", ["specialtyRequired", "status"]),

  treatmentPlans: defineTable({
    doctorPatientId: v.id("doctorPatients"),
    soapNoteId: v.optional(v.id("soapNotes")),
    title: v.string(),
    diagnosis: v.string(),
    plan: v.string(),
    goals: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),

    // New fields for enhanced treatment management
    medicationDetails: v.optional(v.array(v.object({
      name: v.string(),
      genericName: v.optional(v.string()),
      strength: v.string(),
      dosageForm: v.string(),
      ndc: v.optional(v.string()),
      rxcui: v.optional(v.string()),
      quantity: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      instructions: v.string(),
      refills: v.number(),
    }))),
    pharmacyId: v.optional(v.id("pharmacies")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_doctor_patient", ["doctorPatientId"])
    .index("by_status", ["status"])
    .index("by_doctor_patient_status", ["doctorPatientId", "status"])
    .index("by_pharmacy", ["pharmacyId"]),



  notifications: defineTable({
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("doctor"), v.literal("patient")),
    category: v.union(
      v.literal("clinical"),
      v.literal("administrative"),
      v.literal("system"),
      v.literal("alert"),
      v.literal("reminder")
    ),
    type: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    relatedRecords: v.optional(v.object({
      patientId: v.optional(v.id("patients")),
      doctorId: v.optional(v.id("doctors")),
      appointmentId: v.optional(v.id("appointments")),
      referralId: v.optional(v.id("referrals")),
      soapNoteId: v.optional(v.id("soapNotes")),
    })),
    channels: v.array(v.union(v.literal("in_app"), v.literal("email"), v.literal("sms"), v.literal("push"))),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_unread", ["recipientId", "isRead"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  chatSessions: defineTable({
    userId: v.id("users"),
    userType: v.union(v.literal("doctor"), v.literal("patient")),
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
    title: v.string(),
    summary: v.optional(v.string()),
    messageCount: v.number(),
    lastMessageAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_type", ["userType"])
    .index("by_patient_id", ["patientId"])
    .index("by_doctor_id", ["doctorId"])
    .index("by_is_active", ["isActive"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_user_active", ["userId", "isActive"]),

  emailAutomation: defineTable({
    userId: v.id("users"),
    emailType: v.union(
      v.literal("welcome"),
      v.literal("profile_completion_reminder"),
      v.literal("appointment_reminder_24h"),
      v.literal("appointment_reminder_1h"),
      v.literal("appointment_followup"),
      v.literal("treatment_reminder"),

      v.literal("inactive_user_reengagement"),
      v.literal("security_alert"),
      v.literal("system_maintenance")
    ),
    status: v.union(
      v.literal("scheduled"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    scheduledFor: v.number(),
    sentAt: v.optional(v.number()),
    relatedRecordId: v.optional(v.string()), // appointment ID, treatment ID, etc.
    relatedRecordType: v.optional(v.string()), // "appointment", "treatment", etc.
    emailData: v.object({
      to: v.string(),
      subject: v.string(),
      templateData: v.any(), // Dynamic data for email templates
    }),
    retryCount: v.number(),
    lastRetryAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email_type", ["emailType"])
    .index("by_status", ["status"])
    .index("by_scheduled_for", ["scheduledFor"])
    .index("by_user_status", ["userId", "status"])
    .index("by_related_record", ["relatedRecordId", "relatedRecordType"]),

  emailPreferences: defineTable({
    userId: v.id("users"),
    welcomeEmails: v.boolean(),
    appointmentReminders: v.boolean(),
    appointmentConfirmations: v.boolean(),
    treatmentReminders: v.boolean(),

    securityAlerts: v.boolean(),
    systemNotifications: v.boolean(),
    marketingEmails: v.boolean(),
    profileReminders: v.boolean(),
    reengagementEmails: v.boolean(),
    emailFrequency: v.union(
      v.literal("immediate"),
      v.literal("daily_digest"),
      v.literal("weekly_digest")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("assistant")),
    contextUsed: v.optional(v.boolean()),
    relevantDocuments: v.optional(v.array(v.object({
      id: v.string(),
      event_type: v.string(),
      content_preview: v.string(),
      similarity_score: v.number(),
      created_at: v.string(),
      metadata: v.any(),
    }))),
    relevantDocumentsCount: v.optional(v.number()),
    processingTime: v.optional(v.number()),
    // Enhanced RAG fields
    ragResponseData: v.optional(v.object({
      role_type: v.optional(v.string()),
      role_id: v.optional(v.string()),
      query: v.optional(v.string()),
      response: v.optional(v.string()),
      similarity_threshold: v.optional(v.number()),
      max_results: v.optional(v.number()),
      generated_at: v.optional(v.string()),
    })),
    structuredResponse: v.optional(v.object({
      type: v.string(),
      summary: v.string(),
      data: v.any(),
      timestamp: v.string(),
    })),
    enhancedRelevantDocuments: v.optional(v.array(v.object({
      id: v.string(),
      role_type: v.string(),
      role_id: v.string(),
      event_type: v.string(),
      content: v.string(),
      content_chunk: v.optional(v.string()),
      metadata: v.any(),
      created_at: v.string(),
      similarity_score: v.number(),
    }))),
    createdAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_sender", ["sender"])
    .index("by_session_created", ["sessionId", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  // E-prescriptions and pharmacy integration
  prescriptions: defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.optional(v.id("appointments")),
    treatmentPlanId: v.optional(v.id("treatmentPlans")),
    externalPrescriptionId: v.optional(v.string()), // Surescripts transaction ID
    medication: v.object({
      name: v.string(),
      genericName: v.optional(v.string()),
      strength: v.string(),
      dosageForm: v.string(), // tablet, capsule, liquid, etc.
      ndc: v.optional(v.string()), // National Drug Code
      rxcui: v.optional(v.string()), // RxNorm Concept Unique Identifier
    }),
    dosage: v.object({
      quantity: v.string(),
      frequency: v.string(),
      duration: v.optional(v.string()),
      instructions: v.string(),
      refills: v.number(),
    }),
    pharmacyId: v.optional(v.id("pharmacies")),
    prescriptionDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("received"),
      v.literal("filled"),
      v.literal("cancelled"),
      v.literal("error")
    ),
    deliveryMethod: v.union(
      v.literal("electronic"),
      v.literal("print"),
      v.literal("fax"),
      v.literal("phone")
    ),
    priority: v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("stat")
    ),
    safetyChecks: v.optional(v.object({
      drugInteractions: v.array(v.object({
        severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("major")),
        description: v.string(),
        interactingMedication: v.string(),
      })),
      allergyAlerts: v.array(v.object({
        allergen: v.string(),
        severity: v.string(),
        reaction: v.string(),
      })),
      contraindications: v.array(v.string()),
      dosageAlerts: v.array(v.string()),
    })),
    notes: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    prescribedBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_appointment", ["appointmentId"])
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_status", ["status"])
    .index("by_prescription_date", ["prescriptionDate"])
    .index("by_external_id", ["externalPrescriptionId"]),

  // Pharmacy directory
  pharmacies: defineTable({
    userId: v.optional(v.id("users")), // Link to user account for pharmacy login
    ncpdpId: v.string(), // Unique pharmacy identifier
    name: v.string(),
    licenseNumber: v.string(), // Pharmacy license
    deaNumber: v.optional(v.string()), // DEA number for controlled substances
    npiNumber: v.optional(v.string()), // NPI for billing
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    phone: v.string(),
    fax: v.optional(v.string()),
    email: v.optional(v.string()),
    hours: v.optional(v.object({
      monday: v.optional(v.string()),
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    services: v.optional(v.array(v.string())), // ["24_hour", "drive_thru", "delivery"]
    chainName: v.optional(v.string()), // "CVS", "Walgreens", etc.
    pharmacistInCharge: v.optional(v.string()),
    isActive: v.boolean(),
    isVerified: v.boolean(),
    lastVerified: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_ncpdp_id", ["ncpdpId"])
    .index("by_zip_code", ["address.zipCode"])
    .index("by_chain", ["chainName"])
    .index("by_active", ["isActive"])
    .index("by_license", ["licenseNumber"])
    .index("by_active_verified", ["isActive", "isVerified"]),

  // Pharmacy staff for larger pharmacies
  pharmacyStaff: defineTable({
    pharmacyId: v.id("pharmacies"),
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("pharmacist"),
      v.literal("pharmacy_technician"),
      v.literal("pharmacy_manager")
    ),
    licenseNumber: v.optional(v.string()),
    isActive: v.boolean(),
    hireDate: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_pharmacy_active", ["pharmacyId", "isActive"]),

  // Drug interaction database
  drugInteractions: defineTable({
    drug1: v.string(), // RxCUI or drug name
    drug2: v.string(), // RxCUI or drug name
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("major")),
    description: v.string(),
    mechanism: v.optional(v.string()),
    clinicalEffects: v.optional(v.string()),
    management: v.optional(v.string()),
    source: v.string(), // "FDA", "DrugBank", etc.
    lastUpdated: v.number(),
  })
    .index("by_drug1", ["drug1"])
    .index("by_drug2", ["drug2"])
    .index("by_severity", ["severity"])
    .index("by_drug_pair", ["drug1", "drug2"]),

  // Doctor-Patient Conversations
  doctorPatientConversations: defineTable({
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    doctorUserId: v.id("users"),
    patientUserId: v.id("users"),
    lastMessageAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_doctor_patient", ["doctorId", "patientId"])
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_doctor_user", ["doctorUserId"])
    .index("by_patient_user", ["patientUserId"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_active", ["isActive"]),

  // Doctor-Patient Messages
  doctorPatientMessages: defineTable({
    conversationId: v.id("doctorPatientConversations"),
    senderId: v.id("users"),
    senderType: v.union(v.literal("doctor"), v.literal("patient")),
    content: v.string(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_conversation_created", ["conversationId", "createdAt"])
    .index("by_unread", ["conversationId", "isRead"])
    .index("by_created_at", ["createdAt"]),

  // Time-Slot Based Appointment System Tables

  // Doctor Availability Templates - Weekly schedule templates
  doctorAvailability: defineTable({
    doctorId: v.id("doctors"),
    dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
    startTime: v.string(), // "09:00"
    endTime: v.string(),   // "17:00"
    slotDuration: v.number(), // 30 or 60 minutes
    bufferTime: v.number(),   // 5-15 minutes between slots
    breakTimes: v.array(v.object({
      startTime: v.string(), // "12:00"
      endTime: v.string(),   // "13:00"
      reason: v.string(),    // "Lunch Break"
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_doctor_day", ["doctorId", "dayOfWeek"])
    .index("by_doctor_active", ["doctorId", "isActive"])
    .index("by_day_of_week", ["dayOfWeek"]),

  // Generated Time Slots - Pre-generated available time slots
  timeSlots: defineTable({
    doctorId: v.id("doctors"),
    date: v.string(),        // "2025-07-15"
    time: v.string(),        // "09:00"
    endTime: v.string(),     // "09:30"
    slotType: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("blocked"),
      v.literal("break")
    ),
    appointmentId: v.optional(v.id("appointments")),
    isRecurring: v.boolean(),
    generatedFrom: v.union(
      v.literal("template"),
      v.literal("manual"),
      v.literal("exception")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_doctor_date", ["doctorId", "date"])
    .index("by_doctor_date_time", ["doctorId", "date", "time"])
    .index("by_slot_type", ["slotType"])
    .index("by_appointment", ["appointmentId"])
    .index("by_date_range", ["date", "time"])
    .index("by_doctor_available", ["doctorId", "slotType"])
    .index("by_doctor_date_available", ["doctorId", "date", "slotType"]),

  // Doctor Exceptions - Handle unavailability (vacation, sick days, etc.)
  doctorExceptions: defineTable({
    doctorId: v.id("doctors"),
    date: v.string(),        // "2025-07-15"
    exceptionType: v.union(
      v.literal("vacation"),
      v.literal("sick"),
      v.literal("conference"),
      v.literal("emergency"),
      v.literal("personal"),
      v.literal("training")
    ),
    startTime: v.optional(v.string()), // null for full day
    endTime: v.optional(v.string()),
    reason: v.string(),
    affectedSlots: v.array(v.id("timeSlots")),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.object({
      frequency: v.union(v.literal("weekly"), v.literal("monthly")),
      interval: v.number(), // every N weeks/months
      endDate: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_doctor_date", ["doctorId", "date"])
    .index("by_exception_type", ["exceptionType"])
    .index("by_date_range", ["date"])
    .index("by_doctor_type", ["doctorId", "exceptionType"])
    .index("by_recurring", ["isRecurring"]),

  // Appointment Reschedule Requests - Patient requests for rescheduling
  appointmentRescheduleRequests: defineTable({
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    currentDateTime: v.number(), // Current appointment time
    requestedSlotId: v.optional(v.id("timeSlots")), // Requested new slot
    requestedDateTime: v.optional(v.number()), // Requested new time
    reason: v.string(), // Patient's reason for rescheduling
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    adminNotes: v.optional(v.string()), // Doctor/admin response notes
    requestedAt: v.number(),
    respondedAt: v.optional(v.number()),
    respondedBy: v.optional(v.id("users")), // Doctor/admin who responded
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_appointment", ["appointmentId"])
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_status", ["status"])
    .index("by_doctor_status", ["doctorId", "status"])
    .index("by_requested_at", ["requestedAt"])
    .index("by_patient_status", ["patientId", "status"]),

  // Prescription Orders - Orders sent to pharmacies
  prescriptionOrders: defineTable({
    prescriptionId: v.id("prescriptions"),
    pharmacyId: v.id("pharmacies"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    treatmentPlanId: v.optional(v.id("treatmentPlans")),
    orderNumber: v.string(),
    medicationDetails: v.object({
      name: v.string(),
      dosage: v.string(),
      quantity: v.string(),
      refills: v.number(),
      frequency: v.string(),
      instructions: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("on_hold")
    ),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    deliveryAddress: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      instructions: v.optional(v.string()),
    })),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    estimatedReadyTime: v.optional(v.number()),
    actualReadyTime: v.optional(v.number()),
    pickedUpAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    pharmacyNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prescription", ["prescriptionId"])
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_treatment_plan", ["treatmentPlanId"])
    .index("by_status", ["status"])
    .index("by_pharmacy_status", ["pharmacyId", "status"])
    .index("by_patient_status", ["patientId", "status"])
    .index("by_doctor_status", ["doctorId", "status"])
    .index("by_order_number", ["orderNumber"])
    .index("by_created_at", ["createdAt"]),
});

