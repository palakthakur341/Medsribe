"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/convex/_generated/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const token = searchParams.get("token");

  // Validate token (skip validation if password was already reset successfully)
  const tokenValidation = useQuery(
    api.users.validatePasswordResetToken,
    token && !isSuccess ? { token } : "skip"
  );

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      form.setValue("token", token);
    }
  }, [token, form]);

  // Clear URL token after successful reset to prevent re-validation
  useEffect(() => {
    if (isSuccess) {
      // Replace the current URL without the token parameter
      window.history.replaceState({}, '', '/auth/reset-password');
    }
  }, [isSuccess]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password reset successful",
          description: result.message,
        });

        // Start countdown and redirect
        let timeLeft = 3;
        setCountdown(timeLeft);

        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            router.push("/auth/login");
          }
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (tokenValidation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!token || (tokenValidation && !tokenValidation.valid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center space-y-2 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mx-auto">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Invalid Reset Link</h1>
            <p className="text-sm text-muted-foreground">
              {tokenValidation?.error || "This password reset link is invalid or has expired."}
            </p>
          </div>
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Link href="/auth/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors block"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md shadow-lg border-0 bg-card">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 mx-auto">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Password Reset Complete</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your password has been successfully reset. Redirecting to login in {countdown} seconds...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Link href="/auth/login">
                <Button className="w-full">
                  Continue to Login Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {tokenValidation?.email && `Resetting password for ${tokenValidation.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="h-10 text-sm pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="h-10 text-sm pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>

          <div className="pt-4 border-t border-border text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
