import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { FormSection } from "./FormSection";
import { EMERGENCY_CONTACT_RELATION_OPTIONS } from "../types";
import type { EmergencyContactSectionProps } from "../types";

/**
 * Emergency Contact Section Component
 * Handles emergency contact information
 */
export const EmergencyContactSection = React.memo<EmergencyContactSectionProps>(({ form }) => {
  return (
    <FormSection
      title="Emergency Contact"
      description="Person to contact in case of emergency"
      icon={Shield}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="emergencyContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter emergency contact name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Phone *</FormLabel>
              <FormControl>
                <Input placeholder="Enter emergency contact phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="emergencyContactRelation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relationship *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EMERGENCY_CONTACT_RELATION_OPTIONS.map((relation) => (
                  <SelectItem key={relation.value} value={relation.value}>
                    {relation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
});

EmergencyContactSection.displayName = "EmergencyContactSection";
