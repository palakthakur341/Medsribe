"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    setError(errorParam);
  }, [searchParams]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You cancelled the sign-in process or access was denied.",
          suggestion: "Please try signing in again or use a different method.",
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          description: "There's an issue with the authentication configuration.",
          suggestion: "Please contact support if this problem persists.",
        };
      case "Verification":
        return {
          title: "Verification Error",
          description: "Unable to verify your account.",
          suggestion: "Please try again or contact support.",
        };
      case "Default":
      default:
        return {
          title: "Authentication Error",
          description: "Something went wrong during the sign-in process.",
          suggestion: "Please try again or use a different sign-in method.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center space-y-2 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mx-auto">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{errorInfo.title}</h1>
          <p className="text-sm text-muted-foreground">
            {errorInfo.description}
          </p>
        </div>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {errorInfo.suggestion}
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Link href="/auth/select-role">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-center">
            <Link
              href="/"
              className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
