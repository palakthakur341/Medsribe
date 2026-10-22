// Main exports - components
export {
  SOAPNoteCard,
  SOAPNotesGrid,
  SOAPSearchBar,
  SOAPStatsOverview,
  SOAPEmptyState,
  SOAPHistoryHeader,
  SOAPNoteDetailView,
  SOAPHistorySkeleton,
  SOAPNoteDialog,
  SOAPNoteDialogWrapper,
  useSOAPNoteDialogComponent,
  SOAPNoteDocumentViewer,
  SOAPDocumentViewerWrapper,
  useSOAPDocumentViewerComponent,
  SOAPErrorBoundary,
  useErrorHandler,
  ShareSOAPDialog,
  SOAPNotesDisplay,
} from "./components";

// Universal SOAP Viewer (new)
export { SOAPViewer, useSOAPViewer } from "@/components/ui/soap-viewer";

// Main exports - hooks (simplified approach)
export {
  useSOAPStats,
  useSOAPNoteDialog,
  useSOAPDocumentViewer,
  getQualityLevel,
  getQualityColor,
} from "./hooks";

// Type exports
export type {
  // Core types
  SOAPNote,
  PatientProfile,
  SharedSOAPNote,
  Referral,
  TimelineItem,
  SOAPStats,
  SearchFilters,
  
  // Component prop types
  SOAPNoteCardProps,
  SOAPNotesGridProps,
  SOAPSearchBarProps,
  SOAPStatsOverviewProps,
  SOAPEmptyStateProps,
  SOAPHistoryHeaderProps,
  
  // Hook return types (simplified)
  UseSOAPStatsReturn,
  UseSOAPNoteDialogReturn,
  UseSOAPDocumentViewerReturn,
  
  // Utility types
  QualityLevel,
  SortOption,
  ViewMode,
  SOAPError,
  LoadingStates,
} from "./types";
