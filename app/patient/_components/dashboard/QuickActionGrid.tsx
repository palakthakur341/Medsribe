"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "@/components/ui/action-card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

export interface QuickActionGridProps {
  title: string;
  actions: QuickAction[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "compact";
  gradient?: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    itemBg?: string;
    itemBorder?: string;
  };
  className?: string;
}

export function QuickActionGrid({
  title,
  actions,
  columns = 2,
  variant = "compact",
  gradient,
  className,
}: QuickActionGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <Card className={cn(
      "flex-shrink-0",
      gradient && `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      gradient && `border-${gradient.border}`,
      className
    )}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className={cn(
          "text-sm",
          gradient?.textColor
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4">
        <div className={cn(
          "grid gap-3",
          gridClasses[columns]
        )}>
          {actions.map((action, index) => (
            gradient ? (
              // Custom gradient-aware action item
              <Link
                key={index}
                href={action.disabled ? "#" : action.href}
                className={cn(
                  "block p-3 rounded-lg transition-all duration-200",
                  action.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02] cursor-pointer",
                  gradient.itemBg || "bg-white/50 dark:bg-gray-800/50",
                  gradient.itemBorder || "border border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    gradient.iconBg.replace('bg-', 'bg-').replace('500', '200') + ' dark:' + gradient.iconBg.replace('bg-', 'bg-').replace('500', '800/50')
                  )}>
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center",
                      gradient.iconBg.replace('bg-', 'text-').replace('500', '700') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '300')
                    )}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-medium text-xs truncate",
                      gradient.textColor
                    )}>
                      {action.title}
                    </h3>
                    {action.description && (
                      <p className={cn(
                        "text-xs truncate",
                        gradient.textColor
                      )}>
                        {action.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              // Fallback to ActionCard for non-gradient mode
              <ActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                href={action.href}
                variant={variant}
                className="border-0 shadow-none"
                disabled={action.disabled}
              />
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
