import { NextRequest, NextResponse } from "next/server";

/**
 * Health check endpoint for SOAP API backend
 * Tests connectivity to the external SOAP generation service
 */
export async function GET(request: NextRequest) {
  try {
    const soapApiBaseUrl = process.env.SOAP_API_BASE_URL || "http://localhost:8000";
    
    // Test basic connectivity to the backend
    const response = await fetch(`${soapApiBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: `SOAP API backend is not responding. Status: ${response.status}`,
          backend_url: soapApiBaseUrl,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    const healthData = await response.json();

    return NextResponse.json({
      status: "success",
      message: "SOAP API backend is healthy",
      backend_url: soapApiBaseUrl,
      backend_response: healthData,
      endpoints: {
        audio_processing: `${soapApiBaseUrl}/api/v1/process-audio`,
        text_processing: `${soapApiBaseUrl}/api/v1/process-text`,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        status: "error",
        message: `Failed to connect to SOAP API backend: ${errorMessage}`,
        backend_url: process.env.SOAP_API_BASE_URL || "http://localhost:8000",
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
