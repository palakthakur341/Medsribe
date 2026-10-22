// Active hooks (simplified approach)
export { useSOAPStats, getQualityLevel, getQualityColor } from "./useSOAPStats";
export { useSOAPNoteDialog } from "./useSOAPNoteDialog";
export { useSOAPDocumentViewer } from "./useSOAPDocumentViewer";

// Re-export types for convenience
export type {
  UseSOAPStatsReturn,
  UseSOAPNoteDialogReturn,
  UseSOAPDocumentViewerReturn,
} from "../types";
