import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { TreatmentFiltersProps, TreatmentStatus } from "../types";

/**
 * Treatment Filters Component
 * Provides search and status filtering for treatments
 */
export const TreatmentFilters = React.memo<TreatmentFiltersProps>(({
  filters,
  onFiltersChange,
  stats,
  className = "",
}) => {
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchTerm: e.target.value,
    });
  }, [filters, onFiltersChange]);

  const handleStatusFilterChange = React.useCallback((status: TreatmentStatus | "all") => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? [] : [status],
    });
  }, [filters, onFiltersChange]);

  const currentStatusFilter = filters.status.length === 0 ? "all" : filters.status[0];

  const statusOptions = [
    { value: "all" as const, label: "All", count: stats.total },
    { value: "active" as const, label: "Active", count: stats.active },
    { value: "completed" as const, label: "Completed", count: stats.completed },
    { value: "discontinued" as const, label: "Stopped", count: stats.discontinued }
  ];

  return (
    <div className={`flex-shrink-0 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex gap-1">
            {statusOptions.map((status) => (
              <Button
                key={status.value}
                variant={currentStatusFilter === status.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(status.value)}
                className="h-8 text-xs"
              >
                {status.label}
                {status.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {status.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TreatmentFilters.displayName = "TreatmentFilters";
