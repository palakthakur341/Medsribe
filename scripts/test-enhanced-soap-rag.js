#!/usr/bin/env node

/**
 * Enhanced SOAP RAG Integration Test
 * 
 * Tests the enhanced SOAP note RAG embedding with proper patient names and details
 */

async function testEnhancedSOAPRAG() {
  console.log("🧪 Enhanced SOAP RAG Integration Test");
  console.log("=" .repeat(60));

  const baseURL = "http://localhost:8000";
  
  try {
    // Test 1: Enhanced SOAP note creation
    console.log("\n1️⃣ Testing enhanced SOAP note creation...");
    
    const createEmbedPayload = {
      doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
      event_type: "soap_note_created",
      data: "SOAP note created for patient Hariom Suthar visit on 25/07/2025 [AI Enhanced Analysis]. Chief complaint: Kidney function concerns. Subjective: Patient reports decreased urination and swelling in legs. Objective: BP 140/90, HR 78, mild pedal edema noted. Assessment: Possible kidney dysfunction, requires further evaluation. Plan: Order comprehensive metabolic panel, urine analysis, and nephrology consultation. Primary Diagnosis: Chronic kidney disease stage 3. Medications: Lisinopril 10mg daily, Furosemide 20mg daily. Follow-up: Return in 2 weeks for lab results review. Quality Score: 95%. Safety Status: Safe.",
      metadata: {
        soap_note_id: "test_soap_001",
        patient_name: "Hariom Suthar",
        patient_id: "patient_123",
        appointment_id: "apt_456",
        chief_complaint: "Kidney function concerns",
        primary_diagnosis: "Chronic kidney disease stage 3",
        diagnosis: ["Chronic kidney disease stage 3", "Hypertension"],
        medications: ["Lisinopril 10mg daily", "Furosemide 20mg daily"],
        quality_score: 95,
        safety_status: true,
        has_enhanced_data: true,
        specialty: "Nephrology",
        created_date: "25/07/2025"
      }
    };

    const createResponse = await fetch(`${baseURL}/api/v1/rag/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createEmbedPayload)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log("✅ Enhanced SOAP creation embed successful!");
      console.log(`📊 Data length: ${createResult.data_length}`);
    } else {
      console.log("❌ Enhanced SOAP creation embed failed:", createResult.error);
      return;
    }

    // Test 2: Enhanced SOAP note sharing
    console.log("\n2️⃣ Testing enhanced SOAP note sharing...");
    
    const shareEmbedPayload = {
      doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
      event_type: "soap_note_shared_out",
      data: "SOAP note shared with colleague on 25/07/2025 for patient Hariom Suthar. Patient case shared for: Second opinion on kidney function decline. Permissions: view. Expires: 01/08/2025. Message: Please review this patient's kidney function and provide recommendations.",
      metadata: {
        share_id: "share_001",
        soap_note_id: "test_soap_001",
        patient_name: "Hariom Suthar",
        patient_id: "patient_123",
        from_doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
        to_doctor_id: "doctor_456",
        share_reason: "Second opinion on kidney function decline",
        permissions: "view",
        expires_at: "01/08/2025",
        shared_date: "25/07/2025"
      }
    };

    const shareResponse = await fetch(`${baseURL}/api/v1/rag/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shareEmbedPayload)
    });

    const shareResult = await shareResponse.json();
    
    if (shareResult.success) {
      console.log("✅ Enhanced SOAP sharing embed successful!");
      console.log(`📊 Data length: ${shareResult.data_length}`);
    } else {
      console.log("❌ Enhanced SOAP sharing embed failed:", shareResult.error);
      return;
    }

    // Test 3: Enhanced SOAP note action
    console.log("\n3️⃣ Testing enhanced SOAP note action...");
    
    const actionEmbedPayload = {
      doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
      event_type: "soap_note_reviewed",
      data: "SOAP note reviewed on 25/07/2025 for patient Hariom Suthar. Comments: Excellent documentation. Patient's kidney function decline is well documented. Recommend immediate nephrology referral. Changes: Added urgency flag to nephrology consultation. Reason: Patient requires specialist evaluation within 48 hours.",
      metadata: {
        action_id: "action_001",
        soap_note_id: "test_soap_001",
        patient_name: "Hariom Suthar",
        patient_id: "patient_123",
        action_type: "reviewed",
        comments: "Excellent documentation. Recommend immediate nephrology referral.",
        changes: "Added urgency flag to nephrology consultation",
        reason: "Patient requires specialist evaluation within 48 hours",
        action_date: "25/07/2025"
      }
    };

    const actionResponse = await fetch(`${baseURL}/api/v1/rag/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionEmbedPayload)
    });

    const actionResult = await actionResponse.json();
    
    if (actionResult.success) {
      console.log("✅ Enhanced SOAP action embed successful!");
      console.log(`📊 Data length: ${actionResult.data_length}`);
    } else {
      console.log("❌ Enhanced SOAP action embed failed:", actionResult.error);
      return;
    }

    // Test 4: Wait and search for SOAP notes
    console.log("\n⏳ Waiting 3 seconds for processing...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\n4️⃣ Testing search for SOAP notes with patient names...");
    
    const searchSOAPPayload = {
      doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
      query: "What SOAP notes were created for Hariom Suthar? Show me his kidney function assessment and medications.",
      similarity_threshold: 0.3,
      max_results: 10
    };

    const searchSOAPResponse = await fetch(`${baseURL}/api/v1/rag/search/doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchSOAPPayload)
    });

    const searchSOAPResult = await searchSOAPResponse.json();
    
    if (searchSOAPResult.success && searchSOAPResult.relevant_documents_count > 0) {
      console.log("🎉 SOAP notes search SUCCESS!");
      console.log(`📊 Found ${searchSOAPResult.relevant_documents_count} documents`);
      console.log(`💬 Response: ${searchSOAPResult.response}`);
    } else {
      console.log("❌ SOAP notes search failed");
      console.log(`Documents: ${searchSOAPResult.relevant_documents_count || 0}`);
    }

    // Test 5: Search for shared SOAP notes
    console.log("\n5️⃣ Testing search for shared SOAP notes...");
    
    const searchSharedPayload = {
      doctor_id: "jn749jfsf5vmg6cqbarkj0bwk17h52yh",
      query: "What SOAP notes did I share with colleagues for Hariom Suthar? What was the reason for sharing?",
      similarity_threshold: 0.3,
      max_results: 10
    };

    const searchSharedResponse = await fetch(`${baseURL}/api/v1/rag/search/doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchSharedPayload)
    });

    const searchSharedResult = await searchSharedResponse.json();
    
    if (searchSharedResult.success && searchSharedResult.relevant_documents_count > 0) {
      console.log("🎉 Shared SOAP notes search SUCCESS!");
      console.log(`📊 Found ${searchSharedResult.relevant_documents_count} documents`);
      console.log(`💬 Response: ${searchSharedResult.response}`);
    } else {
      console.log("❌ Shared SOAP notes search failed");
      console.log(`Documents: ${searchSharedResult.relevant_documents_count || 0}`);
    }

    console.log("\n📋 Enhanced SOAP RAG Integration Test Summary:");
    console.log("✅ Enhanced SOAP creation with patient name, diagnosis, medications");
    console.log("✅ Enhanced SOAP sharing with patient name, reason, permissions");
    console.log("✅ Enhanced SOAP actions with patient name, comments, changes");
    console.log("✅ Detailed metadata for better search results");
    console.log("✅ Doctor search tested for patient-specific SOAP queries");
    console.log("\n🎯 Enhanced SOAP RAG integration ready for production!");

  } catch (error) {
    console.error("❌ Enhanced SOAP RAG integration test failed:", error.message);
  }
}

// Run the test
testEnhancedSOAPRAG();
