"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  FileText, 
  AlertTriangle, 
  Save, 
  ArrowLeft,
  Stethoscope,
  Database,
  UserCheck
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface DoctorPrivacySettings {
  patientDataSharing: {
    allowResearch: boolean;
    shareWithColleagues: boolean;
    anonymousAnalytics: boolean;
    qualityImprovement: boolean;
  };
  profileVisibility: {
    publicProfile: boolean;
    patientReviews: boolean;
    specialtyListing: boolean;
    contactInfo: boolean;
  };
  communication: {
    patientMessaging: boolean;
    appointmentReminders: boolean;
    marketingCommunications: boolean;
    professionalUpdates: boolean;
  };
}

export default function DoctorPrivacyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<DoctorPrivacySettings>({
    patientDataSharing: {
      allowResearch: false,
      shareWithColleagues: false,
      anonymousAnalytics: true,
      qualityImprovement: true,
    },
    profileVisibility: {
      publicProfile: true,
      patientReviews: true,
      specialtyListing: true,
      contactInfo: false,
    },
    communication: {
      patientMessaging: true,
      appointmentReminders: true,
      marketingCommunications: false,
      professionalUpdates: true,
    },
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSettingChange = (category: keyof DoctorPrivacySettings, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would save the settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Privacy settings saved",
        description: "Your privacy preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/doctor/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Privacy & Security</h1>
              <p className="text-muted-foreground text-sm">
                Manage your privacy settings and data sharing preferences
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              Doctor Account
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="space-y-6">
              {/* Privacy Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  As a healthcare provider, your privacy settings must comply with HIPAA regulations. 
                  Patient data sharing requires explicit consent and follows strict medical privacy guidelines.
                </AlertDescription>
              </Alert>

              {/* Patient Data Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Patient Data Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Medical Research</Label>
                      <p className="text-sm text-muted-foreground">Allow anonymized patient data for medical research (HIPAA compliant)</p>
                    </div>
                    <Switch
                      checked={settings.patientDataSharing.allowResearch}
                      onCheckedChange={(value) => handleSettingChange('patientDataSharing', 'allowResearch', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Colleague Consultation</Label>
                      <p className="text-sm text-muted-foreground">Share case data with colleagues for consultation purposes</p>
                    </div>
                    <Switch
                      checked={settings.patientDataSharing.shareWithColleagues}
                      onCheckedChange={(value) => handleSettingChange('patientDataSharing', 'shareWithColleagues', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Quality Improvement</Label>
                      <p className="text-sm text-muted-foreground">Use data for healthcare quality improvement initiatives</p>
                    </div>
                    <Switch
                      checked={settings.patientDataSharing.qualityImprovement}
                      onCheckedChange={(value) => handleSettingChange('patientDataSharing', 'qualityImprovement', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Anonymous Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve medical software with anonymous usage data</p>
                    </div>
                    <Switch
                      checked={settings.patientDataSharing.anonymousAnalytics}
                      onCheckedChange={(value) => handleSettingChange('patientDataSharing', 'anonymousAnalytics', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Profile Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Professional Profile Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Make your professional profile visible to patients</p>
                    </div>
                    <Switch
                      checked={settings.profileVisibility.publicProfile}
                      onCheckedChange={(value) => handleSettingChange('profileVisibility', 'publicProfile', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Patient Reviews</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to leave reviews on your profile</p>
                    </div>
                    <Switch
                      checked={settings.profileVisibility.patientReviews}
                      onCheckedChange={(value) => handleSettingChange('profileVisibility', 'patientReviews', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Specialty Listing</Label>
                      <p className="text-sm text-muted-foreground">Include your specialties in public directories</p>
                    </div>
                    <Switch
                      checked={settings.profileVisibility.specialtyListing}
                      onCheckedChange={(value) => handleSettingChange('profileVisibility', 'specialtyListing', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Contact Information</Label>
                      <p className="text-sm text-muted-foreground">Show contact details in public profile</p>
                    </div>
                    <Switch
                      checked={settings.profileVisibility.contactInfo}
                      onCheckedChange={(value) => handleSettingChange('profileVisibility', 'contactInfo', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Communication Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Communication Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Patient Messaging</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to send you secure messages</p>
                    </div>
                    <Switch
                      checked={settings.communication.patientMessaging}
                      onCheckedChange={(value) => handleSettingChange('communication', 'patientMessaging', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send automated appointment reminders to patients</p>
                    </div>
                    <Switch
                      checked={settings.communication.appointmentReminders}
                      onCheckedChange={(value) => handleSettingChange('communication', 'appointmentReminders', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Professional Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about medical guidelines and best practices</p>
                    </div>
                    <Switch
                      checked={settings.communication.professionalUpdates}
                      onCheckedChange={(value) => handleSettingChange('communication', 'professionalUpdates', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional content and product updates</p>
                    </div>
                    <Switch
                      checked={settings.communication.marketingCommunications}
                      onCheckedChange={(value) => handleSettingChange('communication', 'marketingCommunications', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
