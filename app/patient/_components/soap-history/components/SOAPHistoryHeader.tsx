"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { SOAPHistoryHeaderProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Generic and configurable SOAP History Header component
 * Reusable with customizable title, subtitle, and actions
 */
export const SOAPHistoryHeader = React.memo<SOAPHistoryHeaderProps>(({
  patientProfile,
  onCreateNew,
  showCreateButton = true,
  title = "SOAP Notes History",
  subtitle = "View and manage your generated clinical documentation",
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {subtitle}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Patient Badge */}
        {patientProfile && (
          <Badge variant="outline" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Patient: {patientProfile.firstName} {patientProfile.lastName}
          </Badge>
        )}
        
        {/* Create New Button */}
        {showCreateButton && (
          <>
            {onCreateNew ? (
              <Button 
                size="sm" 
                className="flex items-center gap-2"
                onClick={onCreateNew}
              >
                <Plus className="h-4 w-4" />
                Generate New SOAP
              </Button>
            ) : (
              <Link href="/patient/soap/generate">
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate New SOAP
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
});

SOAPHistoryHeader.displayName = "SOAPHistoryHeader";
