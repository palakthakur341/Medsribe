import * as React from "react";
import type { FormSectionProps } from "../types";

/**
 * Form Section Component
 * Provides a consistent layout for form sections with title and description
 */
export const FormSection = React.memo<FormSectionProps>(({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b pb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
});

FormSection.displayName = "FormSection";
