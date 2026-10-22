"use client";

import React from "react";
import { FileText, Star, Share, Calendar, TrendingUp, Brain, Shield, ShieldAlert, AlertTriangle, Stethoscope, Clock } from "lucide-react";
import { SOAPStatsOverviewProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Enhanced SOAP Stats Overview component with AI metrics
 * Displays both traditional and enhanced AI-powered statistics
 */
export const SOAPStatsOverview = React.memo<SOAPStatsOverviewProps>(({
  stats,
  loading = false,
  compact = false,
  showTrends = false,
  showEnhanced = true,
  className,
}) => {
  // Basic stats configuration
  const basicStatsConfig = [
    {
      key: "totalNotes",
      label: "Total",
      value: stats.totalNotes,
      icon: FileText,
      color: "blue",
      description: "Total SOAP notes",
    },
    {
      key: "avgQuality",
      label: "Quality",
      value: `${stats.avgQuality}%`,
      icon: Star,
      color: "emerald",
      description: "Average quality score",
    },
    {
      key: "sharedCount",
      label: "Shared",
      value: stats.sharedCount,
      icon: Share,
      color: "violet",
      description: "Notes shared with doctors",
    },
    {
      key: "recentNotes",
      label: "Recent",
      value: stats.recentNotes,
      icon: Calendar,
      color: "orange",
      description: "Notes from last 7 days",
    },
  ];

  // Enhanced stats configuration
  const enhancedStatsConfig = [
    {
      key: "enhancedNotes",
      label: "AI Enhanced",
      value: stats.enhancedNotesCount,
      icon: Brain,
      color: "purple",
      description: "Notes with AI analysis",
    },
    {
      key: "safeNotes",
      label: "Safe",
      value: stats.safeNotesCount,
      icon: Shield,
      color: "emerald",
      description: "Notes marked as safe",
    },
    {
      key: "unsafeNotes",
      label: "Alerts",
      value: stats.unsafeNotesCount,
      icon: ShieldAlert,
      color: "red",
      description: "Notes requiring attention",
    },
    {
      key: "redFlags",
      label: "Red Flags",
      value: stats.redFlagsCount,
      icon: AlertTriangle,
      color: "orange",
      description: "Notes with clinical red flags",
    },
    {
      key: "transcriptionConfidence",
      label: "Accuracy",
      value: `${stats.avgTranscriptionConfidence}%`,
      icon: Stethoscope,
      color: "blue",
      description: "Average transcription confidence",
    },
    {
      key: "processingTime",
      label: "Speed",
      value: `${stats.avgProcessingTime}s`,
      icon: Clock,
      color: "violet",
      description: "Average processing time",
    },
  ];

  // Choose which stats to display
  const statsConfig = showEnhanced
    ? (compact ? [...basicStatsConfig.slice(0, 2), ...enhancedStatsConfig.slice(0, 2)] : [...basicStatsConfig, ...enhancedStatsConfig])
    : basicStatsConfig;

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500/15 group-hover:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-500/15 group-hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      violet: "bg-violet-500/15 group-hover:bg-violet-500/20 text-violet-600 dark:text-violet-400",
      orange: "bg-orange-500/15 group-hover:bg-orange-500/20 text-orange-600 dark:text-orange-400",
      purple: "bg-purple-500/15 group-hover:bg-purple-500/20 text-purple-600 dark:text-purple-400",
      red: "bg-red-500/15 group-hover:bg-red-500/20 text-red-600 dark:text-red-400",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(
        compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 lg:grid-cols-4 gap-3",
        className
      )}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border bg-card animate-pulse",
              compact ? "p-3" : "p-4"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "rounded-lg bg-muted",
                  compact ? "h-6 w-6" : "h-8 w-8"
                )} />
                <div>
                  <div className={cn(
                    "bg-muted rounded",
                    compact ? "h-3 w-12" : "h-4 w-16"
                  )} />
                  <div className={cn(
                    "bg-muted rounded mt-1",
                    compact ? "h-4 w-8" : "h-5 w-10"
                  )} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Compact version
  if (compact) {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="backdrop-blur-md bg-background/50 border border-border/40 rounded-lg p-3 hover:bg-background/70 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                  getColorClasses(stat.color)
                )}>
                  <Icon className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full version
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 w-full", className)}>
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="backdrop-blur-md bg-background/50 border border-border/40 rounded-lg p-4 hover:bg-background/70 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  getColorClasses(stat.color)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
              {showTrends && (
                <div className="flex items-center text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}
            </div>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-2">
                {stat.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
});

SOAPStatsOverview.displayName = "SOAPStatsOverview";
