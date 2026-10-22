// Main exports for shared SOAP functionality
export * from './hooks';
export * from './components';
export * from './types';

// Convenience re-exports for common usage patterns
export {
  useSharedSOAPAuth,
  useSharedSOAPNotes,
  useSharedSOAPActions,
} from './hooks';

export {
  SharedSOAPSkeleton,
  SharedSOAPFilters,
  SharedSOAPNoteCard,
  SharedSOAPNotesList,
} from './components';
