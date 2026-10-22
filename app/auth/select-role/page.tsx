"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserCheck, Stethoscope, Loader2, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { selectRoleSchema, type SelectRoleFormData } from "@/lib/validations/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SelectRolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SelectRoleFormData>({
    resolver: zodResolver(selectRoleSchema),
  });

  const onSubmit = async (data: SelectRoleFormData) => {
    setIsLoading(true);

    // Store the selected role in localStorage for the registration process
    localStorage.setItem("selectedRole", data.role);

    // Redirect to registration page
    router.push("/auth/register");

    setIsLoading(false);
  };

  const selectedRole = form.watch("role");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center space-y-3 pb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            <div className="text-2xl font-bold text-primary">M</div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to MedScribe</h1>
            <p className="text-muted-foreground">
              Choose your role to get started
            </p>
          </div>
        </div>

        <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="relative">
                            <RadioGroupItem
                              value="doctor"
                              id="doctor"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="doctor"
                              className={`
                                group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                ${selectedRole === "doctor" 
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                  : "border-border/40 bg-background/50 hover:bg-muted/30 hover:border-border"
                                }
                              `}
                            >
                              <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                                ${selectedRole === "doctor"
                                  ? "bg-primary/10 ring-2 ring-primary/20"
                                  : "bg-muted/50 group-hover:bg-primary/5"
                                }
                              `}>
                                <Stethoscope className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-base font-semibold text-foreground">Doctor</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  Manage patients, consultations, and medical records
                                </div>
                              </div>
                              {selectedRole === "doctor" && (
                                <ArrowRight className="h-5 w-5 text-primary" />
                              )}
                            </Label>
                          </div>

                          <div className="relative">
                            <RadioGroupItem
                              value="patient"
                              id="patient"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="patient"
                              className={`
                                group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                ${selectedRole === "patient" 
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                  : "border-border/40 bg-background/50 hover:bg-muted/30 hover:border-border"
                                }
                              `}
                            >
                              <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                                ${selectedRole === "patient"
                                  ? "bg-primary/10 ring-2 ring-primary/20"
                                  : "bg-muted/50 group-hover:bg-primary/5"
                                }
                              `}>
                                <UserCheck className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-base font-semibold text-foreground">Patient</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  Access your medical records and appointments
                                </div>
                              </div>
                              {selectedRole === "patient" && (
                                <ArrowRight className="h-5 w-5 text-primary" />
                              )}
                            </Label>
                          </div>

                          <div className="relative">
                            <RadioGroupItem
                              value="pharmacy"
                              id="pharmacy"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="pharmacy"
                              className={`
                                group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                ${selectedRole === "pharmacy"
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-border/40 bg-background/50 hover:bg-muted/30 hover:border-border"
                                }
                              `}
                            >
                              <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                                ${selectedRole === "pharmacy"
                                  ? "bg-primary/10 ring-2 ring-primary/20"
                                  : "bg-muted/50 group-hover:bg-primary/5"
                                }
                              `}>
                                <Building2 className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-base font-semibold text-foreground">Pharmacy</div>
                                <div className="text-sm text-muted-foreground leading-tight">
                                  Manage prescriptions and pharmacy operations
                                </div>
                              </div>
                              {selectedRole === "pharmacy" && (
                                <ArrowRight className="h-5 w-5 text-primary" />
                              )}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-medium"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link Footer */}
            <div className="pt-6 border-t border-border text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Already registered? Log in
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}