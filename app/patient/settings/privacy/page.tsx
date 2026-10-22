"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, Lock, Users, FileText, AlertTriangle, Save, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface PrivacySettings {
  dataSharing: {
    allowResearch: boolean;
    allowMarketing: boolean;
    shareWithPartners: boolean;
    anonymousAnalytics: boolean;
  };
  visibility: {
    profileVisible: boolean;
    appointmentHistory: boolean;
    medicalHistory: boolean;
    contactInfo: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: boolean;
    loginNotifications: boolean;
    deviceTracking: boolean;
  };
}

export default function PrivacyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: {
      allowResearch: false,
      allowMarketing: false,
      shareWithPartners: false,
      anonymousAnalytics: true,
    },
    visibility: {
      profileVisible: true,
      appointmentHistory: false,
      medicalHistory: false,
      contactInfo: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: true,
      loginNotifications: true,
      deviceTracking: true,
    },
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  const handleSettingChange = (category: keyof PrivacySettings, setting: string, value: boolean) => {
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

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/patient/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Privacy & Security</h1>
              <p className="text-muted-foreground text-sm">
                Manage your privacy settings and account security
              </p>
            </div>
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
                  Your privacy is important to us. These settings help you control how your data is used and shared.
                  Changes to critical security settings may require email verification.
                </AlertDescription>
              </Alert>

        {/* Data Sharing */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Data Sharing
            </CardTitle>
            <CardDescription>
              Control how your data is shared with third parties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Medical Research</Label>
                <p className="text-sm text-muted-foreground">Allow anonymized data to be used for medical research</p>
              </div>
              <Switch
                checked={settings.dataSharing.allowResearch}
                onCheckedChange={(value) => handleSettingChange('dataSharing', 'allowResearch', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">Receive personalized health tips and product recommendations</p>
              </div>
              <Switch
                checked={settings.dataSharing.allowMarketing}
                onCheckedChange={(value) => handleSettingChange('dataSharing', 'allowMarketing', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Partner Sharing</Label>
                <p className="text-sm text-muted-foreground">Share data with trusted healthcare partners</p>
              </div>
              <Switch
                checked={settings.dataSharing.shareWithPartners}
                onCheckedChange={(value) => handleSettingChange('dataSharing', 'shareWithPartners', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Anonymous Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve our services with anonymous usage data</p>
              </div>
              <Switch
                checked={settings.dataSharing.anonymousAnalytics}
                onCheckedChange={(value) => handleSettingChange('dataSharing', 'anonymousAnalytics', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Visibility */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Profile Visibility
            </CardTitle>
            <CardDescription>
              Control what information is visible to healthcare providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Profile Information</Label>
                <p className="text-sm text-muted-foreground">Basic profile information visible to doctors</p>
              </div>
              <Switch
                checked={settings.visibility.profileVisible}
                onCheckedChange={(value) => handleSettingChange('visibility', 'profileVisible', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Appointment History</Label>
                <p className="text-sm text-muted-foreground">Past appointments visible to new doctors</p>
              </div>
              <Switch
                checked={settings.visibility.appointmentHistory}
                onCheckedChange={(value) => handleSettingChange('visibility', 'appointmentHistory', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Medical History</Label>
                <p className="text-sm text-muted-foreground">Medical history and SOAP notes visibility</p>
              </div>
              <Switch
                checked={settings.visibility.medicalHistory}
                onCheckedChange={(value) => handleSettingChange('visibility', 'medicalHistory', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Enhance your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(value) => handleSettingChange('security', 'twoFactorAuth', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
              </div>
              <Switch
                checked={settings.security.sessionTimeout}
                onCheckedChange={(value) => handleSettingChange('security', 'sessionTimeout', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
              </div>
              <Switch
                checked={settings.security.loginNotifications}
                onCheckedChange={(value) => handleSettingChange('security', 'loginNotifications', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
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
