"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";
import { useToast } from "@/hooks/use-toast";
import { userRAGHooks } from "@/lib/services/user-rag-hooks";
import type { UserRegistrationEventData, DoctorProfileEventData, PatientProfileEventData } from "@/lib/services/user-rag-hooks";


import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, User, Building, ArrowLeft, Stethoscope, UserCheck, Building2, Link2 } from "lucide-react";
import Link from "next/link";
import { format, getDaysInMonth } from "date-fns";

type UserRole = "doctor" | "patient" | "pharmacy";

interface StreamlinedRegistrationProps {
  role: UserRole; // Make role required since it comes from role selection
}

// Step 1: Account Creation (Combined personal info + security)
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 2: Role-Specific Essentials (Simplified)
const step2PatientSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["M", "F", "O"], { required_error: "Please select a gender" }),
});

const step2DoctorSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  licenseNumber: z.string().min(1, "Medical license number is required"),
  primarySpecialty: z.string().min(1, "Primary specialty is required"),
});

const step2PharmacySchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  phone: z.string().min(10, "Phone number is required"),
  licenseNumber: z.string().min(1, "Pharmacy license number is required"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2PatientData = z.infer<typeof step2PatientSchema>;
type Step2DoctorData = z.infer<typeof step2DoctorSchema>;
type Step2PharmacyData = z.infer<typeof step2PharmacySchema>;

const DATE_OF_BIRTH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DATE_OF_BIRTH_YEARS = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, index) => new Date().getFullYear() - index,
);

export function StreamlinedRegistration({ role }: StreamlinedRegistrationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedRole] = useState<UserRole>(role); // Role is fixed from previous selection

  const createUser = useMutation(api.users.createUser);
  const createDoctorProfile = useMutation(api.doctors.createOrUpdateDoctorProfile);
  const createPatientProfile = useMutation(api.patients.createPatientProfile);
  const createPharmacyProfile = useMutation(api.pharmacies.createPharmacy);



  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return UserCheck;
      case "doctor": return Stethoscope;
      case "pharmacy": return Building2;
      default: return User;
    }
  };

  const getRoleDescription = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return "Join thousands of patients managing their health with MedScribe";
      case "doctor": return "Connect with patients and streamline your practice with MedScribe";
      case "pharmacy": return "Manage prescriptions and connect with healthcare providers";
      default: return "Welcome to MedScribe";
    }
  };

  const getRoleStepTitle = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return "Patient Details";
      case "doctor": return "Professional Info";
      case "pharmacy": return "Pharmacy Details";
      default: return "Details";
    }
  };

  const getStepsForRole = (userRole: UserRole) => {
    return [
      { number: 1, title: "Account Setup", icon: User, completed: currentStep > 1 },
      { number: 2, title: getRoleStepTitle(userRole), icon: Building, completed: currentStep > 2 },
    ];
  };

  const steps = getStepsForRole(selectedRole);

  // Step 1 Form (Account Creation)
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 2 Forms (Role-specific essentials)
  const step2PatientForm = useForm<Step2PatientData>({
    resolver: zodResolver(step2PatientSchema),
    defaultValues: {
      phone: "",
      dateOfBirth: undefined,
      gender: "M",
    },
  });

  const step2DoctorForm = useForm<Step2DoctorData>({
    resolver: zodResolver(step2DoctorSchema),
    defaultValues: {
      phone: "",
      licenseNumber: "",
      primarySpecialty: "",
    },
  });

  const step2PharmacyForm = useForm<Step2PharmacyData>({
    resolver: zodResolver(step2PharmacySchema),
    defaultValues: {
      organizationName: "",
      phone: "",
      licenseNumber: "",
    },
  });

  // Step handlers
  const onStep1Submit = async (data: Step1Data) => {
    try {
      setIsLoading(true);
      setFormData(prev => ({ ...prev, ...data, role: selectedRole })); // Include role from props
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (data: Step2PatientData | Step2DoctorData | Step2PharmacyData) => {
    try {
      setIsLoading(true);
      const updatedFormData = { ...formData, ...data };
      setFormData(updatedFormData);

      await handleFinalSubmit(updatedFormData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (finalData: any) => {
    try {
      setIsLoading(true);

      // Create regular user with hashed password
      const passwordHash = await bcrypt.hash(finalData.password, 12);
      const userId = await createUser({
        email: finalData.email,
        passwordHash,
        role: finalData.role,
      });

      // Create role-specific profile
      await createRoleProfile(userId, finalData);

      // 🔥 Embed user registration into RAG system (production-ready)
      const registrationData: UserRegistrationEventData = {
        userId: userId as string,
        email: finalData.email,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        role: finalData.role,
        registrationMethod: 'manual',
        createdAt: Date.now(),
      };

      await userRAGHooks.onUserRegistered(registrationData);

      toast({
        title: "Account Created!",
        description: "Welcome to MedScribe.",
      });

      // Clear localStorage
      localStorage.removeItem("selectedRole");

      // Redirect based on role
      setTimeout(() => {
        const dashboardPath = finalData.role === "pharmacy"
          ? "/pharmacy/dashboard"
          : `/${finalData.role}`;
        router.push(dashboardPath);
      }, 2000);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRoleProfile = async (userId: string, data: any) => {
    switch (data.role) {
      case "doctor":
        await createDoctorProfile({
          userId: userId as any,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          licenseNumber: data.licenseNumber,
          primarySpecialty: data.primarySpecialty,
        });

        // 🔥 Embed doctor profile creation into RAG system
        const doctorProfileData: DoctorProfileEventData = {
          userId: userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'doctor',
          registrationMethod: 'manual',
          createdAt: Date.now(),
          phone: data.phone,
          licenseNumber: data.licenseNumber,
          primarySpecialty: data.primarySpecialty,
        };
        await userRAGHooks.onDoctorProfileCreated(doctorProfileData);
        break;

      case "patient":
        await createPatientProfile({
          userId: userId as any,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          primaryPhone: data.phone,
          dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : "1990-01-01",
          gender: data.gender,
          // Required fields with defaults for now
          addressLine1: "To be updated",
          city: "To be updated",
          state: "To be updated",
          zipCode: "00000",
          country: "USA",
          emergencyContactName: "To be updated",
          emergencyContactPhone: "To be updated",
          emergencyContactRelation: "To be updated",
        });

        // 🔥 Embed patient profile creation into RAG system
        const patientProfileData: PatientProfileEventData = {
          userId: userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'patient',
          registrationMethod: 'manual',
          createdAt: Date.now(),
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : "1990-01-01",
          gender: data.gender,
        };
        await userRAGHooks.onPatientProfileCreated(patientProfileData);
        break;

      case "pharmacy":
        await createPharmacyProfile({
          userId: userId as any,
          name: data.organizationName,
          licenseNumber: data.licenseNumber,
          phone: data.phone,
          email: data.email,
          ncpdpId: `TEMP_${Date.now()}`, // Temporary, to be updated
          address: {
            street: "To be updated",
            city: "To be updated",
            state: "To be updated",
            zipCode: "00000",
          },
          isActive: true,
          isVerified: false,
        });
        break;
    }
  };

  // Render Step 1: Account Creation
  const renderStep1 = () => (
    <Form {...step1Form}>
      <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-6">
        {/* Registration Form */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={step1Form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={step1Form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={step1Form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={step1Form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={step1Form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Continue"}
        </Button>
      </form>
    </Form>
  );

  // Render Step 2: Role-Specific Essentials
  const renderStep2 = () => {
    switch (selectedRole) {
      case "patient":
        return (
          <Form {...step2PatientForm}>
            <form onSubmit={step2PatientForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2PatientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <FormField
                  control={step2PatientForm.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const selectedDate = field.value ?? new Date(2000, 0, 1);
                    const selectedYear = selectedDate.getFullYear();
                    const selectedMonth = selectedDate.getMonth();
                    const daysInSelectedMonth = getDaysInMonth(selectedDate);

                    const updateDate = (changes: Partial<{ year: number; month: number; day: number }>) => {
                      const year = changes.year ?? selectedYear;
                      const month = changes.month ?? selectedMonth;
                      const day = Math.min(changes.day ?? selectedDate.getDate(), getDaysInMonth(new Date(year, month)));
                      field.onChange(new Date(year, month, day));
                    };

                    return (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-2">
                        <Select
                          value={field.value ? String(selectedMonth) : undefined}
                          onValueChange={(value) => updateDate({ month: Number(value) })}
                        >
                          <SelectTrigger className="w-full min-w-0" aria-label="Birth month"><SelectValue placeholder="Month" /></SelectTrigger>
                          <SelectContent>
                            {DATE_OF_BIRTH_MONTHS.map((month, index) => (
                              <SelectItem key={month} value={String(index)}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={field.value ? String(selectedDate.getDate()) : undefined}
                          onValueChange={(value) => updateDate({ day: Number(value) })}
                        >
                          <SelectTrigger className="w-full min-w-0" aria-label="Birth day"><SelectValue placeholder="Day" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1).map((day) => (
                              <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={field.value ? String(selectedYear) : undefined}
                          onValueChange={(value) => updateDate({ year: Number(value) })}
                        >
                          <SelectTrigger className="w-full min-w-0" aria-label="Birth year"><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {DATE_OF_BIRTH_YEARS.map((year) => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">Select month, day, and year.</p>
                      <FormMessage />
                    </FormItem>
                    );
                  }}
                />

                <FormField
                  control={step2PatientForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case "doctor":
        return (
          <Form {...step2DoctorForm}>
            <form onSubmit={step2DoctorForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2DoctorForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2DoctorForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2DoctorForm.control}
                name="primarySpecialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="family-medicine">Family Medicine</SelectItem>
                        <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case "pharmacy":
        return (
          <Form {...step2PharmacyForm}>
            <form onSubmit={step2PharmacyForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2PharmacyForm.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Pharmacy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2PharmacyForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2PharmacyForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  // Main component render
  return (
    <div className="w-full max-w-md">
      {/* Back to Role Selection */}
      <div className="mb-6">
        <Link
          href="/auth/select-role"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to role selection
        </Link>
      </div>

      {/* Header with Logo and Role */}
      <div className="text-center space-y-4 pb-8">
        {/* Logo and Role Icon Connection */}
        <div className="flex items-center justify-center space-x-4">
          {/* MedScribe Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            <div className="text-2xl font-bold text-primary">M</div>
          </div>

          {/* Connection Link Icon */}
          <Link2 className="h-8 w-8 text-primary" />

          {/* Role Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            {(() => {
              const RoleIcon = getRoleIcon(selectedRole);
              return <RoleIcon className="h-8 w-8 text-primary" />;
            })()}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create Your Account</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {getRoleDescription(selectedRole)}
          </p>
        </div>
      </div>



      {/* Step Indicators */}
      <div className="flex justify-center space-x-4 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-center space-y-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                step.completed || currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Login Link */}
        <div className="pt-6 border-t border-border text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
