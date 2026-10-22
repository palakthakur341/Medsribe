"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableCompactProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  actions?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function DataTableCompact<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchable = false,
  searchPlaceholder = "Search...",
  filterable = false,
  actions,
  emptyState,
  className,
  maxHeight = "400px",
}: DataTableCompactProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-muted-foreground mb-2">No data available</div>
      <div className="text-sm text-muted-foreground">
        {searchTerm ? "Try adjusting your search" : "Data will appear here when available"}
      </div>
    </div>
  );

  return (
    <Card className={cn("border-0 shadow-md", className)}>
      {(title || description || searchable || filterable) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              )}
              {filterable && (
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div 
            className="overflow-auto"
            style={{ maxHeight }}
          >
            {sortedData.length === 0 ? (
              emptyState || defaultEmptyState
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={cn(
                          "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide",
                          column.sortable && "cursor-pointer hover:bg-muted/80",
                          column.className
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-1">
                          {column.label}
                          {column.sortable && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "px-4 py-3 text-sm",
                            column.className
                          )}
                        >
                          {column.render
                            ? column.render(item[column.key], item)
                            : String(item[column.key] || "-")}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-3 text-right">
                          {actions(item)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick list component for simple data display
interface QuickListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  emptyMessage?: string;
  className?: string;
  maxItems?: number;
  showMore?: () => void;
}

export function QuickList<T>({
  items,
  renderItem,
  title,
  emptyMessage = "No items",
  className,
  maxItems,
  showMore,
}: QuickListProps<T>) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && items.length > maxItems;

  return (
    <Card className={cn("border-0 shadow-md", className)}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-0">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                {renderItem(item, index)}
              </div>
            ))}
            {hasMore && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={showMore}
                  className="w-full"
                >
                  Show {items.length - maxItems!} more
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
