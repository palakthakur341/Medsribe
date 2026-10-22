import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { SettingsItemProps } from "../types";

/**
 * Settings Item Component
 * Displays individual settings items with icons, descriptions, and actions
 */
export const SettingsItem = React.memo<SettingsItemProps>(({
  icon: Icon,
  title,
  description,
  action,
  href,
  badge,
  disabled = false,
  onClick,
  className = "",
}) => {
  const content = (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
        disabled
          ? 'bg-muted/30 border-muted cursor-not-allowed opacity-60'
          : 'bg-card border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
      } ${className}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${disabled ? 'bg-muted' : 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${disabled ? 'text-muted-foreground' : 'text-primary'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </h3>
            {badge && (
              <Badge variant="secondary" className="text-xs h-4">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {href && !disabled && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
});

SettingsItem.displayName = "SettingsItem";
