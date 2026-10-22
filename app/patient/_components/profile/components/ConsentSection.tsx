import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";
import { FormSection } from "./FormSection";
import type { ConsentSectionProps } from "../types";

/**
 * Consent Section Component
 * Handles consent and privacy settings
 */
export const ConsentSection = React.memo<ConsentSectionProps>(({ form }) => {
  return (
    <FormSection
      title="Consent & Privacy"
      description="Your consent preferences for treatment and data sharing"
      icon={FileText}
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="consentForTreatment"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Consent for Treatment *
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  I consent to receive medical treatment and care from healthcare providers.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="consentForDataSharing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Consent for Data Sharing (Optional)
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  I consent to sharing my medical data with other healthcare providers for treatment purposes.
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
});

ConsentSection.displayName = "ConsentSection";
