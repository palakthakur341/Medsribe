import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { FormSection } from "./FormSection";
import { BLOOD_TYPE_OPTIONS } from "../types";
import type { MedicalInfoSectionProps } from "../types";

/**
 * Medical Information Section Component
 * Handles medical details like blood type and advance directives
 */
export const MedicalInfoSection = React.memo<MedicalInfoSectionProps>(({ form }) => {
  return (
    <FormSection
      title="Medical Information"
      description="Medical details and health-related information"
      icon={Heart}
    >
      <FormField
        control={form.control}
        name="bloodType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Blood Type (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BLOOD_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="advanceDirectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advance Directives (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any advance directives or special medical instructions..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
});

MedicalInfoSection.displayName = "MedicalInfoSection";
