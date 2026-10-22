import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Shield, Upload } from "lucide-react";
import type { ProfileHeaderProps } from "../types";

/**
 * Profile Header Component
 * Displays profile overview and navigation
 */
export const ProfileHeader = React.memo<ProfileHeaderProps>(({
  patientProfile,
  session,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/patient/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your personal information and medical details
          </p>
        </div>
        {patientProfile && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            MRN: {patientProfile.mrn}
          </Badge>
        )}
      </div>

      {/* Profile Overview */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm">
            {patientProfile ?
              `${patientProfile.firstName?.[0] || ""}${patientProfile.lastName?.[0] || ""}` :
              session?.user?.email?.charAt(0).toUpperCase() || "U"
            }
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">
            {patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : "Complete Your Profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {patientProfile ?
              `Patient since ${new Date(patientProfile.createdAt || 0).toLocaleDateString()}` :
              "Set up your patient profile to get started"
            }
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>
      </div>
    </div>
  );
});

ProfileHeader.displayName = "ProfileHeader";
