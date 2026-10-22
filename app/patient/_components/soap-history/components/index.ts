// Core components
export { SOAPNoteCard } from "./SOAPNoteCard";
export { SOAPNotesGrid } from "./SOAPNotesGrid";
export { SOAPSearchBar } from "./SOAPSearchBar";
export { SOAPStatsOverview } from "./SOAPStatsOverview";
export { SOAPEmptyState } from "./SOAPEmptyState";
export { SOAPHistoryHeader } from "./SOAPHistoryHeader";
export { SOAPNoteDetailView } from "./SOAPNoteDetailView";
export { SOAPHistorySkeleton } from "./SOAPHistorySkeleton";
export { SOAPNoteDialog } from "./SOAPNoteDialog";
export { SOAPNoteDialogWrapper, useSOAPNoteDialogComponent } from "./SOAPNoteDialogWrapper";
export { SOAPNoteDocumentViewer } from "./SOAPNoteDocumentViewer";
export { SOAPDocumentViewerWrapper, useSOAPDocumentViewerComponent } from "./SOAPDocumentViewerWrapper";
export { ShareSOAPDialog } from "./ShareSOAPDialog";
export { SOAPNotesDisplay } from "./SOAPNotesDisplay";
export { SOAPErrorBoundary, useErrorHandler } from "./SOAPErrorBoundary";

// Re-export component prop types for convenience
export type {
  SOAPNoteCardProps,
  SOAPNotesGridProps,
  SOAPSearchBarProps,
  SOAPStatsOverviewProps,
  SOAPEmptyStateProps,
  SOAPHistoryHeaderProps,
} from "../types";
