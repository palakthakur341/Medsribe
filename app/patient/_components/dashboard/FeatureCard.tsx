"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    badgeColor: string;
  };
  actions: {
    primary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    };
    secondary?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    };
  };
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  gradient,
  actions,
  className,
}: FeatureCardProps) {
  
  return (
    <Card className={cn(
      "p-0 h-full",
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-base",
                gradient.textColor
              )}>
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className={cn(
                  "text-xs mt-1",
                  gradient.badgeColor
                )}>
                  {badge}
                </Badge>
              )}
            </div>
          </div>

          <p className={cn(
            "text-xs text-muted-foreground"
          )}>
            {description}
          </p>

          <div className="flex gap-2 flex-col sm:flex-row">
            {actions.secondary && (
              <Link href={actions.secondary.href} className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full",
                    `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                    `hover:bg-${gradient.from.split(' ')[1]?.replace('from-', '') || 'gray'}/50`
                  )}
                  disabled={actions.secondary.disabled}
                  size="sm"
                >
                  {actions.secondary.icon}
                  {actions.secondary.label}
                </Button>
              </Link>
            )}
            {actions.primary && (
              <Link href={actions.primary.href} className="flex-1">
                <Button
                  className={cn(
                    "w-full",
                    gradient.iconBg.replace('bg-', 'bg-').replace('500', '600'),
                    `hover:${gradient.iconBg.replace('bg-', 'bg-').replace('500', '700')}`
                  )}
                  size="sm"
                >
                  {actions.primary.icon}
                  {actions.primary.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
