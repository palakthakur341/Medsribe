"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ChevronRight, HelpCircle, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavSection } from "@/lib/navigation";
import { NotificationSheet } from "@/components/notifications/notification-sheet";

interface DashboardSidebarProps {
  navigation: NavSection[];
  userRole: "doctor" | "patient";
  currentPath: string;
}

export function DashboardSidebar({ navigation, userRole, currentPath }: DashboardSidebarProps) {
  const router = useRouter();
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

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            <div className="text-lg font-bold text-primary">M</div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">MedScribe</span>
            <span className="text-xs text-muted-foreground capitalize font-medium">
              {userRole} Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navigation.flatMap((section) =>
                section.items.map((item) => {
                  const isActive = currentPath === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`
                          relative transition-all duration-200 h-9 rounded-lg group
                          ${isActive
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                          }
                        `}
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full px-3">
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-secondary-foreground' : 'text-sidebar-foreground'}`} />
                          <span className={`font-medium text-sm flex-1 ${isActive ? 'text-secondary-foreground' : 'text-sidebar-foreground'}`}>
                            {item.title}
                          </span>
                          {isActive && (
                            <ChevronRight className="h-4 w-4 text-secondary-foreground ml-auto" />
                          )}
                          {item.badge && !isActive && (
                            <SidebarMenuBadge className="ml-auto bg-muted text-muted-foreground">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                          {item.badge && isActive && (
                            <SidebarMenuBadge className="ml-auto mr-6 bg-background text-foreground">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="transition-all duration-200 h-9 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <Link href={`/${userRole}/settings`} className="flex items-center gap-3 w-full px-3">
                  <Settings className="h-4 w-4 text-sidebar-foreground" />
                  <span className="font-medium text-sm text-sidebar-foreground">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NotificationSheet userRole={userRole} />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="transition-all duration-200 h-9 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <Link href="/help" className="flex items-center gap-3 w-full px-3">
                  <HelpCircle className="h-4 w-4 text-sidebar-foreground" />
                  <span className="font-medium text-sm text-sidebar-foreground">Help Center</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="transition-all duration-200 h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
              <>
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground">
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </span>
              </>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
