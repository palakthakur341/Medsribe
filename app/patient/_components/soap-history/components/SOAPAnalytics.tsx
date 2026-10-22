"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stethoscope, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { SOAPStats } from "../types";
import { cn } from "@/lib/utils";

interface SOAPAnalyticsProps {
  stats: SOAPStats;
  loading?: boolean;
  className?: string;
}

/**
 * Enhanced SOAP Analytics component showing detailed breakdowns
 * Displays specialty distribution, quality metrics, and safety analytics
 */
export const SOAPAnalytics = React.memo<SOAPAnalyticsProps>(({
  stats,
  loading = false,
  className,
}) => {
  // Get top specialties (limit to 5)
  const topSpecialties = Object.entries(stats.specialtyBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate percentages for quality distribution
  const totalWithQuality = Object.values(stats.qualityDistribution).reduce((a, b) => a + b, 0);
  const qualityPercentages = totalWithQuality > 0 ? {
    excellent: Math.round((stats.qualityDistribution.excellent / totalWithQuality) * 100),
    good: Math.round((stats.qualityDistribution.good / totalWithQuality) * 100),
    fair: Math.round((stats.qualityDistribution.fair / totalWithQuality) * 100),
    poor: Math.round((stats.qualityDistribution.poor / totalWithQuality) * 100),
  } : { excellent: 0, good: 0, fair: 0, poor: 0 };

  // Safety metrics
  const totalSafetyAssessed = stats.safeNotesCount + stats.unsafeNotesCount;
  const safetyPercentage = totalSafetyAssessed > 0 
    ? Math.round((stats.safeNotesCount / totalSafetyAssessed) * 100) 
    : 0;

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4", className)}>
      {/* Specialty Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            Medical Specialties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSpecialties.length > 0 ? (
            topSpecialties.map(([specialty, count]) => {
              const percentage = Math.round((count / stats.totalNotes) * 100);
              return (
                <div key={specialty} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{specialty}</span>
                    <Badge variant="outline" className="text-xs">
                      {count} ({percentage}%)
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No specialty data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Quality Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Excellent", value: stats.qualityDistribution.excellent, percentage: qualityPercentages.excellent, color: "emerald" },
            { label: "Good", value: stats.qualityDistribution.good, percentage: qualityPercentages.good, color: "blue" },
            { label: "Fair", value: stats.qualityDistribution.fair, percentage: qualityPercentages.fair, color: "orange" },
            { label: "Poor", value: stats.qualityDistribution.poor, percentage: qualityPercentages.poor, color: "red" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <Badge variant="outline" className="text-xs">
                  {item.value} ({item.percentage}%)
                </Badge>
              </div>
              <Progress 
                value={item.percentage} 
                className={cn(
                  "h-2",
                  item.color === "emerald" && "[&>div]:bg-emerald-500",
                  item.color === "blue" && "[&>div]:bg-blue-500",
                  item.color === "orange" && "[&>div]:bg-orange-500",
                  item.color === "red" && "[&>div]:bg-red-500"
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety & Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Safety Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Safety Score</span>
              <Badge variant="outline" className={cn(
                "text-xs",
                safetyPercentage >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                safetyPercentage >= 75 ? "text-blue-600 bg-blue-50 border-blue-200" :
                "text-orange-600 bg-orange-50 border-orange-200"
              )}>
                {safetyPercentage}%
              </Badge>
            </div>
            <Progress value={safetyPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.safeNotesCount} safe / {totalSafetyAssessed} assessed
            </p>
          </div>

          {/* AI Enhancement Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">AI Enhanced</span>
              <Badge variant="outline" className="text-xs text-purple-600 bg-purple-50 border-purple-200">
                {Math.round((stats.enhancedNotesCount / stats.totalNotes) * 100)}%
              </Badge>
            </div>
            <Progress 
              value={(stats.enhancedNotesCount / stats.totalNotes) * 100} 
              className="h-2 [&>div]:bg-purple-500"
            />
            <p className="text-xs text-muted-foreground">
              {stats.enhancedNotesCount} of {stats.totalNotes} notes
            </p>
          </div>

          {/* Transcription Accuracy */}
          {stats.avgTranscriptionConfidence > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Transcription Accuracy</span>
                <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 border-blue-200">
                  {stats.avgTranscriptionConfidence}%
                </Badge>
              </div>
              <Progress value={stats.avgTranscriptionConfidence} className="h-2" />
            </div>
          )}

          {/* Red Flags Alert */}
          {stats.redFlagsCount > 0 && (
            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-orange-800 dark:text-orange-200">Red Flags</span>
                <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50 border-orange-200">
                  {stats.redFlagsCount}
                </Badge>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Notes requiring clinical attention
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

SOAPAnalytics.displayName = "SOAPAnalytics";
