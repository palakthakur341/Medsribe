"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Clock, Info, Zap } from "lucide-react";

interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "pending" | "info" | "active";
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dot" | "badge" | "pill";
  className?: string;
  showIcon?: boolean;
}

export function StatusIndicator({
  status,
  label,
  size = "md",
  variant = "default",
  className,
  showIcon = true,
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
          border: "border-green-200 dark:border-green-800",
          dot: "bg-green-500",
        };
      case "warning":
        return {
          icon: AlertCircle,
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          border: "border-yellow-200 dark:border-yellow-800",
          dot: "bg-yellow-500",
        };
      case "error":
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-800",
          dot: "bg-red-500",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-800",
          dot: "bg-blue-500",
        };
      case "info":
        return {
          icon: Info,
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/30",
          border: "border-gray-200 dark:border-gray-800",
          dot: "bg-gray-500",
        };
      case "active":
        return {
          icon: Zap,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          border: "border-purple-200 dark:border-purple-800",
          dot: "bg-purple-500",
        };
      default:
        return {
          icon: Info,
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/30",
          border: "border-gray-200 dark:border-gray-800",
          dot: "bg-gray-500",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "text-xs",
          icon: "h-3 w-3",
          dot: "h-2 w-2",
          padding: "px-2 py-1",
        };
      case "lg":
        return {
          container: "text-base",
          icon: "h-5 w-5",
          dot: "h-3 w-3",
          padding: "px-4 py-2",
        };
      default: // md
        return {
          container: "text-sm",
          icon: "h-4 w-4",
          dot: "h-2.5 w-2.5",
          padding: "px-3 py-1.5",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-2", sizeClasses.container, className)}>
        <div className={cn(
          "rounded-full",
          sizeClasses.dot,
          config.dot,
          status === "pending" && "animate-pulse"
        )} />
        {label && <span className="font-medium">{label}</span>}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium",
        sizeClasses.container,
        sizeClasses.padding,
        config.bg,
        config.color,
        config.border,
        "border",
        className
      )}>
        {showIcon && <Icon className={sizeClasses.icon} />}
        {label}
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses.container,
        sizeClasses.padding,
        config.bg,
        config.color,
        className
      )}>
        {showIcon && <Icon className={sizeClasses.icon} />}
        {label}
      </span>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5",
      sizeClasses.container,
      config.color,
      className
    )}>
      {showIcon && <Icon className={sizeClasses.icon} />}
      {label && <span className="font-medium">{label}</span>}
    </div>
  );
}

// Health status component for medical contexts
interface HealthStatusProps {
  value: number;
  range: { min: number; max: number; optimal?: { min: number; max: number } };
  unit?: string;
  label: string;
  className?: string;
}

export function HealthStatus({
  value,
  range,
  unit,
  label,
  className,
}: HealthStatusProps) {
  const getHealthStatus = () => {
    if (range.optimal) {
      if (value >= range.optimal.min && value <= range.optimal.max) {
        return "success";
      }
    }
    
    if (value >= range.min && value <= range.max) {
      return "warning";
    }
    
    return "error";
  };

  const status = getHealthStatus();

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <StatusIndicator status={status} variant="dot" size="sm" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="text-xs text-muted-foreground">
        Normal: {range.min}-{range.max} {unit}
      </div>
    </div>
  );
}

// Activity status for real-time updates
interface ActivityStatusProps {
  isActive: boolean;
  lastActive?: Date;
  className?: string;
}

export function ActivityStatus({
  isActive,
  lastActive,
  className,
}: ActivityStatusProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
      )} />
      <span className="text-xs text-muted-foreground">
        {isActive ? "Active now" : lastActive ? getTimeAgo(lastActive) : "Offline"}
      </span>
    </div>
  );
}
