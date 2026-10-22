"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { SOAPEmptyStateProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Generic and configurable SOAP Empty State component
 * Reusable for different empty state scenarios
 */
export const SOAPEmptyState = React.memo<SOAPEmptyStateProps>(({
  searchTerm,
  onClearSearch,
  onCreateNew,
  title,
  description,
  actionLabel,
  showCreateAction = true,
  className,
}) => {
  // Dynamic content based on context
  const isSearchEmpty = !!searchTerm;
  
  const defaultTitle = isSearchEmpty 
    ? "No matching SOAP notes found"
    : "No SOAP notes yet";
    
  const defaultDescription = isSearchEmpty
    ? `No SOAP notes match your search for "${searchTerm}". Try adjusting your search terms or clear the search to see all notes.`
    : "You haven't generated any SOAP notes yet. Start by recording your first clinical note to build your medical documentation history.";
    
  const defaultActionLabel = isSearchEmpty
    ? "Generate New SOAP Note"
    : "Generate Your First SOAP Note";

  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  const displayActionLabel = actionLabel || defaultActionLabel;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-4 py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted/30 mb-4">
          {isSearchEmpty ? (
            <Search className="h-6 w-6 text-muted-foreground" />
          ) : (
            <FileText className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {displayDescription}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Clear Search Button (only for search empty state) */}
          {isSearchEmpty && onClearSearch && (
            <Button
              variant="outline"
              onClick={onClearSearch}
              className="text-xs"
            >
              Clear Search
            </Button>
          )}

          {/* Create New Action */}
          {showCreateAction && (
            <>
              {onCreateNew ? (
                <Button
                  onClick={onCreateNew}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  {displayActionLabel}
                </Button>
              ) : (
                <Link href="/patient/soap/generate">
                  <Button className="text-xs">
                    <Plus className="h-3 w-3 mr-2" />
                    {displayActionLabel}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SOAPEmptyState.displayName = "SOAPEmptyState";
