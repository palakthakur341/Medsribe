import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { authOptions } from "@/lib/auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user ID from the session
    const userId = session.user.id as Id<"users">;

    // Delete the user account and all related data
    const result = await convex.mutation(api.users.deleteUserAccount, {
      userId,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error: any) {
    console.error("Delete account error:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
