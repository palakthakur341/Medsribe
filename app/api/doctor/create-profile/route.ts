import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      userId,
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      npiNumber,
      primarySpecialty,
      deaNumber,
      practiceAddress,
    } = body;

    if (!userId || !firstName || !lastName || !email || !phone || !licenseNumber || !primarySpecialty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create doctor profile in Convex
    const doctorId = await convex.mutation(api.doctors.createOrUpdateDoctorProfile, {
      userId,
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      npiNumber: npiNumber || "",
      deaNumber: deaNumber || "",
      primarySpecialty,
      title: "Dr.",
      medicalSchool: "", // Can be updated later
      yearsOfExperience: 0, // Can be updated later
      secondarySpecialties: [],
      boardCertifications: [],
      residency: "",
      fellowship: "",
      practiceName: "",
      department: "",
      hospitalAffiliations: [],
      consultationFee: 0,
      languagesSpoken: [],
      bio: "",
      isAcceptingNewPatients: true,
    });

    return NextResponse.json({
      success: true,
      doctorId,
      message: "Doctor profile created successfully",
    });

  } catch (error) {
    console.error("Doctor profile creation error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to create doctor profile" 
      },
      { status: 500 }
    );
  }
}
