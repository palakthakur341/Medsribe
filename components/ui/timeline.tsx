"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  User, 
  Stethoscope,
  Share,
  UserCheck,
  AlertCircle
} from "lucide-react";

interface TimelineItem {
  id: string;
  type: "patient_share" | "doctor_referral" | "specialist_accept" | "specialist_decline" | "doctor_action";
  timestamp: number;
  actor: {
    name: string;
    role: "patient" | "doctor";
    specialization?: string;
    avatar?: string;
  };
  target?: {
    name: string;
    role: "doctor";
    specialization?: string;
    avatar?: string;
  };
  status: "completed" | "pending" | "declined";
  message?: string;
  isRead?: boolean;
  actionType?: "assistance_provided" | "appointment_scheduled" | "referral_sent" | "treatment_initiated";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeConfig = (type: TimelineItem['type']) => {
    switch (type) {
      case "patient_share":
        return {
          icon: Share,
          color: "text-primary",
          bg: "bg-primary/10",
          label: "Shared with doctor"
        };
      case "doctor_referral":
        return {
          icon: ArrowRight,
          color: "text-muted-foreground",
          bg: "bg-muted/30",
          label: "Referred to specialist"
        };
      case "specialist_accept":
        return {
          icon: CheckCircle,
          color: "text-primary",
          bg: "bg-primary/10",
          label: "Referral accepted"
        };
      case "specialist_decline":
        return {
          icon: AlertCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          label: "Referral declined"
        };
      case "doctor_action":
        return {
          icon: CheckCircle,
          color: "text-secondary-foreground",
          bg: "bg-secondary/30",
          label: "Action taken"
        };
    }
  };

  const getStatusBadge = (status: TimelineItem['status'], isRead?: boolean) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="text-xs">
            {isRead ? "Reviewed" : "Completed"}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-xs border-muted-foreground/50 text-muted-foreground bg-muted/10">
            Pending
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="text-xs border-destructive/50 text-destructive bg-destructive/10">
            Declined
          </Badge>
        );
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="p-1 bg-muted rounded-md">
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Activity Timeline</span>
      </div>

      <div className="relative">
        {items.map((item, index) => {
          const config = getTypeConfig(item.type);
          const Icon = config.icon;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="relative flex gap-2">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-3 top-6 w-px h-8 bg-border" />
              )}

              {/* Timeline node */}
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border border-background",
                config.bg
              )}>
                <Icon className={cn("h-3 w-3", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-medium">
                        {item.type === "doctor_action" && item.actionType ?
                          (() => {
                            switch (item.actionType) {
                              case "assistance_provided": return "Medical assistance provided";
                              case "appointment_scheduled": return "Appointment scheduled";
                              case "referral_sent": return "Referred to specialist";
                              case "treatment_initiated": return "Treatment plan initiated";
                              default: return config.label;
                            }
                          })() : config.label
                        }
                      </span>
                      {getStatusBadge(item.status, item.isRead)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={item.actor.avatar} />
                        <AvatarFallback className="text-xs">
                          {(item.actor.name || 'Unknown').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {item.actor.role === "patient"
                          ? (item.actor.name || 'Unknown Patient')
                          : `Dr. ${item.actor.name || 'Unknown Doctor'}`}
                        {item.actor.specialization && ` (${item.actor.specialization})`}
                      </span>

                      {item.target && (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={item.target.avatar} />
                            <AvatarFallback className="text-xs">
                              {(item.target.name || 'Unknown').split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            Dr. {item.target.name || 'Unknown Doctor'}
                            {item.target.specialization && ` (${item.target.specialization})`}
                          </span>
                        </>
                      )}
                    </div>

                    {item.message && (
                      <p className="text-xs text-muted-foreground italic mb-1">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to create timeline items from shared SOAP data and referrals
export function createTimelineFromSharedNotes(sharedNotes: any[], referrals: any[] = [], soapNoteId: string): TimelineItem[] {
  const timelineItems: TimelineItem[] = [];

  // Add shared notes to timeline
  sharedNotes.forEach((shared) => {
    if (shared.shareType === "direct_share") {
      timelineItems.push({
        id: shared._id,
        type: "patient_share",
        timestamp: shared.createdAt,
        actor: {
          name: `${shared.patient?.firstName || 'Unknown'} ${shared.patient?.lastName || 'Patient'}`,
          role: "patient"
        },
        target: {
          name: `${shared.doctor?.firstName || 'Unknown'} ${shared.doctor?.lastName || 'Doctor'}`,
          role: "doctor",
          specialization: shared.doctor?.primarySpecialty,
          avatar: shared.doctor?.profileImageUrl
        },
        status: shared.isRead ? "completed" : "pending",
        message: shared.message,
        isRead: shared.isRead
      });

      // Add doctor action if available
      if (shared.actionStatus && shared.actionTakenAt) {
        const actionLabels = {
          assistance_provided: "Medical assistance provided",
          appointment_scheduled: "Appointment scheduled",
          referral_sent: "Referred to specialist",
          treatment_initiated: "Treatment plan initiated"
        };

        timelineItems.push({
          id: `${shared._id}_action`,
          type: "doctor_action",
          timestamp: shared.actionTakenAt,
          actor: {
            name: `${shared.doctor?.firstName || 'Unknown'} ${shared.doctor?.lastName || 'Doctor'}`,
            role: "doctor",
            specialization: shared.doctor?.primarySpecialty,
            avatar: shared.doctor?.profileImageUrl
          },
          status: "completed",
          message: shared.actionDetails || actionLabels[shared.actionStatus],
          actionType: shared.actionStatus
        });
      }
    } else if (shared.shareType === "referral_share") {
      // This would be a specialist acceptance
      timelineItems.push({
        id: shared._id,
        type: "specialist_accept",
        timestamp: shared.createdAt,
        actor: {
          name: `${shared.doctor?.firstName || 'Unknown'} ${shared.doctor?.lastName || 'Doctor'}`,
          role: "doctor",
          specialization: shared.doctor?.primarySpecialty,
          avatar: shared.doctor?.profileImageUrl
        },
        status: shared.isRead ? "completed" : "pending",
        message: shared.message,
        isRead: shared.isRead
      });
    }
  });

  // Add referrals to timeline
  referrals
    .filter((referral) => referral.soapNoteId === soapNoteId)
    .forEach((referral) => {
      // Add the referral action
      timelineItems.push({
        id: referral._id,
        type: "doctor_referral",
        timestamp: referral.createdAt,
        actor: {
          name: `${referral.fromDoctor?.firstName || 'Unknown'} ${referral.fromDoctor?.lastName || 'Doctor'}`,
          role: "doctor",
          specialization: referral.fromDoctor?.primarySpecialty,
          avatar: referral.fromDoctor?.profileImageUrl
        },
        target: referral.toDoctor ? {
          name: `${referral.toDoctor?.firstName || 'Unknown'} ${referral.toDoctor?.lastName || 'Specialist'}`,
          role: "doctor",
          specialization: referral.toDoctor?.primarySpecialty,
          avatar: referral.toDoctor?.profileImageUrl
        } : undefined,
        status: referral.status === "accepted" ? "completed" :
               referral.status === "declined" ? "declined" : "pending",
        message: referral.clinicalNotes
      });

      // Add specialist response if available
      if (referral.status === "declined" && referral.declineReason) {
        timelineItems.push({
          id: `${referral._id}_decline`,
          type: "specialist_decline",
          timestamp: referral.respondedAt || referral.updatedAt,
          actor: {
            name: `${referral.toDoctor?.firstName || 'Unknown'} ${referral.toDoctor?.lastName || 'Specialist'}`,
            role: "doctor",
            specialization: referral.toDoctor?.primarySpecialty,
            avatar: referral.toDoctor?.profileImageUrl
          },
          status: "completed",
          message: referral.declineReason
        });
      }
    });

  return timelineItems.sort((a, b) => a.timestamp - b.timestamp);
}
