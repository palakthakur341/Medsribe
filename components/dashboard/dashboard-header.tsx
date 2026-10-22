"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
  displayName?: string;
}

export function DashboardHeader({ user, displayName }: DashboardHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2 h-full">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* User Profile Display */}
      <div className="flex items-center gap-2 h-10 px-2 py-1">
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src="" alt={displayName || user.email} />
          <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden lg:flex flex-col items-start min-w-0">
          <span className="text-sm font-medium leading-tight truncate max-w-[100px]">
            {displayName || user.email}
          </span>
          <span className="text-xs text-muted-foreground leading-tight truncate max-w-[100px]">
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
}
