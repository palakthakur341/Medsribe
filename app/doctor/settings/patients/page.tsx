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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  ArrowLeft,
  Stethoscope,
  Save,
  MessageSquare,
  Clock,
  FileText,
  Shield
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface PatientManagementSettings {
  communication: {
    allowPatientMessaging: boolean;
    responseTimeExpectation: string;
    autoReplyEnabled: boolean;
    emergencyContactMethod: string;
  };
  consultations: {
    defaultConsultationDuration: number;
    allowVirtualConsultations: boolean;
    requireInsuranceVerification: boolean;
    allowWalkInAppointments: boolean;
  };
  documentation: {
    requireSOAPNotes: boolean;
    autoSaveInterval: number;
    shareNotesWithPatients: boolean;
    requirePatientConsent: boolean;
  };
  privacy: {
    shareDataWithColleagues: boolean;
    allowPatientDataExport: boolean;
    retainRecordsAfterDischarge: boolean;
    anonymizeDataForResearch: boolean;
  };
}

export default function DoctorPatientManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<PatientManagementSettings>({
    communication: {
      allowPatientMessaging: true,
      responseTimeExpectation: "24h",
      autoReplyEnabled: true,
      emergencyContactMethod: "phone",
    },
    consultations: {
      defaultConsultationDuration: 30,
      allowVirtualConsultations: true,
      requireInsuranceVerification: true,
      allowWalkInAppointments: false,
    },
    documentation: {
      requireSOAPNotes: true,
      autoSaveInterval: 5,
      shareNotesWithPatients: false,
      requirePatientConsent: true,
    },
    privacy: {
      shareDataWithColleagues: false,
      allowPatientDataExport: true,
      retainRecordsAfterDischarge: true,
      anonymizeDataForResearch: false,
    },
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSettingChange = (category: keyof PatientManagementSettings, setting: string, value: any) => {
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
        title: "Patient management settings saved",
        description: "Your patient interaction preferences have been updated.",
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
              <h1 className="text-xl font-bold tracking-tight">Patient Management</h1>
              <p className="text-muted-foreground text-sm">
                Configure patient interaction and consultation settings
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
              {/* Communication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Patient Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Patient Messaging</Label>
                      <p className="text-sm text-muted-foreground">Enable secure messaging with patients</p>
                    </div>
                    <Switch
                      checked={settings.communication.allowPatientMessaging}
                      onCheckedChange={(value) => handleSettingChange('communication', 'allowPatientMessaging', value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Response Time Expectation</Label>
                      <Select
                        value={settings.communication.responseTimeExpectation}
                        onValueChange={(value) => handleSettingChange('communication', 'responseTimeExpectation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">Within 1 hour</SelectItem>
                          <SelectItem value="4h">Within 4 hours</SelectItem>
                          <SelectItem value="24h">Within 24 hours</SelectItem>
                          <SelectItem value="48h">Within 48 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Emergency Contact Method</Label>
                      <Select
                        value={settings.communication.emergencyContactMethod}
                        onValueChange={(value) => handleSettingChange('communication', 'emergencyContactMethod', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="app">App Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Reply Messages</Label>
                      <p className="text-sm text-muted-foreground">Send automatic acknowledgment of received messages</p>
                    </div>
                    <Switch
                      checked={settings.communication.autoReplyEnabled}
                      onCheckedChange={(value) => handleSettingChange('communication', 'autoReplyEnabled', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Consultation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Consultation Duration (minutes)</Label>
                      <Select
                        value={settings.consultations.defaultConsultationDuration.toString()}
                        onValueChange={(value) => handleSettingChange('consultations', 'defaultConsultationDuration', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Virtual Consultations</Label>
                        <p className="text-sm text-muted-foreground">Enable telemedicine appointments</p>
                      </div>
                      <Switch
                        checked={settings.consultations.allowVirtualConsultations}
                        onCheckedChange={(value) => handleSettingChange('consultations', 'allowVirtualConsultations', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Require Insurance Verification</Label>
                        <p className="text-sm text-muted-foreground">Verify insurance before appointments</p>
                      </div>
                      <Switch
                        checked={settings.consultations.requireInsuranceVerification}
                        onCheckedChange={(value) => handleSettingChange('consultations', 'requireInsuranceVerification', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Walk-in Appointments</Label>
                        <p className="text-sm text-muted-foreground">Accept patients without prior appointments</p>
                      </div>
                      <Switch
                        checked={settings.consultations.allowWalkInAppointments}
                        onCheckedChange={(value) => handleSettingChange('consultations', 'allowWalkInAppointments', value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documentation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Require SOAP Notes</Label>
                      <p className="text-sm text-muted-foreground">Mandate SOAP note completion for all consultations</p>
                    </div>
                    <Switch
                      checked={settings.documentation.requireSOAPNotes}
                      onCheckedChange={(value) => handleSettingChange('documentation', 'requireSOAPNotes', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-save Interval (minutes)</Label>
                    <Select
                      value={settings.documentation.autoSaveInterval.toString()}
                      onValueChange={(value) => handleSettingChange('documentation', 'autoSaveInterval', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 minute</SelectItem>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="10">Every 10 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Notes with Patients</Label>
                      <p className="text-sm text-muted-foreground">Allow patients to view their medical notes</p>
                    </div>
                    <Switch
                      checked={settings.documentation.shareNotesWithPatients}
                      onCheckedChange={(value) => handleSettingChange('documentation', 'shareNotesWithPatients', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Require Patient Consent</Label>
                      <p className="text-sm text-muted-foreground">Require explicit consent for data sharing</p>
                    </div>
                    <Switch
                      checked={settings.documentation.requirePatientConsent}
                      onCheckedChange={(value) => handleSettingChange('documentation', 'requirePatientConsent', value)}
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
