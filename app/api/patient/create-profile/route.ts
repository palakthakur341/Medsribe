import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      primaryPhone,
      addressLine1,
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      secondaryPhone,
      addressLine2,
      nationalId,
      bloodType,
      primaryCarePhysicianId,
      preferredLanguage,
      advanceDirectives
    } = body;

    // Validate required fields
    if (!userId || !firstName || !lastName || !email || !primaryPhone ||
        !addressLine1 || !city || !state || !zipCode || !country ||
        !emergencyContactName || !emergencyContactPhone || !emergencyContactRelation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create patient profile
    const patientId = await convex.mutation(api.patients.createPatientProfile, {
      userId,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || "1990-01-01",
      gender: gender || "M",
      primaryPhone,
      email,
      addressLine1,
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      // Optional fields
      secondaryPhone,
      addressLine2,
      nationalId,
      bloodType,
      primaryCarePhysicianId,
      preferredLanguage,
      advanceDirectives,
    });

    return NextResponse.json({ success: true, patientId });
  } catch (error) {
    console.error("Error creating patient profile:", error);
    return NextResponse.json(
      { error: "Failed to create patient profile" },
      { status: 500 }
    );
  }
}
