"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HealthTipCardProps {
  title: string;
  subtitle: string;
  tip: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
  };
  className?: string;
}

export function HealthTipCard({
  title,
  subtitle,
  tip,
  icon,
  gradient,
  className,
}: HealthTipCardProps) {
  const isFullHeight = className?.includes('h-full');

  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      isFullHeight && "flex flex-col",
      className
    )}>
      <CardContent className={cn(
        "p-4",
        isFullHeight && "flex-1 flex flex-col"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            gradient.iconBg
          )}>
            {icon}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-base",
              gradient.textColor
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-xs text-muted-foreground"
            )}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className={cn(
          isFullHeight && "flex-1 flex flex-col justify-center"
        )}>
          <p className={cn(
            "text-sm",
            isFullHeight && "leading-relaxed",
            gradient.textColor
          )}>
            {tip}
          </p>
          {isFullHeight && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <p className={cn(
                "text-xs opacity-75",
                gradient.textColor
              )}>
                💡 Tip: Regular outdoor activities can improve both physical and mental health. Consider taking a 10-15 minute walk during your lunch break.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
