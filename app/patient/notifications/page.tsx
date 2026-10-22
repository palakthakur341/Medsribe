"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Bell,
  CheckCircle,
  Stethoscope,
  CalendarPlus,
  UserPlus,
  ArrowRight
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Skeleton Loading Component
function NotificationsSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-3">
        {/* Compact Header Skeleton */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>

        {/* Compact Notifications List Skeleton */}
        <div className="flex-1 min-h-0">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ patientProfile }: { patientProfile: any }) {
  // Define required fields for profile completion (matching actual schema)
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'primaryPhone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'addressLine1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'Zip Code' },
    { key: 'emergencyContactName', label: 'Emergency Contact Name' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  ];

  const completedRequired = useMemo(() => {
    if (!patientProfile) return [];
    return requiredFields.filter(field => {
      const value = patientProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Access Notifications</CardTitle>
          <p className="text-muted-foreground">
            {!patientProfile
              ? "Set up your profile to receive important medical notifications."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {patientProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Access
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Receive appointment reminders and updates</li>
                <li>• Get notified about treatment plan changes</li>
                <li>• Stay informed about referrals and consultations</li>
                <li>• Track medical actions and their status</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your profile to receive important medical notifications and updates.
            </p>

            <Link href="/patient/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!patientProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PatientNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get notifications
  const notifications = useQuery(
    api.notifications.getByUser,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Check if profile is complete (matching actual schema)
  const isProfileComplete = useMemo(() => {
    if (!patientProfile) return false;

    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'primaryPhone', 'email',
      'addressLine1', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone'
    ] as const;

    return requiredFields.every(field => {
      const value = patientProfile[field as keyof typeof patientProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile]);



  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assistance_provided":
        return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case "appointment_scheduled":
        return <CalendarPlus className="h-5 w-5 text-green-600" />;
      case "referral_sent":
        return <UserPlus className="h-5 w-5 text-purple-600" />;
      case "action_completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    try {
      await markAllAsRead({ userId: session.user.id as any });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filteredNotifications = notifications?.filter(notification => 
    filter === "all" || !notification.isRead
  ) || [];

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <NotificationsSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent patientProfile={patientProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-3">
          {/* Compact Header with Inline Controls */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <h1 className="text-lg font-semibold">Notifications</h1>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-2">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {notifications?.length || 0} total
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Buttons - Inline */}
                <div className="flex gap-1">
                  <Button
                    variant={filter === "all" ? "default" : "ghost"}
                    onClick={() => setFilter("all")}
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "unread" ? "default" : "ghost"}
                    onClick={() => setFilter("unread")}
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    Unread
                  </Button>
                </div>

                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="h-7 px-3 text-xs">
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Modern Compact Notifications List */}
          <div className="flex-1 min-h-0">
            {filteredNotifications.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full scrollbar-hide">
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "group p-3 rounded-lg border transition-all duration-200 hover:shadow-sm hover:border-primary/20",
                        !notification.isRead
                          ? "bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/50"
                          : "bg-card border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-medium text-sm truncate">{notification.title}</h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>

                          <div className="flex items-center justify-between">
                            {notification.fromDoctor && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {notification.fromDoctor.firstName[0]}{notification.fromDoctor.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  Dr. {notification.fromDoctor.firstName} {notification.fromDoctor.lastName}
                                </span>
                              </div>
                            )}

                            {notification.action && (
                              <div className="flex items-center gap-1">
                                {getActionStatusBadge(notification.action.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
