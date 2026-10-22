import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, role } = body;

    if (!email || !firstName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, just log the welcome email details
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Nodemailer with SMTP
    
    console.log(`Welcome email would be sent to: ${email}`);
    console.log(`User: ${firstName}, Role: ${role}`);
    
    const emailContent = getWelcomeEmailContent(firstName, role);
    console.log("Email content:", emailContent);

    // Simulate email sending success
    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });

  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to send welcome email" 
      },
      { status: 500 }
    );
  }
}

function getWelcomeEmailContent(firstName: string, role: string) {
  const roleSpecificContent = {
    patient: {
      subject: "Welcome to MedScribe - Your Health Journey Starts Here",
      content: `
        Dear ${firstName},

        Welcome to MedScribe! We're excited to have you join our healthcare platform.

        As a patient, you can:
        • Manage your medical records securely
        • Connect with healthcare providers
        • Track your medications and treatments
        • Access your health information anytime, anywhere

        Next steps:
        1. Complete your patient profile
        2. Add your medical history and allergies
        3. Set up emergency contacts
        4. Explore the platform features

        If you have any questions, our support team is here to help.

        Best regards,
        The MedScribe Team
      `
    },
    doctor: {
      subject: "Welcome to MedScribe - Start Caring for Patients Digitally",
      content: `
        Dear Dr. ${firstName},

        Welcome to MedScribe! We're honored to have you join our healthcare platform.

        As a healthcare provider, you can:
        • Manage patient records efficiently
        • Create and track prescriptions
        • Generate SOAP notes with AI assistance
        • Collaborate with other healthcare professionals

        Next steps:
        1. Complete your professional profile
        2. Add your medical credentials and licenses
        3. Set up your practice information
        4. Start accepting patients

        We're here to support you in providing excellent patient care.

        Best regards,
        The MedScribe Team
      `
    },
    pharmacy: {
      subject: "Welcome to MedScribe - Your Pharmacy Management Solution",
      content: `
        Dear ${firstName},

        Welcome to MedScribe! We're excited to have your pharmacy join our healthcare network.

        As a pharmacy partner, you can:
        • Manage prescription orders efficiently
        • Track inventory and medications
        • Connect with healthcare providers
        • Streamline your pharmacy operations

        Next steps:
        1. Complete your pharmacy profile
        2. Add your pharmacy licenses and credentials
        3. Set up your operational information
        4. Begin receiving prescriptions

        Our team will assist you with the verification process.

        Best regards,
        The MedScribe Team
      `
    }
  };

  return roleSpecificContent[role as keyof typeof roleSpecificContent] || {
    subject: "Welcome to MedScribe",
    content: `Dear ${firstName}, Welcome to MedScribe!`
  };
}
