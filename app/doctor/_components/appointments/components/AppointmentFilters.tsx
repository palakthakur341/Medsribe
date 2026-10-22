import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import type { AppointmentFiltersProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * AppointmentFilters Component
 * 
 * Provides search and category filtering for appointments
 * Includes quick action button for scheduling new appointments
 */
export const AppointmentFilters = React.memo<AppointmentFiltersProps>(({
  searchTerm,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
  onScheduleNew,
  className = "",
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Schedule Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Button 
          className="rounded-lg"
          onClick={onScheduleNew}
        >
          <Plus className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 border-b">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              selectedCategory === category.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
});

AppointmentFilters.displayName = "AppointmentFilters";
