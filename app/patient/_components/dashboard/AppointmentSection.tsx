"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface Appointment {
  _id: string;
  doctor?: {
    firstName: string;
    lastName: string;
  };
  appointmentDateTime: string;
  status: string;
  reason?: string;
}

export interface AppointmentSectionProps {
  appointments: Appointment[];
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    itemBg: string;
    itemBorder: string;
  };
  emptyState: {
    icon: React.ReactNode;
    message: string;
    actionLabel?: string;
    actionHref?: string;
  };
  viewAllHref: string;
  maxItems?: number;
  className?: string;
  isLoading?: boolean;
}

export const AppointmentSection = React.memo<AppointmentSectionProps>(({
  appointments,
  title,
  description,
  icon,
  gradient,
  emptyState,
  viewAllHref,
  maxItems = 3,
  className = "",
  isLoading = false,
}) => {
  const hasAppointments = appointments && appointments.length > 0;
  
  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="flex-shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-7 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 divide-y">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={viewAllHref}>
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          {!hasAppointments ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">{emptyState.message || "No appointments found"}</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  You don't have any scheduled appointments.
                </p>
              </div>
            </div>
          ) : (
            appointments.slice(0, maxItems).map((appointment) => (
              <div
                key={appointment._id}
                className="p-4 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        "font-medium text-sm truncate",
                        gradient.textColor || "text-foreground"
                      )}>
                        Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs h-5 flex-shrink-0 ml-2",
                          `border-${gradient.border.replace('border-', '').replace('200', '300')} ${gradient.textColor}`
                        )}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className={cn(
                      "text-xs flex items-center gap-1 mb-1",
                      gradient.textColor || "text-muted-foreground"
                    )}>
                      <Clock className="h-3 w-3" />
                      <span>
                        {(() => {
                          try {
                            const date = new Date(appointment.appointmentDateTime);
                            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`;
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()}
                      </span>
                    </div>
                    
                    {appointment.reason && (
                      <p className={cn(
                        "text-xs line-clamp-2",
                        gradient.textColor?.replace('700', '600').replace('300', '400') || "text-muted-foreground"
                      )}>
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

AppointmentSection.displayName = "AppointmentSection";