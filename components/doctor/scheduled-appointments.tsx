"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, User, Phone, Video, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ScheduledAppointmentsProps {
  doctorId: Id<"doctors">;
  className?: string;
  onScheduleNew?: () => void;
}

export function ScheduledAppointments({
  doctorId,
  className,
  onScheduleNew
}: ScheduledAppointmentsProps) {
  const weekAppointments = useQuery(api.appointments.getWeekByDoctor, {
    doctorId,
  });

  if (weekAppointments === undefined) {
    return (
      <Card className={cn("bg-background border-border flex flex-col h-full", className)}>
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                This Week's Schedule
              </CardTitle>
            </div>
            <Link href="/doctor/appointments">
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/10 text-primary";
      case "confirmed":
        return "bg-primary/10 text-primary";
      case "in_progress":
        return "bg-secondary/50 text-secondary-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };



  const getAppointmentStatus = (appointmentDateTime: number) => {
    const now = new Date();
    const appointmentDate = new Date(appointmentDateTime);

    // Check if it's today
    const isToday = appointmentDate.toDateString() === now.toDateString();

    if (!isToday) {
      return appointmentDate < now ? "past" : "upcoming";
    }

    // For today's appointments, check time
    const currentTime = now.getTime();
    const appointmentTime = appointmentDate.getTime();
    const timeDiff = Math.abs(appointmentTime - currentTime);

    if (timeDiff <= 30 * 60 * 1000) { // Within 30 minutes
      return "current";
    } else if (appointmentTime < currentTime) {
      return "past";
    } else {
      return "upcoming";
    }
  };

  // Group appointments by day
  const groupAppointmentsByDay = (appointments: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    appointments.forEach(appointment => {
      const date = new Date(appointment.appointmentDateTime);
      const dayKey = date.toDateString();

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(appointment);
    });

    // Sort appointments within each day by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) =>
        new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime()
      );
    });

    return grouped;
  };

  const groupedAppointments = weekAppointments ? groupAppointmentsByDay(weekAppointments) : {};
  const sortedDays = Object.keys(groupedAppointments).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <Card className={cn("bg-background border-border flex flex-col h-full", className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              This Week's Schedule
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onScheduleNew && (
              <Button
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={onScheduleNew}
              >
                <Plus className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            )}
            <Link href="/doctor/appointments">
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          {sortedDays.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-muted">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No appointments this week
                </p>
                <Link href="/doctor/appointments">
                  <Button variant="outline" size="sm" className="h-6 px-3 text-xs">
                    Schedule Appointment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {sortedDays.map((dayKey) => {
                const dayDate = new Date(dayKey);
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const dayAppointments = groupedAppointments[dayKey];

                return (
                  <div key={dayKey} className="space-y-2">
                    {/* Day Header */}
                    <div className="flex items-center gap-2 px-1">
                      <div className={cn(
                        "text-xs font-medium",
                        isToday ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {isToday ? 'Today' : dayDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex-1 h-px bg-border"></div>
                      <div className="text-xs text-muted-foreground">
                        {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Day's Appointments */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 8).map((appointment) => {
                        const appointmentTime = new Date(appointment.appointmentDateTime);
                        const timeStatus = getAppointmentStatus(appointment.appointmentDateTime);

                        return (
                          <div
                            key={appointment._id}
                            className={cn(
                              "relative flex items-center gap-2 p-2 rounded transition-colors",
                              "bg-muted/50 border border-border",
                              timeStatus === "current" && "ring-2 ring-primary/30",
                              timeStatus === "past" && "opacity-75",
                              "hover:bg-muted"
                            )}
                          >
                            {/* Timeline indicator */}
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              timeStatus === "current"
                                ? "bg-primary animate-pulse"
                                : timeStatus === "past"
                                ? "bg-primary"
                                : "bg-muted-foreground"
                            }`} />

                            {/* Patient Avatar */}
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>

                            {/* Appointment Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs font-medium truncate text-foreground">
                                  {appointment.patient?.firstName} {appointment.patient?.lastName}
                                </h4>
                                <Badge variant="secondary" className={`${getStatusColor(appointment.status)} text-xs h-4 px-1`}>
                                  {appointment.status.replace('_', ' ')}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {appointmentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                                {appointment.location && (
                                  <div className="flex items-center gap-1">
                                    {appointment.location.type === "telemedicine" ? (
                                      <Video className="h-3 w-3" />
                                    ) : (
                                      <MapPin className="h-3 w-3" />
                                    )}
                                    <span className="text-xs">
                                      {appointment.location.type === "telemedicine" ? "Virtual" : "In-person"}
                                    </span>
                                  </div>
                                )}
                                <span>{appointment.duration}min</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {appointment.location?.type === "telemedicine" ? (
                                <Button size="sm" variant="outline" className="h-6 px-1.5 text-xs">
                                  <Video className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 px-1.5 text-xs">
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs">
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {weekAppointments && weekAppointments.length > 20 && (
                <div className="pt-2 border-t">
                  <Link href="/doctor/appointments">
                    <Button variant="ghost" size="sm" className="w-full h-6 text-xs">
                      View all {weekAppointments.length} appointments this week
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
