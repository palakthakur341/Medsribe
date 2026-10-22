"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "minimal" | "gradient";
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl", 
  xl: "text-2xl"
};

export function Logo({ 
  className, 
  size = "md", 
  variant = "default",
  showText = false,
  textClassName 
}: LogoProps) {
  const logoContent = (
    <div className="font-bold text-foreground">
      M
    </div>
  );

  const getVariantClasses = () => {
    switch (variant) {
      case "minimal":
        return "bg-background border border-border";
      case "gradient":
        return "bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20";
      default:
        return "bg-background border border-border shadow-sm";
    }
  };

  const logoElement = (
    <div 
      className={cn(
        "flex items-center justify-center rounded-xl",
        sizeClasses[size],
        getVariantClasses(),
        className
      )}
    >
      <div className={textSizeClasses[size]}>
        {logoContent}
      </div>
    </div>
  );

  if (showText) {
    return (
      <div className="flex items-center gap-3">
        {logoElement}
        <div className={cn("flex flex-col", textClassName)}>
          <span className="text-sm font-semibold text-foreground">MedScribe</span>
          <span className="text-xs text-muted-foreground font-medium">v2.0</span>
        </div>
      </div>
    );
  }

  return logoElement;
}

// Convenience exports for common use cases
export const MedScribeLogo = Logo;
export const LogoWithText = (props: Omit<LogoProps, 'showText'>) => 
  <Logo {...props} showText={true} />;
