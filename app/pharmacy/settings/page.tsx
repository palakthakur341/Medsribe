"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { Building2, User, Settings, Bell, Shield, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PharmacyProfileForm } from "@/components/pharmacy/pharmacy-profile-form";
import { api } from "@/convex/_generated/api";

export default function PharmacySettings() {
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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy profile and preferences.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Pharmacy Profile */}
          <TabsContent value="profile">
            <PharmacyProfileForm 
              pharmacyProfile={pharmacyProfile} 
              userId={session.user.id}
            />
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{session.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-sm text-muted-foreground capitalize">{session.user.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Account management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Management */}
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Management
                </CardTitle>
                <CardDescription>
                  Manage pharmacy staff and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Staff Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Add and manage pharmacy staff members, assign roles, and control access permissions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature is coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Customize your notification preferences for prescriptions, alerts, and system updates.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature is coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Security Settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure two-factor authentication, password settings, and access controls.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature is coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
