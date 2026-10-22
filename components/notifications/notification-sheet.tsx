"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Bell,
  BellRing,
  Stethoscope,
  Calendar,
  UserPlus,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Settings,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NotificationSheetProps {
  userRole: "doctor" | "patient";
}

export function NotificationSheet({ userRole }: NotificationSheetProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Get user profile to determine if doctor or patient
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id && session.user.role === "patient"
      ? { userId: session.user.id as any }
      : "skip"
  );

  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id && session.user.role === "doctor"
      ? { userId: session.user.id as any }
      : "skip"
  );

  // Get notifications
  const notifications = useQuery(
    api.notifications.getByUser,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get unread count
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead({ notificationId: notification._id });
    }

    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    try {
      await markAllAsRead({ userId: session.user.id as any });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = cn(
      "h-4 w-4",
      priority === "urgent" && "text-red-600",
      priority === "high" && "text-orange-500",
      priority === "medium" && "text-blue-500",
      priority === "low" && "text-gray-500"
    );

    switch (type) {
      case "appointment_scheduled":
      case "appointment_confirmed":
      case "appointment_cancelled":
      case "appointment_rescheduled":
      case "appointment_reminder":
        return <Calendar className={iconClass} />;
      case "soap_note_shared":
      case "soap_note_received":
        return <FileText className={iconClass} />;
      case "referral_received":
      case "referral_accepted":
      case "referral_declined":
        return <UserPlus className={iconClass} />;
      case "urgent_referral":
      case "critical_result":
      case "emergency_contact":
        return <AlertTriangle className={iconClass} />;
      case "profile_incomplete":
      case "verification_required":
        return <AlertCircle className={iconClass} />;
      case "system_maintenance":
        return <Settings className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Real-time toast notifications for new notifications
  useEffect(() => {
    if (notifications && notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      const newNotifications = notifications.slice(0, notifications.length - lastNotificationCount);

      newNotifications.forEach((notification) => {
        if (!notification.isRead) {
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.priority === "urgent" || notification.priority === "high" ? "destructive" : "default",
          });
        }
      });
    }

    if (notifications) {
      setLastNotificationCount(notifications.length);
    }
  }, [notifications, lastNotificationCount, toast]);

  // Get urgent notifications count for special highlighting
  const urgentNotifications = notifications?.filter(n => n.priority === "urgent" && !n.isRead) || [];
  const recentNotifications = notifications?.slice(0, 15) || [];
  const hasUnread = (unreadCount || 0) > 0;
  const hasUrgent = urgentNotifications.length > 0;

  if (!session) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <SidebarMenuButton className="transition-all duration-200 h-9 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
          <div className="flex items-center gap-3 w-full px-3">
            {hasUnread ? (
              <BellRing className={cn("h-4 w-4 text-sidebar-foreground", hasUrgent && "text-red-600 animate-pulse")} />
            ) : (
              <Bell className="h-4 w-4 text-sidebar-foreground" />
            )}
            <span className="font-medium text-sm text-sidebar-foreground">Notifications</span>
            {hasUnread && (
              <Badge
                variant={hasUrgent ? "destructive" : "secondary"}
                className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs ml-auto"
              >
                {unreadCount! > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </SidebarMenuButton>
      </SheetTrigger>

      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {hasUnread && (
              <Badge variant={hasUrgent ? "destructive" : "secondary"} className="h-5 text-xs px-2">
                {unreadCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header with controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {hasUnread ? `${unreadCount} unread message${unreadCount! > 1 ? 's' : ''}` : 'All caught up!'}
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${userRole}/notifications`);
                }}
                className="text-xs h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View all
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Notifications list */}
          <ScrollArea className="flex-1">
            {!notifications ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll see updates here when they arrive
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "group p-3 rounded-lg border transition-all duration-200 hover:shadow-sm hover:border-primary/20 cursor-pointer",
                      !notification.isRead
                        ? "bg-primary/5 border-primary/20"
                        : "bg-background border-border"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              !notification.isRead && "text-foreground"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
