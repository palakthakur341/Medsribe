import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



// Create a SOAP note from enhanced API response data
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    audioRecordingId: v.optional(v.id("audioRecordings")),
    status: v.optional(v.string()),
    data: v.any(), // The complete enhanced API response data structure
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create a clean data structure with only the expected schema fields
    const enhancedData = args.data ? {
      // Core required fields
      session_id: args.data.session_id || `session_${Date.now()}`,
      patient_id: args.patientId, // Add the required patient_id field
      enhanced_pipeline: args.data.enhanced_pipeline || true,

      // Transcription (optional, only for audio processing)
      ...(args.data.transcription && {
        transcription: {
          text: args.data.transcription.text || "",
          confidence: args.data.transcription.confidence || 1.0,
          language: args.data.transcription.language || "en",
          duration: args.data.transcription.duration || 0.0,
        }
      }),

      // Validation result (required)
      validation_result: {
        validated_text: args.data.validation?.validated_text || args.data.validation_result?.validated_text || "",
        corrections: args.data.validation?.corrections || args.data.validation_result?.corrections || [],
        flags: args.data.validation?.flags || args.data.validation_result?.flags || [],
        confidence: args.data.validation?.confidence || args.data.validation_result?.confidence || 0.8,
      },

      // Specialty detection (required)
      specialty_detection: {
        specialty: args.data.specialty_detection?.specialty || args.data.specialty_detection?.detected_specialty || "General Medicine",
        confidence: args.data.specialty_detection?.confidence || 0.8,
        reasoning: args.data.specialty_detection?.reasoning || "Specialty detected based on clinical content analysis",
        templates: args.data.specialty_detection?.templates || {},
      },

      // SOAP notes structure (required)
      soap_notes: {
        quality_metrics: args.data.soap_notes?.quality_metrics || args.data.quality_metrics || {
          completeness_score: 0.8,
          clinical_accuracy: 0.8,
          documentation_quality: 0.8,
          red_flags: [],
          missing_information: [],
        },
        session_id: args.data.soap_notes?.session_id || args.data.session_id || `session_${Date.now()}`,
        soap_notes: args.data.soap_notes?.soap_notes || {
          // Default structure if not provided
          subjective: {
            chief_complaint: "",
            history_present_illness: "",
            review_of_systems: [],
            past_medical_history: [],
            medications: [],
            allergies: [],
            social_history: "",
          },
          objective: {
            vital_signs: {},
            physical_exam: {},
            diagnostic_results: [],
            mental_status: "",
            functional_status: "",
          },
          assessment: {
            primary_diagnosis: {
              diagnosis: "",
              icd10_code: "",
              confidence: 0.8,
              severity: "mild",
              clinical_reasoning: "",
            },
            differential_diagnoses: [],
            problem_list: [],
            risk_level: "low",
            risk_factors: [],
            prognosis: "",
          },
          plan: {
            diagnostic_workup: [],
            treatments: [],
            medications: [],
            follow_up: [],
            patient_education: [],
            referrals: [],
          },
          clinical_notes: "",
        },
        specialty: args.data.soap_notes?.specialty || args.data.specialty_detection?.specialty || "General Medicine",
      },

      // Quality metrics (required)
      quality_metrics: args.data.quality_metrics || {
        completeness_score: 0.8,
        clinical_accuracy: 0.8,
        documentation_quality: 0.8,
        red_flags: [],
        missing_information: [],
      },

      // Safety check (required)
      safety_check: args.data.safety_check || {
        is_safe: true,
        red_flags: [],
        critical_items: [],
      },

      // QA results (required)
      qa_results: args.data.qa_results || {
        quality_score: 80,
        errors: [],
        warnings: [],
        recommendations: [],
        critical_flags: [],
        approved: true,
      },

      // Document generation results (optional)
      ...(args.data.document && {
        document: {
          document_path: args.data.document.document_path,
          success: args.data.document.success || false,
          error: args.data.document.error,
        }
      }),
    } : undefined;

    return await ctx.db.insert("soapNotes", {
      patientId: args.patientId,
      audioRecordingId: args.audioRecordingId,
      status: args.status,
      data: enhancedData,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get SOAP notes by patient ID
export const getByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Get a specific SOAP note by ID
export const getById = query({
  args: { id: v.id("soapNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a SOAP note
export const update = mutation({
  args: {
    id: v.id("soapNotes"),
    subjective: v.optional(v.string()),
    objective: v.optional(v.string()),
    assessment: v.optional(v.string()),
    plan: v.optional(v.string()),
    highlightedHtml: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
    recommendations: v.optional(v.array(v.string())),
    googleDocUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Note: RAG embedding for SOAP updates will be handled by frontend hooks
    // to avoid cloud/localhost connectivity issues

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a SOAP note
export const remove = mutation({
  args: { id: v.id("soapNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get recent SOAP notes for a patient (last 5)
export const getRecentByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(5);
  },
});

// Get enhanced SOAP notes statistics for a patient
export const getStatsByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const soapNotes = await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();

    const totalNotes = soapNotes.length;

    // Helper function to get quality score from enhanced structure
    const getQualityScore = (note: any): number | undefined => {
      return note.data?.qa_results?.quality_score ||
             (note.data?.quality_metrics?.completeness_score ? Math.round(note.data.quality_metrics.completeness_score * 100) : undefined);
    };

    // Helper function to get safety status
    const getSafetyStatus = (note: any): boolean | undefined => {
      return note.data?.safety_check?.is_safe;
    };

    // Helper function to check if note has enhanced data
    const hasEnhancedData = (note: any): boolean => {
      return !!note.data?.enhanced_pipeline;
    };

    // Calculate basic metrics
    const notesWithQuality = soapNotes.filter(note => getQualityScore(note) !== undefined);
    const averageQuality = notesWithQuality.length > 0
      ? Math.round(
          notesWithQuality.reduce((sum, note) => sum + (getQualityScore(note) || 0), 0) /
          notesWithQuality.length
        )
      : 0;

    const excellentQualityCount = soapNotes.filter(note =>
      (getQualityScore(note) || 0) >= 90
    ).length;

    // Enhanced metrics
    const enhancedNotesCount = soapNotes.filter(note => hasEnhancedData(note)).length;
    const safeNotesCount = soapNotes.filter(note => getSafetyStatus(note) === true).length;
    const unsafeNotesCount = soapNotes.filter(note => getSafetyStatus(note) === false).length;
    const redFlagsCount = soapNotes.filter(note =>
      (note.data?.quality_metrics?.red_flags?.length || 0) > 0 ||
      (note.data?.safety_check?.red_flags?.length || 0) > 0
    ).length;

    // Specialty breakdown
    const specialtyBreakdown: Record<string, number> = {};
    soapNotes.forEach(note => {
      const specialty = note.data?.specialty_detection?.specialty;
      if (specialty) {
        specialtyBreakdown[specialty] = (specialtyBreakdown[specialty] || 0) + 1;
      }
    });

    // Quality distribution
    const qualityDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    soapNotes.forEach(note => {
      const qualityScore = getQualityScore(note);
      if (qualityScore !== undefined) {
        if (qualityScore >= 90) qualityDistribution.excellent++;
        else if (qualityScore >= 75) qualityDistribution.good++;
        else if (qualityScore >= 60) qualityDistribution.fair++;
        else qualityDistribution.poor++;
      } else {
        qualityDistribution.poor++;
      }
    });

    // Average transcription confidence
    const notesWithTranscription = soapNotes.filter(note => note.data?.transcription?.confidence);
    const avgTranscriptionConfidence = notesWithTranscription.length > 0
      ? Math.round(
          notesWithTranscription.reduce((acc, note) =>
            acc + (note.data?.transcription?.confidence || 0), 0
          ) / notesWithTranscription.length * 100
        )
      : 0;

    return {
      totalNotes,
      averageQuality,
      excellentQualityCount,
      enhancedNotesCount,
      safeNotesCount,
      unsafeNotesCount,
      redFlagsCount,
      specialtyBreakdown,
      qualityDistribution,
      avgTranscriptionConfidence,
    };
  },
});

// Search SOAP notes by content
export const searchByContent = query({
  args: {
    patientId: v.id("patients"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allNotes = await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();

    const searchTermLower = args.searchTerm.toLowerCase();

    return allNotes.filter(note =>
      // Search in enhanced structured data only
      (note.data?.specialty_detection?.specialty && note.data.specialty_detection.specialty.toLowerCase().includes(searchTermLower)) ||
      (note.data?.quality_metrics?.red_flags?.some(flag => flag.toLowerCase().includes(searchTermLower))) ||
      (note.data?.safety_check?.red_flags?.some(flag => flag.toLowerCase().includes(searchTermLower))) ||
      (note.data?.qa_results?.recommendations?.some(rec => rec.toLowerCase().includes(searchTermLower))) ||
      // Search in structured SOAP sections
      (note.data?.soap_notes?.soap_notes?.subjective?.history_present_illness &&
       note.data.soap_notes.soap_notes.subjective.history_present_illness.toLowerCase().includes(searchTermLower)) ||
      (note.data?.soap_notes?.soap_notes?.subjective?.chief_complaint &&
       note.data.soap_notes.soap_notes.subjective.chief_complaint.toLowerCase().includes(searchTermLower)) ||
      (note.data?.soap_notes?.soap_notes?.objective?.vital_signs &&
       JSON.stringify(note.data.soap_notes.soap_notes.objective.vital_signs).toLowerCase().includes(searchTermLower)) ||
      (note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.clinical_reasoning &&
       note.data.soap_notes.soap_notes.assessment.primary_diagnosis.clinical_reasoning.toLowerCase().includes(searchTermLower)) ||
      (note.data?.soap_notes?.soap_notes?.plan?.patient_education?.some(edu => edu.toLowerCase().includes(searchTermLower))) ||
      (note.data?.soap_notes?.soap_notes?.plan?.medications?.some(med => med.toLowerCase().includes(searchTermLower)))
    );
  },
});

// Get SOAP notes by session ID
export const getBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soapNotes")
      .withIndex("by_session", (q) => q.eq("data.session_id", args.sessionId))
      .first();
  },
});

// Get SOAP notes by specialty
export const getBySpecialty = query({
  args: {
    specialty: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("soapNotes")
      .withIndex("by_specialty", (q) => q.eq("data.specialty_detection.specialty", args.specialty))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get SOAP notes by safety status
export const getBySafetyStatus = query({
  args: {
    isSafe: v.boolean(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("soapNotes")
      .withIndex("by_safety", (q) => q.eq("data.safety_check.is_safe", args.isSafe))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Get SOAP notes by status
export const getByStatus = query({
  args: {
    status: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("soapNotes")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Add assistance to a SOAP note
export const addAssistance = mutation({
  args: {
    soapNoteId: v.id("soapNotes"),
    assistanceText: v.string(),
    doctorId: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const soapNote = await ctx.db.get(args.soapNoteId);
    if (!soapNote) {
      throw new Error("SOAP note not found");
    }

    const doctor = await ctx.db.get(args.doctorId);
    const patient = await ctx.db.get(soapNote.patientId);
    const now = Date.now();

    // Add assistance to the SOAP note's plan section
    const assistanceNote = `\n\n--- Doctor Assistance (${new Date().toLocaleDateString()}) ---\nDr. ${doctor?.firstName} ${doctor?.lastName}: ${args.assistanceText}`;

    // Update both legacy and new structure
    const updateData: any = {
      updatedAt: now,
    };



    // Update structured plan if it exists in the data
    if (soapNote.data?.soap_notes?.soap_notes?.plan) {
      updateData.data = {
        ...soapNote.data,
        soap_notes: {
          ...soapNote.data.soap_notes,
          soap_notes: {
            ...soapNote.data.soap_notes.soap_notes,
            plan: {
              ...soapNote.data.soap_notes.soap_notes.plan,
              treatments: [
                ...(soapNote.data.soap_notes.soap_notes.plan.treatments || []),
                assistanceNote
              ]
            }
          }
        }
      };
    }

    await ctx.db.patch(args.soapNoteId, updateData);

    // Create notification for patient
    if (patient && doctor) {
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "clinical",
        type: "assistance_provided",
        priority: "medium",
        title: "Medical Assistance Provided",
        message: `Dr. ${doctor.firstName} ${doctor.lastName} has provided assistance regarding your SOAP note.`,
        actionUrl: `/patient/soap-notes`,
        relatedRecords: {
          soapNoteId: args.soapNoteId,
          patientId: soapNote.patientId,
          doctorId: args.doctorId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.soapNoteId;
  },
});
