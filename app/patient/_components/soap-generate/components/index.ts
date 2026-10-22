/**
 * SOAP Generate Components Index
 * Exports all components for the new SOAP generation interface
 */

// Main components
export { SOAPGenerateHeader } from './SOAPGenerateHeader';
export { SOAPGenerateContent } from './SOAPGenerateContent';
export { SOAPGenerateSkeleton } from './SOAPGenerateSkeleton';
export { SOAPErrorBoundary, useErrorHandler } from './SOAPErrorBoundary';

// Input components
export { AudioInputSection } from './AudioInputSection';
export { TextInputSection } from './TextInputSection';
export { ConversationInputSection } from './ConversationInputSection';

// Processing and display components
export { ProcessingIndicator } from './ProcessingIndicator';
export { QualityMetricsDisplay } from './QualityMetricsDisplay';
export { SOAPResultPreview } from './SOAPResultPreview';
