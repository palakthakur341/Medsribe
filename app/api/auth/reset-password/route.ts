import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { resetPasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = resetPasswordSchema.parse(body);
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);
    
    // Reset password with token
    await convex.mutation(api.users.resetPasswordWithToken, {
      token: validatedData.token,
      newPasswordHash: passwordHash,
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });

  } catch (error: any) {
    console.error("Reset password error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 400 }
    );
  }
}
