"use client";

import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, Filter, Stethoscope, Shield, ShieldAlert, Brain, AlertTriangle } from "lucide-react";
import { SOAPSearchBarProps, SearchFilters } from "../types";
import { cn } from "@/lib/utils";

/**
 * Enhanced SOAP Search Bar with advanced filtering capabilities
 * Includes specialty, safety status, quality metrics, and enhanced data filters
 */
export const SOAPSearchBar = React.memo<SOAPSearchBarProps>(({
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount,
  placeholder = "Search SOAP notes...",
  debounceMs = 300,
  showFilters = false,
  filters,
  onFiltersChange,
  className,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  // Handle filter updates
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, [key]: value });
    }
  }, [filters, onFiltersChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({
        searchTerm: "",
        sortBy: "date",
        sortOrder: "desc",
      });
    }
  }, [onFiltersChange]);

  // Count active filters
  const activeFiltersCount = filters ? Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchTerm' || key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return true;
    return value !== undefined && value !== "all";
  }).length : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Results Count Badge */}
      <Badge
        variant={searchTerm || activeFiltersCount > 0 ? "default" : "secondary"}
        className="text-xs whitespace-nowrap"
      >
        {filteredCount}/{totalCount}
      </Badge>

      {/* Enhanced Filters Popover */}
      {showFilters && filters && onFiltersChange && (
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2",
                activeFiltersCount > 0 && "border-primary text-primary"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Safety Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Safety Status
                </label>
                <Select
                  value={filters.safetyStatus || "all"}
                  onValueChange={(value) => updateFilter("safetyStatus", value as "safe" | "unsafe" | "all")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notes</SelectItem>
                    <SelectItem value="safe">Safe Only</SelectItem>
                    <SelectItem value="unsafe">Requires Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality Score Range</label>
                <div className="px-2">
                  <Slider
                    value={[
                      filters.qualityRange?.min || 0,
                      filters.qualityRange?.max || 100
                    ]}
                    onValueChange={([min, max]) =>
                      updateFilter("qualityRange", { min, max })
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{filters.qualityRange?.min || 0}%</span>
                    <span>{filters.qualityRange?.max || 100}%</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Data Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enhanced-data"
                  checked={filters.hasEnhancedData === true}
                  onCheckedChange={(checked) =>
                    updateFilter("hasEnhancedData", checked ? true : undefined)
                  }
                />
                <label htmlFor="enhanced-data" className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  AI Enhanced Notes Only
                </label>
              </div>

              {/* Red Flags Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="red-flags"
                  checked={filters.hasRedFlags === true}
                  onCheckedChange={(checked) =>
                    updateFilter("hasRedFlags", checked ? true : undefined)
                  }
                />
                <label htmlFor="red-flags" className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Notes with Red Flags
                </label>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy || "date"}
                  onValueChange={(value) => updateFilter("sortBy", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="quality">Quality Score</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                    <SelectItem value="safety">Safety Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});

SOAPSearchBar.displayName = "SOAPSearchBar";
