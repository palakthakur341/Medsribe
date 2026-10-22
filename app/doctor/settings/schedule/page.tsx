"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Stethoscope,
  Save,
  Plus,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface WorkingHours {
  day: string;
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  bufferTime: number;
  breakTimes: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
}

interface ScheduleSettings {
  workingHours: WorkingHours[];
  maxAdvanceBooking: number;
  allowWeekendAppointments: boolean;
  autoConfirmAppointments: boolean;
  emergencySlots: number;
}

const daysOfWeek = [
  { name: "Monday", index: 1 },
  { name: "Tuesday", index: 2 },
  { name: "Wednesday", index: 3 },
  { name: "Thursday", index: 4 },
  { name: "Friday", index: 5 },
  { name: "Saturday", index: 6 },
  { name: "Sunday", index: 0 }
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function DoctorScheduleSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);

  // Get current doctor
  const doctorProfile = useQuery(api.doctors.getCurrentDoctor,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Get existing availability
  const existingAvailability = useQuery(api.doctorAvailability.getDoctorAvailability,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Mutations
  const setWeeklyAvailability = useMutation(api.doctorAvailability.setWeeklyAvailability);
  const generateTimeSlots = useMutation(api.timeSlots.generateTimeSlots);

  const [settings, setSettings] = useState<ScheduleSettings>({
    workingHours: daysOfWeek.map(day => ({
      day: day.name,
      dayOfWeek: day.index,
      enabled: !["Saturday", "Sunday"].includes(day.name),
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
      bufferTime: 15,
      breakTimes: [
        {
          startTime: "12:00",
          endTime: "13:00",
          reason: "Lunch Break"
        }
      ]
    })),
    maxAdvanceBooking: 90,
    allowWeekendAppointments: false,
    autoConfirmAppointments: true,
    emergencySlots: 2
  });

  // Load existing availability when data is available
  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      const updatedWorkingHours = settings.workingHours.map(daySchedule => {
        const existing = existingAvailability.find(avail => avail.dayOfWeek === daySchedule.dayOfWeek);
        if (existing) {
          return {
            ...daySchedule,
            enabled: existing.isActive,
            startTime: existing.startTime,
            endTime: existing.endTime,
            slotDuration: existing.slotDuration,
            bufferTime: existing.bufferTime,
            breakTimes: existing.breakTimes,
          };
        }
        return daySchedule;
      });

      setSettings(prev => ({
        ...prev,
        workingHours: updatedWorkingHours,
      }));
    }
  }, [existingAvailability]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleWorkingHoursChange = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleSettingChange = (field: keyof ScheduleSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!doctorProfile) {
      toast({
        title: "Error",
        description: "Doctor profile not found.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare weekly schedule data
      const weeklySchedule = settings.workingHours.map(daySchedule => ({
        dayOfWeek: daySchedule.dayOfWeek,
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime,
        slotDuration: daySchedule.slotDuration,
        bufferTime: daySchedule.bufferTime,
        breakTimes: daySchedule.breakTimes,
        isActive: daySchedule.enabled,
      }));

      // Save availability templates
      await setWeeklyAvailability({
        doctorId: doctorProfile._id,
        weeklySchedule,
      });

      toast({
        title: "Schedule settings saved",
        description: "Your schedule preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!doctorProfile) {
      toast({
        title: "Error",
        description: "Doctor profile not found.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSlots(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + settings.maxAdvanceBooking);
      const endDateString = endDate.toISOString().split('T')[0];

      const result = await generateTimeSlots({
        doctorId: doctorProfile._id,
        startDate,
        endDate: endDateString,
      });

      toast({
        title: "Time slots generated",
        description: `Generated ${result.generatedCount} time slots for the next ${settings.maxAdvanceBooking} days.`,
      });
    } catch (error) {
      console.error("Error generating slots:", error);
      toast({
        title: "Error generating slots",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSlots(false);
    }
  };

  const addBreakTime = (dayIndex: number) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) =>
        index === dayIndex ? {
          ...day,
          breakTimes: [...day.breakTimes, { startTime: "12:00", endTime: "13:00", reason: "Break" }]
        } : day
      )
    }));
  };

  const removeBreakTime = (dayIndex: number, breakIndex: number) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) =>
        index === dayIndex ? {
          ...day,
          breakTimes: day.breakTimes.filter((_, i) => i !== breakIndex)
        } : day
      )
    }));
  };

  const updateBreakTime = (dayIndex: number, breakIndex: number, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) =>
        index === dayIndex ? {
          ...day,
          breakTimes: day.breakTimes.map((breakTime, i) =>
            i === breakIndex ? { ...breakTime, [field]: value } : breakTime
          )
        } : day
      )
    }));
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
    <>
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
              <h1 className="text-xl font-bold tracking-tight">Schedule & Availability</h1>
              <p className="text-muted-foreground text-sm">
                Manage your working hours and appointment preferences
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
              {/* Working Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Working Hours & Time Slots
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure your availability to automatically generate appointment time slots
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings.workingHours.map((daySchedule, dayIndex) => (
                    <div key={daySchedule.day} className="space-y-4 p-4 border rounded-lg">
                      {/* Day Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-20">
                          <Switch
                            checked={daySchedule.enabled}
                            onCheckedChange={(value) => handleWorkingHoursChange(dayIndex, 'enabled', value)}
                          />
                        </div>
                        <div className="w-24 font-medium">
                          {daySchedule.day}
                        </div>
                        {daySchedule.enabled && (
                          <div className="flex items-center gap-2 flex-1">
                            <Select
                              value={daySchedule.startTime}
                              onValueChange={(value) => handleWorkingHoursChange(dayIndex, 'startTime', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">to</span>
                            <Select
                              value={daySchedule.endTime}
                              onValueChange={(value) => handleWorkingHoursChange(dayIndex, 'endTime', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Slot Configuration */}
                      {daySchedule.enabled && (
                        <div className="ml-24 space-y-4 pl-4 border-l-2 border-muted">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Slot Duration</Label>
                              <Select
                                value={daySchedule.slotDuration.toString()}
                                onValueChange={(value) => handleWorkingHoursChange(dayIndex, 'slotDuration', parseInt(value))}
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
                            <div className="space-y-2">
                              <Label className="text-sm">Buffer Time</Label>
                              <Select
                                value={daySchedule.bufferTime.toString()}
                                onValueChange={(value) => handleWorkingHoursChange(dayIndex, 'bufferTime', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">No buffer</SelectItem>
                                  <SelectItem value="5">5 minutes</SelectItem>
                                  <SelectItem value="10">10 minutes</SelectItem>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Break Times */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Break Times</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addBreakTime(dayIndex)}
                                className="h-8"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Break
                              </Button>
                            </div>
                            {daySchedule.breakTimes.map((breakTime, breakIndex) => (
                              <div key={breakIndex} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <Input
                                  placeholder="Break reason"
                                  value={breakTime.reason}
                                  onChange={(e) => updateBreakTime(dayIndex, breakIndex, 'reason', e.target.value)}
                                  className="flex-1"
                                />
                                <Select
                                  value={breakTime.startTime}
                                  onValueChange={(value) => updateBreakTime(dayIndex, breakIndex, 'startTime', value)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map(time => (
                                      <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-xs text-muted-foreground">to</span>
                                <Select
                                  value={breakTime.endTime}
                                  onValueChange={(value) => updateBreakTime(dayIndex, breakIndex, 'endTime', value)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map(time => (
                                      <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBreakTime(dayIndex, breakIndex)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!daySchedule.enabled && (
                        <div className="ml-24 text-sm text-muted-foreground">
                          Not available
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Slot Generation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Slot Generation Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure how appointment slots are generated and managed
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Maximum Advance Booking (days)</Label>
                      <Input
                        type="number"
                        value={settings.maxAdvanceBooking}
                        onChange={(e) => handleSettingChange('maxAdvanceBooking', parseInt(e.target.value))}
                        min="1"
                        max="365"
                      />
                      <p className="text-xs text-muted-foreground">
                        How far in advance patients can book appointments
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Emergency Slots per Day</Label>
                      <Input
                        type="number"
                        value={settings.emergencySlots}
                        onChange={(e) => handleSettingChange('emergencySlots', parseInt(e.target.value))}
                        min="0"
                        max="10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Reserved slots for urgent appointments
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Weekend Appointments</Label>
                        <p className="text-sm text-muted-foreground">Enable patients to book appointments on weekends</p>
                      </div>
                      <Switch
                        checked={settings.allowWeekendAppointments}
                        onCheckedChange={(value) => handleSettingChange('allowWeekendAppointments', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Auto-Confirm Appointments</Label>
                        <p className="text-sm text-muted-foreground">Automatically confirm new appointment requests</p>
                      </div>
                      <Switch
                        checked={settings.autoConfirmAppointments}
                        onCheckedChange={(value) => handleSettingChange('autoConfirmAppointments', value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Slot Generation Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Generate Time Slots
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate appointment slots based on your availability settings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Automatic Slot Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Generate slots for the next {settings.maxAdvanceBooking} days based on your working hours
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateSlots}
                      disabled={isGeneratingSlots || !doctorProfile}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGeneratingSlots ? 'animate-spin' : ''}`} />
                      {isGeneratingSlots ? "Generating..." : "Generate Slots"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">Conflict Prevention</p>
                      <p className="text-xs text-muted-foreground">Automatic double-booking prevention</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Real-time Updates</p>
                      <p className="text-xs text-muted-foreground">Instant availability checking</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium">Smart Optimization</p>
                      <p className="text-xs text-muted-foreground">Efficient time slot management</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {existingAvailability && existingAvailability.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Availability Configured
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/doctor/settings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !doctorProfile}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
