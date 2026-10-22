"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { Building2, Save, Loader2, MapPin, Phone, Mail, FileText, Clock, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";

// Pharmacy profile validation schema
const pharmacyProfileSchema = z.object({
  name: z.string().min(2, "Pharmacy name must be at least 2 characters"),
  licenseNumber: z.string().min(1, "License number is required"),
  deaNumber: z.string().optional(),
  npiNumber: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  fax: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  }),
  chainName: z.string().optional(),
  pharmacistInCharge: z.string().optional(),
  hours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
  services: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

type PharmacyProfileFormData = z.infer<typeof pharmacyProfileSchema>;

interface PharmacyProfileFormProps {
  pharmacyProfile?: any;
  userId: string;
}

export function PharmacyProfileForm({ pharmacyProfile, userId }: PharmacyProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mutation for updating pharmacy profile
  const updatePharmacy = useMutation(api.pharmacies.updatePharmacy);

  const form = useForm<PharmacyProfileFormData>({
    resolver: zodResolver(pharmacyProfileSchema),
    defaultValues: {
      name: pharmacyProfile?.name || "",
      licenseNumber: pharmacyProfile?.licenseNumber || "",
      deaNumber: pharmacyProfile?.deaNumber || "",
      npiNumber: pharmacyProfile?.npiNumber || "",
      phone: pharmacyProfile?.phone || "",
      fax: pharmacyProfile?.fax || "",
      email: pharmacyProfile?.email || "",
      address: {
        street: pharmacyProfile?.address?.street || "",
        city: pharmacyProfile?.address?.city || "",
        state: pharmacyProfile?.address?.state || "",
        zipCode: pharmacyProfile?.address?.zipCode || "",
      },
      chainName: pharmacyProfile?.chainName || "",
      pharmacistInCharge: pharmacyProfile?.pharmacistInCharge || "",
      hours: {
        monday: pharmacyProfile?.hours?.monday || "",
        tuesday: pharmacyProfile?.hours?.tuesday || "",
        wednesday: pharmacyProfile?.hours?.wednesday || "",
        thursday: pharmacyProfile?.hours?.thursday || "",
        friday: pharmacyProfile?.hours?.friday || "",
        saturday: pharmacyProfile?.hours?.saturday || "",
        sunday: pharmacyProfile?.hours?.sunday || "",
      },
      services: pharmacyProfile?.services || [],
      isActive: pharmacyProfile?.isActive ?? true,
    },
  });

  const onSubmit = async (data: PharmacyProfileFormData) => {
    setIsLoading(true);

    try {
      if (pharmacyProfile?._id) {
        // Update existing pharmacy profile
        await updatePharmacy({
          pharmacyId: pharmacyProfile._id,
          ...data,
        });
        
        toast({
          title: "Profile updated successfully!",
          description: "Your pharmacy profile has been updated.",
        });
      } else {
        // Create new pharmacy profile
        await fetch("/api/pharmacy/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...data,
            ncpdpId: `TEMP_${Date.now()}`, // Temporary NCPDP ID
            isVerified: false,
          }),
        });

        toast({
          title: "Profile created successfully!",
          description: "Your pharmacy profile has been created and is pending verification.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const commonServices = [
    "24 Hour Service",
    "Drive-Thru",
    "Delivery",
    "Compounding",
    "Immunizations",
    "Medication Therapy Management",
    "Specialty Pharmacy",
    "Durable Medical Equipment",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Pharmacy Profile</CardTitle>
            <CardDescription>
              Manage your pharmacy information and settings
            </CardDescription>
          </div>
          {pharmacyProfile?.isVerified && (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Verified
            </Badge>
          )}
        </CardHeader>
        <CardContent className="w-full h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full h-full">
              <Tabs defaultValue="basic" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger value="operations" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Operations
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pharmacy name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chainName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chain Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CVS, Walgreens (if applicable)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pharmacistInCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacist in Charge</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pharmacist in charge name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable to accept new prescriptions
                          </div>
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
                </TabsContent>

                {/* Contact Information */}
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4568" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="pharmacy@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </h3>
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Professional Information */}
                <TabsContent value="professional" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy License Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter license number" {...field} />
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
                            <Input placeholder="Enter DEA number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                </TabsContent>

                {/* Operations */}
                <TabsContent value="operations" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Operating Hours
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name={`hours.${day}` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">{day}</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 9:00 AM - 9:00 PM or Closed" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {pharmacyProfile ? "Update Profile" : "Create Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
