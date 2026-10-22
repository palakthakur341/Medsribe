"use client";

import * as React from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: Array<{ value: number; label?: string }>;
  type?: "line" | "area" | "bar";
  color?: string;
  className?: string;
  height?: number;
}

export function MiniChart({
  data,
  type = "line",
  color = "hsl(var(--primary))",
  className,
  height = 60,
}: MiniChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-muted/20 rounded", className)}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    index,
  }));

  if (type === "area") {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar
              dataKey="value"
              fill={color}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default line chart
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sparkline component for inline metrics
interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "hsl(var(--primary))",
  className,
  width = 60,
  height = 20,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className={cn("inline-block", className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Progress ring component for circular metrics
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// Trend indicator component
interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  format?: (value: number) => string;
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  format = (v) => v.toString(),
  className,
}: TrendIndicatorProps) {
  if (previousValue === undefined) {
    return (
      <span className={cn("text-sm font-medium", className)}>
        {format(value)}
      </span>
    );
  }

  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="text-sm font-medium">{format(value)}</span>
      {!isNeutral && (
        <span className={cn(
          "text-xs font-medium flex items-center gap-0.5",
          isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {isPositive ? "↗" : "↘"}
          {Math.abs(percentChange).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
