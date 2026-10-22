import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { searchDoctorRAG } from "@/lib/services/rag-api";
import type { SearchResponse } from "@/lib/services/rag-api";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, doctor_id } = body;

    // Validate required fields
    if (!message || !doctor_id) {
      return NextResponse.json(
        { error: "Missing required fields: message, doctor_id" },
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

    // Get doctor profile for fallback
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const doctorProfile = await convex.query(api.doctors.getDoctorProfile, {
      userId: session.user.id as any
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Integrate with RAG system for intelligent doctor responses
    const doctorName = doctorProfile.title ?
      `${doctorProfile.title} ${doctorProfile.lastName}` :
      `Dr. ${doctorProfile.lastName || "Doctor"}`;

    let ragResponse: SearchResponse | null = null;
    let fallbackResponse = "";

    try {
      // Try to get RAG response first
      ragResponse = await searchDoctorRAG(
        doctorProfile._id,
        message,
        {
          similarity_threshold: 0.5,
          max_results: 15,
          include_context: true
        }
      );

      console.log("RAG Response:", JSON.stringify(ragResponse, null, 2));

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
      fallbackResponse = `Hello ${doctorName}! I can help you analyze SOAP notes and patient records. To provide specific insights, I would need access to particular patient records. You can ask me about:

• Analyzing patterns in patient symptoms
• Reviewing treatment effectiveness
• Identifying potential drug interactions
• Summarizing patient progress
• Clinical documentation assistance

What specific patient or medical topic would you like to discuss?`;
    } else if (lowerMessage.includes("patient") || lowerMessage.includes("record")) {
      fallbackResponse = `${doctorName}, I can assist with patient record analysis and clinical insights. I can help you:

• Review patient histories and trends
• Analyze treatment outcomes
• Identify care gaps or follow-up needs
• Generate clinical summaries
• Provide evidence-based recommendations

Which patient or clinical area would you like to focus on?`;
    } else if (lowerMessage.includes("medication") || lowerMessage.includes("drug") || lowerMessage.includes("prescription")) {
      fallbackResponse = `I can help with medication-related queries, ${doctorName}. I can assist with:

• Drug interaction checks
• Dosage recommendations
• Alternative medication suggestions
• Side effect analysis
• Prescription optimization

What specific medication or patient case are you working with?`;
    } else if (lowerMessage.includes("treatment") || lowerMessage.includes("therapy")) {
      fallbackResponse = `For treatment planning, ${doctorName}, I can help you:

• Evaluate treatment effectiveness
• Suggest evidence-based protocols
• Analyze patient response patterns
• Identify optimal care pathways
• Review clinical guidelines

What treatment or condition would you like to discuss?`;
    } else {
      fallbackResponse = `Hello ${doctorName}! I'm your AI medical assistant. I can help you with:

• Patient record analysis and insights
• SOAP note review and documentation
• Clinical decision support
• Treatment planning assistance
• Medical research and evidence review
• Drug interaction and prescription guidance

How can I assist you with your medical practice today?`;
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
    console.error("Doctor assistant chat API error:", error);
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
