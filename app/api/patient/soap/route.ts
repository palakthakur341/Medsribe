import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get("audio_file") as File;
    const patientId = formData.get("patient_id") as string;

    if (!audioFile || !patientId) {
      return NextResponse.json(
        { error: "Missing audio file or patient ID" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an audio file." },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Create FormData for external API
    const externalFormData = new FormData();
    externalFormData.append("audio_file", audioFile);
    externalFormData.append("patient_id", patientId);

    // Call external SOAP generation API
    const externalApiUrl = process.env.SOAP_API_URL || "http://localhost:8000/api/v1/process-audio";
    
    const response = await fetch(externalApiUrl, {
      method: "POST",
      body: externalFormData,
    });

    console.log(response);

    if (!response.ok) {
      let errorMessage = "Failed to process audio file";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      console.error("External API error:", errorMessage);
      return NextResponse.json(
        {
          status: "error",
          message: errorMessage,
          timestamp: new Date().toISOString()
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(result);

    // Check if quality assurance failed
    if (result.status === 'quality_assurance_failed') {
      return NextResponse.json(
        {
          status: "error",
          message: "Quality assurance failed",
          timestamp: new Date().toISOString(),
          details: {
            message: result.message,
            qa_results: result.qa_results,
            next_steps: result.next_steps,
            review_required_by: result.review_required_by
          }
        },
        { status: 422 } // Unprocessable Entity
      );
    }

    // Check for error status in result
    if (result.status === 'error') {
      return NextResponse.json(
        {
          status: "error",
          message: result.message || "Audio processing failed",
          timestamp: new Date().toISOString(),
          error: result.error
        },
        { status: 500 }
      );
    }

    // Validate response structure for successful responses
    if (result.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid response from SOAP generation service",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Store the SOAP note in Convex database
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Prepare the data object for the enhanced schema
    const soapData: any = {
      patientId: patientId as any,
      status: result.status,
      data: result.data || {
        // Convert legacy format to enhanced format if needed
        enhanced_pipeline: false,
        session_id: `audio_${Date.now()}`,
        soap_notes: {
          subjective: result.deliverables?.clinical_notes?.subjective || "",
          objective: result.deliverables?.clinical_notes?.objective || "",
          assessment: result.deliverables?.clinical_notes?.assessment || "",
          plan: result.deliverables?.clinical_notes?.plan || "",
        },
        quality_metrics: {
          completeness_score: (extractQualityScore(result.processing_summary?.quality_assurance) ?? 80) / 100,
          clinical_accuracy: 0.8,
          documentation_quality: 0.8,
          red_flags: [],
          missing_information: [],
        },
        safety_check: {
          is_safe: true,
          red_flags: [],
          critical_items: [],
        },
        qa_results: {
          quality_score: extractQualityScore(result.processing_summary?.quality_assurance) || 80,
          errors: [],
          warnings: [],
          recommendations: result.recommendations || [],
          critical_flags: [],
          approved: true,
        },
      },
    };

    const soapNoteId = await convex.mutation(api.soapNotes.create, soapData);

    // TODO: Implement new RAG system integration here
    // This will be replaced with the new RAG hooks system
    console.log("SOAP note created successfully:", soapNoteId);

    // Return the processed result in the expected SOAPProcessingResponse format
    return NextResponse.json({
      status: "success",
      message: result.message || "Audio processed successfully",
      timestamp: result.timestamp || new Date().toISOString(),
      data: {
        ...result.data,
        soap_note_id: soapNoteId,
        // Legacy compatibility fields
        processing_summary: result.processing_summary,
        clinical_notes: result.deliverables?.clinical_notes,
        highlighted_html: result.deliverables?.highlighted_html,
        quality_score: extractQualityScore(result.processing_summary?.quality_assurance || ""),
        processing_time: result.total_processing_time,
        recommendations: result.recommendations,
        google_doc_url: result.deliverables?.google_doc_url,
        ehr_record_id: result.deliverables?.ehr_record_id,
        completed_at: result.completed_at,
      }
    });

  } catch (error) {
    console.error("SOAP generation error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper function to extract quality score from quality assurance string
function extractQualityScore(qualityAssurance?: string): number | undefined {
  if (!qualityAssurance) return undefined;
  
  const match = qualityAssurance.match(/score:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Get SOAP notes for the patient from Convex
    // const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    // const patientProfile = await convex.query(api.patients.getPatientByUserId, {
    //   userId: session.user.id
    // });
    
    // if (!patientProfile) {
    //   return NextResponse.json(
    //     { error: "Patient profile not found" },
    //     { status: 404 }
    //   );
    // }

    // const soapNotes = await convex.query(api.soapNotes.getByPatientId, {
    //   patientId: patientProfile._id
    // });

    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error("Error fetching SOAP notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
