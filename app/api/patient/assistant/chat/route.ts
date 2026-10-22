import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { searchPatientRAG } from "@/lib/services/rag-api";
import type { SearchResponse } from "@/lib/services/rag-api";

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

    const body = await request.json();
    const { message, patient_id } = body;

    // Validate required fields
    if (!message || !patient_id) {
      return NextResponse.json(
        { error: "Missing required fields: message, patient_id" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 1) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Get patient profile for fallback
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const patientProfile = await convex.query(api.patients.getPatientByUserId, {
      userId: session.user.id as any
    });

    if (!patientProfile) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Integrate with RAG system for intelligent responses
    const patientName = patientProfile.firstName || "there";
    let ragResponse: SearchResponse | null = null;
    let fallbackResponse = "";

    try {
      // Try to get RAG response first
      ragResponse = await searchPatientRAG(
        patientProfile._id,
        message,
        {
          similarity_threshold: 0.5,
          max_results: 10,
          include_context: true
        }
      );

      // If RAG returns a valid response, use it (even with 0 documents)
      if (ragResponse.success && ragResponse.response) {
        return NextResponse.json({
          success: true,
          data: {
            message: ragResponse.response,
            context_used: ragResponse.context_used,
            relevant_documents: ragResponse.relevant_documents.map(doc => ({
              id: doc.id,
              event_type: doc.event_type,
              content_preview: doc.content.substring(0, 200) + "...",
              similarity_score: doc.similarity_score,
              created_at: doc.created_at,
              metadata: doc.metadata
            })),
            relevant_documents_count: ragResponse.relevant_documents_count,
            processing_time: ragResponse.processing_time_seconds,
            rag_response: ragResponse,
            structured_response: ragResponse.structured_response,
            enhanced_relevant_documents: ragResponse.relevant_documents,
            timestamp: ragResponse.generated_at
          }
        });
      }
    } catch (ragError) {
      console.warn("RAG API error, falling back to contextual response:", ragError);
    }

    // Fallback to contextual responses when RAG has no relevant data
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("soap") || lowerMessage.includes("notes")) {
      fallbackResponse = `Hello ${patientName}! I can help you understand your SOAP notes and medical records. Once you generate SOAP notes using our audio recording feature, I'll be able to provide detailed insights about your medical history, symptoms, and treatment plans. Would you like me to guide you through creating your first SOAP note?`;
    } else if (lowerMessage.includes("medication") || lowerMessage.includes("medicine") || lowerMessage.includes("drug")) {
      fallbackResponse = `Hello ${patientName}! I can assist you with medication-related questions. As you build your medical history in the system, I'll be able to provide information about your prescriptions, drug interactions, and medication schedules. Is there a specific medication question I can help you with?`;
    } else if (lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      fallbackResponse = `Hello ${patientName}! I can help you with appointment-related questions. You can schedule, reschedule, or view your appointments through the appointments section. Is there something specific about your appointments you'd like to know?`;
    } else if (lowerMessage.includes("symptom") || lowerMessage.includes("pain") || lowerMessage.includes("feel")) {
      fallbackResponse = `Hello ${patientName}! I understand you're asking about symptoms or how you're feeling. While I can provide general health information, it's important to discuss specific symptoms with your healthcare provider. You can use our SOAP note feature to record your symptoms for your next appointment. Would you like me to help you with that?`;
    } else if (lowerMessage.includes("test") || lowerMessage.includes("result") || lowerMessage.includes("lab")) {
      fallbackResponse = `Hello ${patientName}! I can help you understand test results and lab reports once they're added to your medical records. Your healthcare provider can share test results with you through the system. Is there something specific about medical tests you'd like to know?`;
    } else {
      fallbackResponse = `Hello ${patientName}! I'm your AI medical assistant. I can help you with:

• Understanding your SOAP notes and medical records
• Medication information and schedules
• Appointment scheduling and management
• General health information and guidance
• Recording symptoms for your healthcare provider

As you use the system more and generate medical records, I'll be able to provide more personalized assistance. What would you like to know about?`;
    }

    return NextResponse.json({
      success: true,
      data: {
        message: fallbackResponse,
        relevant_documents: [],
        relevant_documents_count: 0,
        context_used: false,
        rag_response: ragResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Assistant chat API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong. Please try again." 
      },
      { status: 500 }
    );
  }
}