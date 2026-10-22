"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  User,
  Stethoscope,
  Clock,
  DollarSign,
  Camera,
  Save,
  Plus,
  X,
  Phone
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const doctorProfileSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  title: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required"),

  // Professional Credentials
  licenseNumber: z.string().min(5, "License number is required"),
  npiNumber: z.string().optional(),
  deaNumber: z.string().optional(),

  // Specialization & Practice
  primarySpecialty: z.string().min(2, "Primary specialty is required"),
  secondarySpecialties: z.array(z.string()).optional(),
  boardCertifications: z.array(z.string()).optional(),

  // Education & Experience
  medicalSchool: z.string().optional(),
  residency: z.string().optional(),
  fellowship: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),

  // Practice Information
  practiceName: z.string().optional(),
  department: z.string().optional(),
  hospitalAffiliations: z.array(z.string()).optional(),
  consultationFee: z.number().min(0).optional(),
  languagesSpoken: z.array(z.string()).optional(),
  bio: z.string().max(1000).optional(),

  // Availability
  isAcceptingNewPatients: z.boolean().optional(),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

const specializations = [
  "Allergy and Immunology", "Anesthesiology", "Cardiology", "Dermatology",
  "Emergency Medicine", "Endocrinology", "Family Medicine", "Gastroenterology",
  "General Surgery", "Geriatrics", "Hematology", "Infectious Disease",
  "Internal Medicine", "Nephrology", "Neurology", "Neurosurgery",
  "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedics",
  "Otolaryngology", "Pathology", "Pediatrics", "Physical Medicine",
  "Plastic Surgery", "Psychiatry", "Pulmonology", "Radiology",
  "Rheumatology", "Urology", "Other"
];

const departments = [
  "Emergency Department", "Intensive Care Unit", "Cardiology", "Neurology",
  "Orthopedics", "Pediatrics", "Surgery", "Radiology", "Laboratory",
  "Pharmacy", "Oncology", "Psychiatry", "Obstetrics", "Internal Medicine",
  "Family Medicine", "Outpatient Clinic", "Other"
];

const titles = ["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."];

const boardCertifications = [
  "American Board of Internal Medicine", "American Board of Surgery",
  "American Board of Pediatrics", "American Board of Psychiatry",
  "American Board of Radiology", "American Board of Anesthesiology",
  "American Board of Emergency Medicine", "American Board of Family Medicine",
  "American Board of Obstetrics and Gynecology", "Other"
];

export function DoctorProfileForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [newAffiliation, setNewAffiliation] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Convex hooks
  const createOrUpdateProfile = useMutation(api.doctors.createOrUpdateDoctorProfile);
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  const form = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema),
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
      practiceName: "",
      department: "",
      hospitalAffiliations: [],
      consultationFee: 0,
      languagesSpoken: [],
      bio: "",
      isAcceptingNewPatients: true,
    },
  });

  // Populate form with existing data
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
        practiceName: doctorProfile.practiceName || "",
        department: doctorProfile.department || "",
        hospitalAffiliations: doctorProfile.hospitalAffiliations || [],
        consultationFee: doctorProfile.consultationFee || 0,
        languagesSpoken: doctorProfile.languagesSpoken || [],
        bio: doctorProfile.bio || "",
        isAcceptingNewPatients: doctorProfile.isAcceptingNewPatients ?? true,
      });
    }
  }, [doctorProfile, form]);

  const onSubmit = async (data: DoctorProfileFormData) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save your profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createOrUpdateProfile({
        userId: session.user.id as any,
        ...data,
      });
      toast({
        title: "Profile saved successfully!",
        description: "Your doctor profile has been updated.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const currentLanguages = form.getValues("languagesSpoken") || [];
      form.setValue("languagesSpoken", [...currentLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    const currentLanguages = form.getValues("languagesSpoken") || [];
    form.setValue("languagesSpoken", currentLanguages.filter((_, i) => i !== index));
  };

  const addAffiliation = () => {
    if (newAffiliation.trim()) {
      const currentAffiliations = form.getValues("hospitalAffiliations") || [];
      form.setValue("hospitalAffiliations", [...currentAffiliations, newAffiliation.trim()]);
      setNewAffiliation("");
    }
  };

  const removeAffiliation = (index: number) => {
    const currentAffiliations = form.getValues("hospitalAffiliations") || [];
    form.setValue("hospitalAffiliations", currentAffiliations.filter((_, i) => i !== index));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      const currentSpecialties = form.getValues("secondarySpecialties") || [];
      form.setValue("secondarySpecialties", [...currentSpecialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    const currentSpecialties = form.getValues("secondarySpecialties") || [];
    form.setValue("secondarySpecialties", currentSpecialties.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      const currentCertifications = form.getValues("boardCertifications") || [];
      form.setValue("boardCertifications", [...currentCertifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    const currentCertifications = form.getValues("boardCertifications") || [];
    form.setValue("boardCertifications", currentCertifications.filter((_, i) => i !== index));
  };

  return (
    <Card className="border w-full h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctorProfile?.profileImageUrl} alt="Profile" />
            <AvatarFallback className="text-lg">
              {doctorProfile ?
                `${doctorProfile.firstName?.[0] || ""}${doctorProfile.lastName?.[0] || ""}` :
                session?.user.email?.charAt(0).toUpperCase() || "D"
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {doctorProfile ?
                `${doctorProfile.title || "Dr."} ${doctorProfile.firstName} ${doctorProfile.lastName}` :
                "Complete Your Doctor Profile"
              }
            </CardTitle>
            <CardDescription>
              {doctorProfile ?
                `${doctorProfile.primarySpecialty || "Medical Professional"} • Licensed since ${new Date(doctorProfile.createdAt).getFullYear()}` :
                "Set up your professional profile to get started"
              }
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-full h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full h-full">
            <Tabs defaultValue="personal" className="w-full h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="credentials" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
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
                              {titles.map((title) => (
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
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="doctor@hospital.com" {...field} />
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
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Bio & Languages</h3>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell patients about yourself, your approach to medicine, and your experience..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Languages */}
                  <div className="space-y-3">
                    <Label>Languages Spoken</Label>
                    <div className="flex flex-wrap gap-2">
                      {(form.watch("languagesSpoken") || []).map((language, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeLanguage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add language (e.g., English, Spanish)"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Credentials</h3>
                  
                  {/* License Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <Input placeholder="National Provider Identifier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DEA Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Drug Enforcement Administration" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Specialization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Specialization</h3>
                    <FormField
                      control={form.control}
                      name="primarySpecialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Specialty</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select primary specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specializations.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Secondary Specialties */}
                    <div className="space-y-3">
                      <Label>Secondary Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch("secondarySpecialties") || []).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {specialty}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeSpecialty(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add secondary specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" onClick={addSpecialty}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Board Certifications */}
                    <div className="space-y-3">
                      <Label>Board Certifications</Label>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch("boardCertifications") || []).map((cert, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {cert}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeCertification(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Select value={newCertification} onValueChange={setNewCertification}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add board certification" />
                          </SelectTrigger>
                          <SelectContent>
                            {boardCertifications.map((cert) => (
                              <SelectItem key={cert} value={cert}>
                                {cert}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Education & Experience</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="medicalSchool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical School</FormLabel>
                          <FormControl>
                            <Input placeholder="University/Institution name" {...field} />
                          </FormControl>
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
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="residency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residency</FormLabel>
                          <FormControl>
                            <Input placeholder="Residency program and institution" {...field} />
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
                          <FormLabel>Fellowship</FormLabel>
                          <FormControl>
                            <Input placeholder="Fellowship program and institution" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="practice" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Practice Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="practiceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Practice Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of your practice or clinic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Hospital Affiliations */}
                  <div className="space-y-3">
                    <Label>Hospital Affiliations</Label>
                    <div className="flex flex-wrap gap-2">
                      {(form.watch("hospitalAffiliations") || []).map((affiliation, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {affiliation}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeAffiliation(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add hospital or clinic affiliation"
                        value={newAffiliation}
                        onChange={(e) => setNewAffiliation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAffiliation())}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addAffiliation}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Patient Acceptance */}
                  <FormField
                    control={form.control}
                    name="isAcceptingNewPatients"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Accepting New Patients
                          </FormLabel>
                          <FormDescription>
                            Allow new patients to book appointments with you
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Your standard consultation fee per session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Save Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}