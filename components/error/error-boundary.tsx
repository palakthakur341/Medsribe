"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with error monitoring service (e.g., Sentry)
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.message || "Unknown error"}
Stack: ${error?.stack || "No stack trace"}
Component Stack: ${errorInfo?.componentStack || "No component stack"}
Context: ${this.props.context || "No context"}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      toast.success("Error details copied to clipboard");
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      toast.error("Failed to copy error details");
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails, copied } = this.state;
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <p className="text-muted-foreground">
                {this.props.context 
                  ? `An error occurred in ${this.props.context}`
                  : "An unexpected error occurred while loading this component"
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Message */}
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Error Details Toggle */}
              {(isDevelopment || this.props.showDetails) && (
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full justify-between"
                  >
                    <span>Error Details</span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showDetails && (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={this.copyErrorDetails}
                          disabled={copied}
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Details
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto max-h-64">
                        <div className="space-y-2">
                          <div>
                            <strong>Error Message:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">{error?.message}</pre>
                          </div>
                          
                          {error?.stack && (
                            <div>
                              <strong>Stack Trace:</strong>
                              <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                            </div>
                          )}
                          
                          {errorInfo?.componentStack && (
                            <div>
                              <strong>Component Stack:</strong>
                              <pre className="mt-1 whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                            </div>
                          )}
                          
                          <div>
                            <strong>Context:</strong> {this.props.context || "No context provided"}
                          </div>
                          
                          <div>
                            <strong>Timestamp:</strong> {new Date().toISOString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                If this problem persists, please contact support with the error details above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || "component"}:`, error);
    
    // Show user-friendly error message
    toast.error(
      error.message || "An unexpected error occurred. Please try again.",
      {
        description: context ? `Error in ${context}` : undefined,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      }
    );

    // Log to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with error monitoring service
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return { handleError };
}

// Retry wrapper component for async operations
export function RetryWrapper({
  children,
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  fallback,
}: {
  children: React.ReactNode;
  onRetry: () => Promise<void> | void;
  maxRetries?: number;
  retryDelay?: number;
  fallback?: React.ReactNode;
}) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleRetry = React.useCallback(async () => {
    if (retryCount >= maxRetries) return;

    setIsRetrying(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      await onRetry();
      setRetryCount(0);
    } catch (err) {
      setError(err as Error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries, retryDelay]);

  if (error && retryCount >= maxRetries) {
    return fallback || (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load after {maxRetries} attempts. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Something went wrong. Attempt {retryCount} of {maxRetries}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
