"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Bell, 
  Shield, 
  Calendar, 
  Pill, 
  Heart, 
  Settings,
  Save,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";

export function EmailPreferences() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Get current preferences
  const preferences = useQuery(
    api.emailAutomation.getUserEmailPreferences,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  const updatePreferences = useMutation(api.emailAutomation.updateEmailPreferences);

  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Update local state when preferences load
  if (preferences && !localPreferences) {
    setLocalPreferences(preferences);
  }

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!session?.user?.id || !localPreferences) return;

    setIsSaving(true);
    try {
      await updatePreferences({
        userId: session.user.id as any,
        preferences: localPreferences,
      });

      toast({
        title: "Preferences saved",
        description: "Your email preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!preferences || !localPreferences) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage your email notifications and communication preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Welcome & Account Emails */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h3 className="font-medium">Account & Welcome</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Welcome Emails</Label>
                <p className="text-xs text-muted-foreground">
                  Receive welcome messages when you join
                </p>
              </div>
              <Switch
                checked={localPreferences.welcomeEmails}
                onCheckedChange={(value) => handlePreferenceChange('welcomeEmails', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Profile Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders to complete your profile
                </p>
              </div>
              <Switch
                checked={localPreferences.profileReminders}
                onCheckedChange={(value) => handlePreferenceChange('profileReminders', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Re-engagement Emails</Label>
                <p className="text-xs text-muted-foreground">
                  Emails when you haven't used the app for a while
                </p>
              </div>
              <Switch
                checked={localPreferences.reengagementEmails}
                onCheckedChange={(value) => handlePreferenceChange('reengagementEmails', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Appointment Emails */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <h3 className="font-medium">Appointments</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Appointment Confirmations</Label>
                <p className="text-xs text-muted-foreground">
                  Confirmations when appointments are scheduled
                </p>
              </div>
              <Switch
                checked={localPreferences.appointmentConfirmations}
                onCheckedChange={(value) => handlePreferenceChange('appointmentConfirmations', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Appointment Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders 24h and 1h before appointments
                </p>
              </div>
              <Switch
                checked={localPreferences.appointmentReminders}
                onCheckedChange={(value) => handlePreferenceChange('appointmentReminders', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Medical Emails */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <h3 className="font-medium">Medical & Health</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Treatment Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders about ongoing treatments
                </p>
              </div>
              <Switch
                checked={localPreferences.treatmentReminders}
                onCheckedChange={(value) => handlePreferenceChange('treatmentReminders', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Medication Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders to take medications
                </p>
              </div>
              <Switch
                checked={localPreferences.medicationReminders}
                onCheckedChange={(value) => handlePreferenceChange('medicationReminders', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Security & System Emails */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <h3 className="font-medium">Security & System</h3>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Security Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Important security notifications
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Required</Badge>
                <Switch
                  checked={localPreferences.securityAlerts}
                  onCheckedChange={(value) => handlePreferenceChange('securityAlerts', value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">System Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Maintenance and system updates
                </p>
              </div>
              <Switch
                checked={localPreferences.systemNotifications}
                onCheckedChange={(value) => handlePreferenceChange('systemNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Marketing Emails</Label>
                <p className="text-xs text-muted-foreground">
                  Product updates and promotional content
                </p>
              </div>
              <Switch
                checked={localPreferences.marketingEmails}
                onCheckedChange={(value) => handlePreferenceChange('marketingEmails', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Frequency */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-medium">Email Frequency</h3>
          </div>
          
          <div className="ml-6">
            <Label className="text-sm font-medium">Delivery Preference</Label>
            <p className="text-xs text-muted-foreground mb-3">
              How often would you like to receive emails?
            </p>
            <div className="space-y-2">
              {[
                { value: "immediate", label: "Immediate", description: "Send emails as they happen" },
                { value: "daily_digest", label: "Daily Digest", description: "One email per day with all updates" },
                { value: "weekly_digest", label: "Weekly Digest", description: "One email per week with all updates" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option.value}
                    name="emailFrequency"
                    value={option.value}
                    checked={localPreferences.emailFrequency === option.value}
                    onChange={(e) => handlePreferenceChange('emailFrequency', e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Label htmlFor={option.value} className="text-sm font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
