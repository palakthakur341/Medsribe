"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  status?: "success" | "warning" | "error" | "info";
  chart?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  description,
  className,
  variant = "default",
  status,
  chart,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return "";
    
    switch (change.type) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20";
      case "error":
        return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20";
      case "info":
        return "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20";
      default:
        return "";
    }
  };

  if (variant === "compact") {
    return (
      <Card className={cn(
        "border-0 shadow-md hover:shadow-lg transition-all duration-200",
        getStatusColor(),
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <p className="text-xl font-bold tracking-tight">{value}</p>
            </div>
            {icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
          </div>
          {change && (
            <div className={cn("flex items-center gap-1 mt-2", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {change.value > 0 ? "+" : ""}{change.value}%
                {change.period && (
                  <span className="text-muted-foreground ml-1">
                    {change.period}
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-200",
        getStatusColor(),
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {status && (
              <Badge variant="secondary" className={cn(
                "text-xs",
                status === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                status === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                status === "error" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                status === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              )}>
                {status}
              </Badge>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {change && (
              <div className={cn("flex items-center gap-1", getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {change.value > 0 ? "+" : ""}{change.value}%
                  {change.period && (
                    <span className="text-muted-foreground ml-1">
                      {change.period}
                    </span>
                  )}
                </span>
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {chart && (
            <div className="h-20 w-full">
              {chart}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn(
      "border-0 shadow-md hover:shadow-lg transition-all duration-200",
      getStatusColor(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {change && (
          <div className={cn("flex items-center gap-1", getTrendColor())}>
            {getTrendIcon()}
            <span className="text-xs font-medium">
              {change.value > 0 ? "+" : ""}{change.value}%
              {change.period && (
                <span className="text-muted-foreground ml-1">
                  {change.period}
                </span>
              )}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {chart && (
          <div className="h-16 w-full mt-3">
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
