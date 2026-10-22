"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StreamlinedRegistration } from "@/app/auth/_components/streamlined-registration";
import { ThemeToggle } from "@/components/theme-toggle";
import { type UserRole } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Get the selected role from localStorage
    const role = localStorage.getItem("selectedRole") as UserRole;
    if (role) {
      setSelectedRole(role);
    } else {
      // If no role selected, redirect to role selection
      router.push("/auth/select-role");
    }
  }, [router]);

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Redirecting to role selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <StreamlinedRegistration role={selectedRole} />
    </div>
  );
}