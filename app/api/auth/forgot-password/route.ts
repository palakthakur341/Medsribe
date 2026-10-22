import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Generate password reset token and send email
    await convex.action(api.users.generatePasswordResetToken, {
      email: validatedData.email,
    });

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, you will receive a password reset link shortly.",
    });

  } catch (error: any) {
    console.error("Forgot password error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Always return success message for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, you will receive a password reset link shortly.",
    });
  }
}
