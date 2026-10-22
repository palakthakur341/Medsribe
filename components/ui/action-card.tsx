"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ActionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "featured";
  badge?: string;
  color?: "default" | "primary" | "secondary" | "destructive" | "accent" | "muted";
  disabled?: boolean;
  unstyled?: boolean; // New prop for minimal styling
}

export function ActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  className,
  variant = "default",
  badge,
  color = "default",
  disabled = false,
  unstyled = false,
}: ActionCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return {
          bg: "bg-primary/10 dark:bg-primary/10",
          text: "text-primary",
          hover: "group-hover:bg-primary/20 dark:group-hover:bg-primary/20",
        };
      case "secondary":
        return {
          bg: "bg-secondary/80 dark:bg-secondary/80",
          text: "text-secondary-foreground",
          hover: "group-hover:bg-secondary dark:group-hover:bg-secondary",
        };
      case "destructive":
        return {
          bg: "bg-destructive/10 dark:bg-destructive/10",
          text: "text-destructive",
          hover: "group-hover:bg-destructive/20 dark:group-hover:bg-destructive/20",
        };
      case "accent":
        return {
          bg: "bg-accent/80 dark:bg-accent/80",
          text: "text-accent-foreground",
          hover: "group-hover:bg-accent dark:group-hover:bg-accent",
        };
      case "muted":
        return {
          bg: "bg-muted/80 dark:bg-muted/80",
          text: "text-muted-foreground",
          hover: "group-hover:bg-muted dark:group-hover:bg-muted",
        };
      default:
        return {
          bg: "bg-muted/50 dark:bg-muted/50",
          text: "text-foreground",
          hover: "group-hover:bg-muted/80 dark:group-hover:bg-muted/80",
        };
    }
  };

  const colorClasses = getColorClasses();

  const cardContent = (
    <Card className={cn(
      "bg-card text-card-foreground transition-all duration-200 group",
      // Default styling that can be overridden
      !className?.includes("border") && "border border-border/50 hover:border-border",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]",
      variant === "compact" && "py-2",
      variant !== "compact" && "py-3",
      className
    )}>
      <CardContent className={cn(
        "p-3",
        variant === "compact" && "p-2",
        variant === "featured" && "p-8"
      )}>
        {variant === "compact" ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
              colorClasses.bg,
              colorClasses.text,
              colorClasses.hover
            )}>
              {icon}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-medium text-xs text-foreground">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
        ) : variant === "featured" ? (
          <div className="text-center space-y-4">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl mx-auto transition-all duration-200",
              colorClasses.bg,
              colorClasses.text,
              colorClasses.hover,
              "group-hover:scale-110"
            )}>
              {icon}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold text-base text-foreground">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        ) : (
          // Default variant
          <div className="text-center space-y-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl mx-auto transition-all duration-200",
              colorClasses.bg,
              colorClasses.text,
              colorClasses.hover,
              "group-hover:scale-110"
            )}>
              {icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-medium text-xs text-foreground">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}

// Grid component for action cards
interface ActionCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ActionCardGrid({ 
  children, 
  columns = 4, 
  className 
}: ActionCardGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}