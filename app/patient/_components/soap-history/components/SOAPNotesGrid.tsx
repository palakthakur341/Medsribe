"use client";

import React, { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { SOAPNoteCard } from "./SOAPNoteCard";
import { createTimelineFromSharedNotes } from "@/components/ui/timeline";
import { SOAPNotesGridProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Optimized SOAP Notes Grid with optional virtualization for performance
 * Supports both regular grid and virtualized list for large datasets
 */
export const SOAPNotesGrid = React.memo<SOAPNotesGridProps>(({
  notes,
  sharedNotesMap = new Map(),
  referrals = [],
  onDownload,
  onShare,
  onView,
  formatDate,
  getQualityColor,
  loading = false,
  virtualized = false,
  className,
}) => {
  // Memoize timeline creation for performance
  const notesWithTimelines = useMemo(() => {
    return notes.map((note) => {
      const noteSharedWith = sharedNotesMap.get(note._id) || [];
      const timelineItems = createTimelineFromSharedNotes(
        noteSharedWith, 
        referrals, 
        note._id
      );
      
      return {
        note,
        sharedWith: noteSharedWith,
        timelineItems,
      };
    });
  }, [notes, sharedNotesMap, referrals]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-48 bg-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (notes.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 text-muted-foreground",
        className
      )}>
        <p>No SOAP notes found</p>
      </div>
    );
  }

  // Virtualized list for large datasets (>50 items)
  if (virtualized && notes.length > 50) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const { note, sharedWith, timelineItems } = notesWithTimelines[index];
      
      return (
        <div style={style} className="px-2 pb-3">
          <SOAPNoteCard
            note={note}
            sharedWith={sharedWith}
            timelineItems={timelineItems}
            onDownload={onDownload}
            onShare={onShare}
            onView={onView}
            formatDate={formatDate}
            getQualityColor={getQualityColor}
          />
        </div>
      );
    };

    return (
      <div className={cn("h-full flex flex-col", className)}>
        <div className="flex-1 min-h-0">
          <List
            height={600} // Adjust based on container
            itemCount={notes.length}
            itemSize={200} // Approximate height of each card
            className="scrollbar-hide"
          >
            {Row}
          </List>
        </div>
      </div>
    );
  }

  // Regular grid layout
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="space-y-3">
          {notesWithTimelines.map(({ note, sharedWith, timelineItems }) => (
            <SOAPNoteCard
              key={note._id}
              note={note}
              sharedWith={sharedWith}
              timelineItems={timelineItems}
              onDownload={onDownload}
              onShare={onShare}
              onView={onView}
              formatDate={formatDate}
              getQualityColor={getQualityColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

SOAPNotesGrid.displayName = "SOAPNotesGrid";
