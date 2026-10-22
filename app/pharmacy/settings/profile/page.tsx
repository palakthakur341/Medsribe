"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PharmacyProfileForm } from "@/components/pharmacy/pharmacy-profile-form";
import { api } from "@/convex/_generated/api";

export default function PharmacyProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "pharmacy") {
    redirect("/auth/login");
  }

  // Get pharmacy profile
  const pharmacyProfile = useQuery(api.pharmacies.getPharmacyByUserId, {
    userId: session.user.id as any,
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={session.user} 
        displayName={pharmacyProfile?.name || session.user.name || session.user.email}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/pharmacy/settings">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Pharmacy Profile</h1>
            <p className="text-muted-foreground">
              Manage your pharmacy information and settings.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <PharmacyProfileForm 
          pharmacyProfile={pharmacyProfile} 
          userId={session.user.id}
        />
      </main>
    </div>
  );
}
