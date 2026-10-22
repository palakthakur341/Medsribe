// Export all shared SOAP hooks
export { useSharedSOAPAuth } from './useSharedSOAPAuth';
export { useSharedSOAPNotes } from './useSharedSOAPNotes';
export { useSharedSOAPActions } from './useSharedSOAPActions';

// Re-export types for convenience
export type {
  UseSharedSOAPAuthReturn,
  UseSharedSOAPNotesReturn,
  UseSharedSOAPActionsReturn,
} from '../types';
