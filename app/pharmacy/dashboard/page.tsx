"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { Building2, Pill, Users, FileText, TrendingUp, Clock, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";


import { api } from "@/convex/_generated/api";

export default function PharmacyDashboard() {
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

  const stats = [
    {
      title: "Pending Prescriptions",
      value: "12",
      description: "Awaiting processing",
      icon: Pill,
      trend: "+2 from yesterday",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Active Patients",
      value: "248",
      description: "Regular customers",
      icon: Users,
      trend: "+5 this week",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Filled Today",
      value: "34",
      description: "Prescriptions completed",
      icon: FileText,
      trend: "+8% from yesterday",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Revenue",
      value: "$2,847",
      description: "Today's earnings",
      icon: TrendingUp,
      trend: "+12% from yesterday",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "prescription_filled",
      patient: "John Smith",
      medication: "Lisinopril 10mg",
      time: "2 minutes ago",
      status: "completed",
    },
    {
      id: 2,
      type: "prescription_received",
      patient: "Sarah Johnson",
      medication: "Metformin 500mg",
      time: "15 minutes ago",
      status: "pending",
    },
    {
      id: 3,
      type: "prescription_filled",
      patient: "Mike Davis",
      medication: "Atorvastatin 20mg",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 4,
      type: "prescription_received",
      patient: "Emily Wilson",
      medication: "Omeprazole 20mg",
      time: "2 hours ago",
      status: "processing",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={session.user} 
        displayName={pharmacyProfile?.name || session.user.name || session.user.email}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {pharmacyProfile?.name || "Pharmacy"}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at your pharmacy today.
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Welcome to your pharmacy dashboard!
          </h2>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Your profile is complete and ready. Manage prescriptions, track inventory, and serve your patients efficiently.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest prescription activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.patient}</p>
                    <p className="text-xs text-muted-foreground">{activity.medication}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={
                      activity.status === "completed" ? "default" :
                      activity.status === "processing" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common pharmacy tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Pill className="h-4 w-4 mr-2" />
                Process New Prescription
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Patients
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Pharmacy Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {!pharmacyProfile?.isVerified && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-5 w-5" />
                Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Your pharmacy profile is pending verification. Please ensure all required information is complete and accurate. 
                Contact support if you need assistance with the verification process.
              </p>
              <Button variant="outline" className="mt-3" size="sm">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
