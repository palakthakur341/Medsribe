import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import type { PatientFiltersProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientFilters Component
 * 
 * Provides search functionality for patients
 * Includes quick action button for adding new patients
 */
export const PatientFilters = React.memo<PatientFiltersProps>(({
  searchTerm,
  onSearchChange,
  onAddPatient,
  className = "",
}) => {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search patients by name, email, phone, or MRN..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Add Patient Button */}
      <Button
        onClick={onAddPatient}
        className="h-10"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Patient
      </Button>
    </div>
  );
});

PatientFilters.displayName = "PatientFilters";
