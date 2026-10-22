"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Save,
  Upload,
  Loader2,
  User,
  Stethoscope,
  GraduationCap,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import {
  doctorProfileSchema,
  type DoctorProfileFormData,
  titleOptions,
  specialtyOptions,
  boardCertificationOptions,
} from "@/lib/validations/doctor";

export default function DoctorProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Convex hooks
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Mutations
  const updateProfile = useMutation(api.doctors.updateDoctorProfile);
  const createProfile = useMutation(api.doctors.createOrUpdateDoctorProfile);

  // Form
  const form = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      phone: "",
      email: "",
      licenseNumber: "",
      npiNumber: "",
      deaNumber: "",
      primarySpecialty: "",
      secondarySpecialties: [],
      boardCertifications: [],
      medicalSchool: "",
      residency: "",
      fellowship: "",
      yearsOfExperience: 0,
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (doctorProfile) {
      form.reset({
        firstName: doctorProfile.firstName || "",
        lastName: doctorProfile.lastName || "",
        title: doctorProfile.title || "",
        phone: doctorProfile.phone || "",
        email: doctorProfile.email || "",
        licenseNumber: doctorProfile.licenseNumber || "",
        npiNumber: doctorProfile.npiNumber || "",
        deaNumber: doctorProfile.deaNumber || "",
        primarySpecialty: doctorProfile.primarySpecialty || "",
        secondarySpecialties: doctorProfile.secondarySpecialties || [],
        boardCertifications: doctorProfile.boardCertifications || [],
        medicalSchool: doctorProfile.medicalSchool || "",
        residency: doctorProfile.residency || "",
        fellowship: doctorProfile.fellowship || "",
        yearsOfExperience: doctorProfile.yearsOfExperience || 0,
      });
    }
  }, [doctorProfile, form]);

  const onSubmit = async (data: DoctorProfileFormData) => {
    try {
      setIsLoading(true);
      
      if (doctorProfile) {
        // Update existing profile
        await updateProfile({
          doctorId: doctorProfile._id,
          ...data,
        });
        toast({
          title: "Profile updated successfully!",
          description: "Your profile has been updated.",
        });
      } else {
        // Create new profile
        await createProfile({
          userId: session!.user.id as any,
          ...data,
        });
        toast({
          title: "Profile created successfully!",
          description: "Your profile has been created.",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/doctor/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-muted-foreground text-sm">
                Manage your professional information and credentials
              </p>
            </div>
            {doctorProfile && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Stethoscope className="h-3 w-3" />
                License: {doctorProfile.licenseNumber}
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Overview */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctorProfile?.profileImageUrl} alt="Profile" />
              <AvatarFallback className="text-sm">
                {doctorProfile ?
                  `${doctorProfile.firstName?.[0] || ""}${doctorProfile.lastName?.[0] || ""}` :
                  session.user.email?.charAt(0).toUpperCase() || "D"
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">
                {doctorProfile ? `${doctorProfile.title || "Dr."} ${doctorProfile.firstName} ${doctorProfile.lastName}` : "Complete Your Profile"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {doctorProfile ?
                  `${doctorProfile.primarySpecialty} • ${doctorProfile.yearsOfExperience || 0} years experience` :
                  "Set up your professional profile to get started"
                }
              </p>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex-shrink-0 mb-4">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="flex items-center gap-2">
                      <Stethoscope className="h-3 w-3" />
                      Professional
                    </TabsTrigger>
                    <TabsTrigger value="education" className="flex items-center gap-2">
                      <GraduationCap className="h-3 w-3" />
                      Education
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content - Scrollable */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full scrollbar-hide">
                      <div className="space-y-4">
                        <TabsContent value="personal" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select title" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {titleOptions.map((title) => (
                                        <SelectItem key={title} value={title}>
                                          {title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="Enter email address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="professional" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="licenseNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medical License Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter license number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="npiNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>NPI Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter NPI number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="primarySpecialty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Specialty</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select specialty" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {specialtyOptions.map((specialty) => (
                                        <SelectItem key={specialty} value={specialty}>
                                          {specialty}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="yearsOfExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Years of Experience</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter years of experience"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="deaNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>DEA Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter DEA number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <div>
                              <Label>Secondary Specialties (Optional)</Label>
                              <p className="text-sm text-muted-foreground mb-2">Add additional specialties</p>
                              <div className="flex flex-wrap gap-2">
                                {form.watch("secondarySpecialties")?.map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {specialty}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = form.getValues("secondarySpecialties") || [];
                                        form.setValue("secondarySpecialties", current.filter((_, i) => i !== index));
                                      }}
                                      className="ml-1 text-xs hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <Select
                                onValueChange={(value) => {
                                  const current = form.getValues("secondarySpecialties") || [];
                                  if (!current.includes(value)) {
                                    form.setValue("secondarySpecialties", [...current, value]);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Add secondary specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                  {specialtyOptions.map((specialty) => (
                                    <SelectItem key={specialty} value={specialty}>
                                      {specialty}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Board Certifications (Optional)</Label>
                              <p className="text-sm text-muted-foreground mb-2">Add your board certifications</p>
                              <div className="flex flex-wrap gap-2">
                                {form.watch("boardCertifications")?.map((cert, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {cert}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = form.getValues("boardCertifications") || [];
                                        form.setValue("boardCertifications", current.filter((_, i) => i !== index));
                                      }}
                                      className="ml-1 text-xs hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <Select
                                onValueChange={(value) => {
                                  const current = form.getValues("boardCertifications") || [];
                                  if (!current.includes(value)) {
                                    form.setValue("boardCertifications", [...current, value]);
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Add board certification" />
                                </SelectTrigger>
                                <SelectContent>
                                  {boardCertificationOptions.map((cert) => (
                                    <SelectItem key={cert} value={cert}>
                                      {cert}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="education" className="space-y-4 mt-0">
                          <FormField
                            control={form.control}
                            name="medicalSchool"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medical School</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter medical school name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="residency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Residency</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter residency program" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="fellowship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fellowship (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter fellowship program" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>


                      </div>
                    </ScrollArea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex-shrink-0 pt-4 border-t">
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}
