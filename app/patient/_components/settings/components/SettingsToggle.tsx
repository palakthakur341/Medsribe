import * as React from "react";
import { Switch } from "@/components/ui/switch";
import type { SettingsToggleProps } from "../types";

/**
 * Settings Toggle Component
 * Provides a toggle switch for boolean settings
 */
export const SettingsToggle = React.memo<SettingsToggleProps>(({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
});

SettingsToggle.displayName = "SettingsToggle";
