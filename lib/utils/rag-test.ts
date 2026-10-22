/**
 * RAG API Test Utilities
 * Helper functions to test RAG API integration
 */

import { ragAPIService, embedPatientData, embedDoctorData, searchPatientRAG, searchDoctorRAG } from "@/lib/services/rag-api";

/**
 * Test RAG API health
 */
export async function testRAGHealth() {
  try {
    const health = await ragAPIService.healthCheck();
    console.log("RAG API Health:", health);
    return health;
  } catch (error) {
    console.error("RAG API Health Check Failed:", error);
    throw error;
  }
}

/**
 * Test patient data embedding
 */
export async function testPatientEmbedding(patientId: string) {
  try {
    const result = await embedPatientData(
      patientId,
      "symptom_report",
      "Patient reports mild headache and fatigue after starting new medication. Symptoms began 3 days ago and are most noticeable in the morning.",
      {
        severity: "mild",
        frequency: "daily_morning",
        related_medication: "lisinopril",
        duration: "3_days"
      }
    );
    console.log("Patient Embedding Result:", result);
    return result;
  } catch (error) {
    console.error("Patient Embedding Failed:", error);
    throw error;
  }
}

/**
 * Test doctor data embedding
 */
export async function testDoctorEmbedding(doctorId: string) {
  try {
    const result = await embedDoctorData(
      doctorId,
      "patient_notes",
      "Patient John Doe (ID: patient_123) visited for routine checkup. Blood pressure: 120/80, Heart rate: 72 bpm. Prescribed metoprolol 50mg twice daily. Follow-up in 4 weeks.",
      {
        patient_id: "patient_123",
        visit_type: "routine_checkup",
        medications_prescribed: ["metoprolol"],
        follow_up_weeks: 4
      }
    );
    console.log("Doctor Embedding Result:", result);
    return result;
  } catch (error) {
    console.error("Doctor Embedding Failed:", error);
    throw error;
  }
}

/**
 * Test patient search
 */
export async function testPatientSearch(patientId: string, query: string = "What symptoms have I reported recently?") {
  try {
    const result = await searchPatientRAG(patientId, query);
    console.log("Patient Search Result:", result);
    return result;
  } catch (error) {
    console.error("Patient Search Failed:", error);
    throw error;
  }
}

/**
 * Test doctor search
 */
export async function testDoctorSearch(doctorId: string, query: string = "What medications did I prescribe for patient_123?") {
  try {
    const result = await searchDoctorRAG(doctorId, query);
    console.log("Doctor Search Result:", result);
    return result;
  } catch (error) {
    console.error("Doctor Search Failed:", error);
    throw error;
  }
}

/**
 * Run comprehensive RAG tests
 */
export async function runRAGTests(patientId: string, doctorId: string) {
  console.log("🚀 Starting RAG API Tests...");
  
  try {
    // Test health
    console.log("\n1. Testing RAG API Health...");
    await testRAGHealth();
    
    // Test embeddings
    console.log("\n2. Testing Patient Data Embedding...");
    await testPatientEmbedding(patientId);
    
    console.log("\n3. Testing Doctor Data Embedding...");
    await testDoctorEmbedding(doctorId);
    
    // Wait a moment for embeddings to be processed
    console.log("\n4. Waiting for embeddings to be processed...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test searches
    console.log("\n5. Testing Patient Search...");
    await testPatientSearch(patientId);
    
    console.log("\n6. Testing Doctor Search...");
    await testDoctorSearch(doctorId);
    
    console.log("\n✅ All RAG API tests completed successfully!");
    return true;
  } catch (error) {
    console.error("\n❌ RAG API tests failed:", error);
    return false;
  }
}

/**
 * Test RAG integration in browser console
 * Usage: Open browser console and run: testRAGIntegration()
 */
export function testRAGIntegration() {
  if (typeof window !== 'undefined') {
    console.log("🧪 RAG Integration Test");
    console.log("To test RAG integration, call:");
    console.log("- testRAGHealth()");
    console.log("- testPatientEmbedding('your-patient-id')");
    console.log("- testDoctorEmbedding('your-doctor-id')");
    console.log("- testPatientSearch('your-patient-id', 'your query')");
    console.log("- testDoctorSearch('your-doctor-id', 'your query')");
    console.log("- runRAGTests('patient-id', 'doctor-id')");
    
    // Make functions available globally for testing
    (window as any).testRAGHealth = testRAGHealth;
    (window as any).testPatientEmbedding = testPatientEmbedding;
    (window as any).testDoctorEmbedding = testDoctorEmbedding;
    (window as any).testPatientSearch = testPatientSearch;
    (window as any).testDoctorSearch = testDoctorSearch;
    (window as any).runRAGTests = runRAGTests;
  }
}
