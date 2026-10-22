"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Lock,
  Globe,
  Mail,
  Calendar,
  FileText,
  LogOut,
  Edit,
  Eye,
  Moon,
  Sun,
  Users,
  Stethoscope
} from "lucide-react";
import Link from "next/link";

// Settings Item Component
function SettingsItem({
  icon: Icon,
  title,
  description,
  action,
  href,
  badge,
  disabled = false
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  href?: string;
  badge?: string;
  disabled?: boolean;
}) {
  const content = (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
      disabled
        ? "opacity-50 cursor-not-allowed bg-muted/20"
        : href
          ? "hover:bg-muted/50 cursor-pointer"
          : "bg-background"
    }`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{title}</h3>
            {badge && (
              <Badge variant={disabled ? "secondary" : "outline"} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {href && !disabled && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function DoctorSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.replace("/auth/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);



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
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground text-sm">
                Manage your account settings and preferences
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
              {/* Profile Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={User}
                    title="Professional Profile"
                    description="Update your credentials, specialties, and professional information"
                    href="/doctor/settings/profile"
                  />

                  <SettingsItem
                    icon={Mail}
                    title="Email Address"
                    description={session.user.email || "No email address"}
                    action={
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={Bell}
                    title="Push Notifications"
                    description="Receive notifications for appointments and patient updates"
                    action={
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    }
                  />

                  <SettingsItem
                    icon={Mail}
                    title="Email Notifications"
                    description="Get email alerts for important updates and reminders"
                    action={
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    }
                  />

                  <SettingsItem
                    icon={Calendar}
                    title="Appointment Reminders"
                    description="Configure timing and frequency of appointment notifications"
                    badge="1h before"
                    action={
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={theme === "dark" ? Moon : Sun}
                    title="Dark Mode"
                    description={`Currently using ${theme === "dark" ? "dark" : "light"} theme`}
                    action={
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
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
                </div>
              </div>

              {/* Practice & Schedule */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Practice & Schedule</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={Calendar}
                    title="Schedule & Availability"
                    description="Set your working hours and appointment preferences"
                    href="/doctor/settings/schedule"
                  />

                  <SettingsItem
                    icon={Users}
                    title="Patient Management"
                    description="Configure patient interaction and consultation settings"
                    href="/doctor/settings/patients"
                  />

                  <SettingsItem
                    icon={FileText}
                    title="SOAP Notes Templates"
                    description="Create and manage templates for medical documentation"
                    href="/doctor/settings/templates"
                  />

                  <SettingsItem
                    icon={Stethoscope}
                    title="Practice Information"
                    description="Manage practice details, contact information, and professional settings"
                    href="/doctor/settings/practice"
                  />
                </div>
              </div>

              {/* Account & Security */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Account & Security</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={Lock}
                    title="Password & Security"
                    description="Change password, reset password, and manage account security"
                    href="/doctor/settings/security"
                  />

                  <SettingsItem
                    icon={Shield}
                    title="Privacy Settings"
                    description="Control data sharing and privacy preferences"
                    href="/doctor/settings/privacy"
                  />

                  <SettingsItem
                    icon={Eye}
                    title="Professional Verification"
                    description="Manage license verification and professional credentials"
                    action={
                      <Button variant="outline" size="sm">
                        Verify
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Support</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={HelpCircle}
                    title="Help Center"
                    description="Access documentation and support resources"
                    action={
                      <Button variant="outline" size="sm">
                        View Help
                      </Button>
                    }
                  />

                  <SettingsItem
                    icon={FileText}
                    title="Terms & Privacy"
                    description="Review terms of service and privacy policy"
                    action={
                      <Button variant="outline" size="sm">
                        View Terms
                      </Button>
                    }
                  />

                  <SettingsItem
                    icon={LogOut}
                    title="Sign Out"
                    description="Sign out of your doctor account"
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
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
  );
}
