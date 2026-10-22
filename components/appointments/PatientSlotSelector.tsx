"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { format, addDays, isSameDay, startOfWeek } from "date-fns";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { Label } from "@/components/ui/label";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface PatientSlotSelectorProps {
  doctorId: Id<"doctors">;
  onSlotSelect: (slotId: Id<"timeSlots">, slotInfo: any) => void;
  selectedSlotId?: string;
  showNextAvailable?: boolean;
}

export const PatientSlotSelector: React.FC<PatientSlotSelectorProps> = ({
  doctorId,
  onSlotSelect,
  selectedSlotId,
  showNextAvailable = false,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Start week on Monday
  );

  // Get doctor info
  const doctor = useQuery(api.doctors.getById, { doctorId });

  // Get available slots for the current week
  const weekStartDate = format(currentWeekStart, 'yyyy-MM-dd');
  const weekEndDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
  
  const weekSlots = useQuery(api.timeSlots.getAvailableSlotsInRange, {
    doctorId,
    startDate: weekStartDate,
    endDate: weekEndDate,
  });

  // Get next available slot for quick booking
  const nextAvailableSlot = useQuery(api.slotAvailability.getNextAvailableSlot, {
    doctorId,
  });

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = addDays(currentWeekStart, direction === 'next' ? 7 : -7);
    setCurrentWeekStart(newWeekStart);
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const daySlots = weekSlots?.[dateString] || [];
    
    return {
      date: dateString,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      fullDate: format(date, 'MMMM d'),
      isToday: isSameDay(date, new Date()),
      isPast: date < new Date(),
      slots: daySlots.sort((a, b) => a.time.localeCompare(b.time)),
    };
  });

  if (doctor === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Next Available */}
      {showNextAvailable && nextAvailableSlot && (
        <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <h3 className="font-medium">Next Available</h3>
              </div>
              <p className="font-medium">
                {format(new Date(nextAvailableSlot.dateTime), 'EEEE, MMMM d')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(nextAvailableSlot.slot.time)} - {formatTime(nextAvailableSlot.slot.endTime)}
              </p>
            </div>
            <Button
              onClick={() => onSlotSelect(nextAvailableSlot.slot._id, nextAvailableSlot.slot)}
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Select
            </Button>
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Available Times
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day.date} className="space-y-2">
                {/* Day Header */}
                <div className="text-center p-2 border-b">
                  <div className="text-xs text-muted-foreground">{day.dayName}</div>
                  <div className={cn(
                    "text-sm font-medium",
                    day.isToday ? 'text-primary' : day.isPast ? 'text-muted-foreground' : ''
                  )}>
                    {day.dayNumber}
                  </div>
                  {day.isToday && (
                    <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div>
                  )}
                </div>

                {/* Time Slots */}
                <ScrollArea className="h-48">
                  <div className="space-y-1 p-1">
                    {day.isPast ? (
                      <div className="text-center py-3 text-xs text-muted-foreground">
                        Past
                      </div>
                    ) : day.slots.length === 0 ? (
                      <div className="text-center py-3 text-xs text-muted-foreground">
                        No slots
                      </div>
                    ) : (
                      day.slots.map((slot) => (
                        <div
                          key={slot._id}
                          className={cn(
                            "border rounded p-2 cursor-pointer transition-all hover:shadow-sm text-center text-xs",
                            selectedSlotId === slot._id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                          onClick={() => onSlotSelect(slot._id, slot)}
                        >
                          {formatTime(slot.time)}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
        </div>
      </div>


    </div>
  );
};
