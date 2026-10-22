import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferralsFiltersProps } from "../types";

/**
 * ReferralsFilters Component
 * 
 * Provides comprehensive filtering interface for referrals
 * Includes search and status filtering functionality
 */
export const ReferralsFilters = React.memo<ReferralsFiltersProps>(({
  filters,
  onSearchChange,
  onStatusChange,
  onClearFilters,
  className = "",
}) => {
  return (
    <div className={cn("flex-shrink-0 flex flex-col sm:flex-row gap-4", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient or doctor name..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={filters.statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="declined">Declined</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

ReferralsFilters.displayName = "ReferralsFilters";
