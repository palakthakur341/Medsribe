import * as React from "react";
import type { SettingsSectionProps } from "../types";

/**
 * Settings Section Component
 * Groups related settings items under a section header
 */
export const SettingsSection = React.memo<SettingsSectionProps>(({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4">
        {children}
      </div>
    </div>
  );
});

SettingsSection.displayName = "SettingsSection";
