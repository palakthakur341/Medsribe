"use client";

import * as React from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  Lock,
  Globe,
  Mail,
  Calendar,
  FileText,
  LogOut,
  Edit,
  Eye,
  Moon,
  Sun
} from "lucide-react";
import {
  usePatientAuth,
  useSettings,
  useTheme,
  SettingsItem,
  SettingsSection,
} from "@/app/patient/_components/settings";

/**
 * Patient Settings Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive settings management
 * - Theme and notification controls
 */
const PatientSettingsPage = React.memo(() => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    session
  } = usePatientAuth();

  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  // Memoized loading state
  const isLoading = React.useMemo(() => authLoading, [authLoading]);

  // Memoized authentication check
  const isAuthorized = React.useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );

  // Memoized handlers for performance
  const handleNotificationToggle = useCallback(async (type: 'push' | 'email', value: boolean) => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        [type === 'push' ? 'pushNotifications' : 'emailNotifications']: value,
      }
    });
  }, [settings.notifications, updateSettings]);

  const handleThemeChange = useCallback((checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  }, [setTheme]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.replace("/auth/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your profile, preferences, and account security
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Patient Account
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="space-y-6">
            {/* Profile Section */}
            <SettingsSection title="Profile Information">
              <SettingsItem
                icon={User}
                title="Personal Details"
                description="Update your name, contact information, and medical details"
                href="/patient/settings/profile"
              />

              <SettingsItem
                icon={Mail}
                title="Email Address"
                description={session?.user?.email || "No email address"}
                action={
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                }
              />
            </SettingsSection>

            {/* Notifications Section */}
            <SettingsSection title="Notifications">
              <SettingsItem
                icon={Bell}
                title="Push Notifications"
                description="Receive notifications about appointments and updates"
                action={
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationToggle('push', checked)}
                  />
                }
              />

              <SettingsItem
                icon={Mail}
                title="Email Notifications"
                description="Get important updates via email"
                action={
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                  />
                }
              />

              <SettingsItem
                icon={Calendar}
                title="Appointment Reminders"
                description="Receive reminders before your appointments"
                badge="24h before"
                action={
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                }
              />
            </SettingsSection>

            {/* Appearance Section */}
            <SettingsSection title="Appearance">
              <SettingsItem
                icon={theme === "dark" ? Moon : Sun}
                title="Dark Mode"
                description={`Currently using ${theme === "dark" ? "dark" : "light"} theme`}
                action={
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={handleThemeChange}
                  />
                }
              />

              <SettingsItem
                icon={Globe}
                title="Language"
                description="English (US)"
                disabled
                badge="Coming Soon"
              />
            </SettingsSection>

            {/* Account & Security Section */}
            <SettingsSection title="Account & Security">
              <SettingsItem
                icon={Lock}
                title="Password & Security"
                description="Change password, reset password, and manage account security"
                href="/patient/settings/security"
              />

              <SettingsItem
                icon={Shield}
                title="Privacy Settings"
                description="Control who can see your information and data sharing preferences"
                href="/patient/settings/privacy"
              />

              <SettingsItem
                icon={Eye}
                title="Data Sharing"
                description="Manage how your data is shared with healthcare providers"
                action={
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                }
              />
            </SettingsSection>

            {/* Support Section */}
            <SettingsSection title="Support">
              <SettingsItem
                icon={HelpCircle}
                title="Help Center"
                description="Find answers to common questions"
                href="/patient/help"
              />

              <SettingsItem
                icon={FileText}
                title="Terms & Privacy"
                description="Review our terms of service and privacy policy"
                href="/legal"
              />

              <SettingsItem
                icon={LogOut}
                title="Sign Out"
                description="Sign out of your account"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </Button>
                }
              />
            </SettingsSection>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

PatientSettingsPage.displayName = "PatientSettingsPage";

export default PatientSettingsPage;
