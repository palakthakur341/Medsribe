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

    const body = await request.json();
    const { text, patient_id } = body;

    // Validate required fields
    if (!text || !patient_id) {
      return NextResponse.json(
        { error: "Missing required fields: text, patient_id" },
        { status: 400 }
      );
    }

    // Validate text input
    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: "Text must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: "Text must be less than 50,000 characters" },
        { status: 400 }
      );
    }

    // Create request body for external API
    const requestBody = {
      text: text.trim(),
      patient_id: patient_id
    };

    // Call external SOAP generation API
    const externalApiUrl = process.env.SOAP_TEXT_API_URL || "http://localhost:8000/api/v1/process-text";
    
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Text processing response:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = "Failed to process text";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
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
    console.log('Text processing result:', result);

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
          message: result.message || "Text processing failed",
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

    // Store the SOAP note in Convex database if needed
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // For enhanced API response, save the complete data structure
    let soapNoteId = null;
    if (result.data) {
      try {
        const soapData: any = {
          patientId: patient_id as any,
          status: result.status,
          data: result.data, // Pass the complete API response data structure
        };

        soapNoteId = await convex.mutation(api.soapNotes.create, soapData);
      } catch (convexError) {
        console.error("Error saving to Convex:", convexError);
        // Continue without failing the request
      }
    }

    // Return the processed result in the expected format
    return NextResponse.json({
      status: "success",
      message: result.message || "Text processed successfully",
      timestamp: result.timestamp || new Date().toISOString(),
      data: {
        ...result.data,
        soap_note_id: soapNoteId,
      }
    });

  } catch (error) {
    console.error("Text processing error:", error);
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

// Helper function to extract quality score from processing summary
function extractQualityScore(qualityAssurance: string): number {
  const match = qualityAssurance.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) / 100 : 0.85; // Default to 85% if not found
}
