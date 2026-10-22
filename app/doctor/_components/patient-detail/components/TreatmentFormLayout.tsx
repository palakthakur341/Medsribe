"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileText,
  Pill,
  Plus,
  Trash2,
  Target,
  CalendarIcon,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { medicalRAGHooks } from "@/lib/services/medical-rag-hooks";

import TreatmentTemplates from "@/components/treatment/treatment-templates";
import PatientHistoryInsights from "@/components/patient/patient-history-insights";
import { useSession } from "next-auth/react";
import type { Id } from "@/convex/_generated/dataModel";

// Enhanced Zod Schemas
const treatmentFormSchema = z.object({
  title: z.string().min(1, "Treatment title is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  plan: z.string().min(1, "Treatment plan is required"),
  goals: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date().optional(),
  selectedSOAP: z.string().optional(),
  notes: z.string().optional(),
});

const prescriptionSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  strength: z.string().min(1, "Strength is required"),
  dosageForm: z.string().min(1, "Dosage form is required"),
  frequency: z.string().min(1, "Frequency is required"),
  instructions: z.string().min(1, "Instructions are required"),
  quantity: z.string().min(1, "Quantity is required"),
  refills: z.number().min(0).max(11),
  duration: z.string().optional(),
  pharmacyId: z.string().min(1, "Please select a pharmacy"),
  deliveryMethod: z.enum(["pickup", "delivery"]), // UI level - will be mapped to database values
  urgency: z.enum(["routine", "urgent", "stat"]),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    instructions: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

type TreatmentFormData = z.infer<typeof treatmentFormSchema>;
type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

// Enhanced Types
interface Prescription extends PrescriptionFormData {
  id: string;
  type: 'prescription';
  pharmacyName?: string;
  safetyChecks?: SafetyCheck;
  prescriptionStatus?: 'draft' | 'pending' | 'sent' | 'filled' | 'error';
}

interface SafetyCheck {
  drugInteractions: Array<{
    severity: "minor" | "moderate" | "major";
    description: string;
    interactingMedication: string;
  }>;
  allergyAlerts: Array<{
    allergen: string;
    severity: string;
    reaction: string;
  }>;
  contraindications: string[];
  dosageAlerts: string[];
  hasWarnings: boolean;
}

interface PharmacyOption {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  chainName?: string;
  services: string[];
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
}

interface SOAPNote {
  _id: string;
  id: string; // For backward compatibility
  title: string;
  date: string;
  preview: string;
  type: "referral" | "shared";
}

type MedicationItem = Prescription;

interface TreatmentFormLayoutProps {
  patientId: string;
  onSuccess?: () => void;
  onSubmit?: (data: TreatmentFormData, prescriptions: MedicationItem[]) => void;
  onCancel: () => void;
}

export const TreatmentFormLayout: React.FC<TreatmentFormLayoutProps> = ({
  patientId,
  onSuccess,
  onSubmit,
  onCancel,
}) => {
  // Authentication and doctor profile
  const { data: session } = useSession();
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // React Hook Form
  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      title: "",
      diagnosis: "",
      plan: "",
      goals: [],
      startDate: new Date(),
      endDate: undefined,
      selectedSOAP: undefined,
      notes: "",
    },
  });

  // State management
  const [prescriptions, setPrescriptions] = useState<MedicationItem[]>([]);
  const [currentGoal, setCurrentGoal] = useState("");

  // Load pharmacies using the correct API
  const pharmacies = useQuery(api.pharmacies.getActivePharmaciesForPrescription, {
    zipCode: undefined, // Could be enhanced to use patient's zip code
    limit: 50,
  });

  // Mutations for creating prescriptions and treatment plans
  const createPrescription = useMutation(api.prescriptions.create);
  const createTreatmentPlan = useMutation(api.treatmentPlans.create);

  // Get doctor-patient relationship
  const currentDoctorPatient = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId: patientId as Id<"patients">
    } : "skip"
  );

  // Load SOAP notes for patient
  const soapNotes = useQuery(api.soapNotes.getByPatientId, {
    patientId: patientId as Id<"patients">,
  }) || [];

  // Transform SOAP notes to extract meaningful data for treatment form
  const transformedSoapNotes: SOAPNote[] = soapNotes.map(note => {
    // Extract title from SOAP data or use default
    const title = note.data?.soap_notes?.soap_notes?.subjective?.chief_complaint ||
                  note.data?.specialty_detection?.specialty ||
                  `SOAP Note ${new Date(note.timestamp).toLocaleDateString()}`;

    // Extract preview from assessment or subjective
    const assessmentData = note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis;
    const subjectiveData = note.data?.soap_notes?.soap_notes?.subjective?.history_present_illness;

    let preview = "SOAP note data available";
    if (typeof assessmentData === 'string') {
      preview = assessmentData;
    } else if (typeof assessmentData === 'object' && assessmentData?.diagnosis) {
      preview = assessmentData.diagnosis;
    } else if (typeof subjectiveData === 'string') {
      preview = subjectiveData.substring(0, 100);
    }

    // Determine type based on sharing status (simplified for now)
    const type = "shared" as const; // Could be enhanced to check sharing status

    return {
      _id: note._id,
      id: note._id,
      title,
      date: new Date(note.timestamp).toLocaleDateString(),
      preview,
      type,
    };
  });

  // Enhanced Handlers
  const handleAddGoal = () => {
    if (currentGoal.trim()) {
      const currentGoals = form.getValues("goals");
      form.setValue("goals", [...currentGoals, currentGoal.trim()]);
      setCurrentGoal("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    const currentGoals = form.getValues("goals");
    form.setValue("goals", currentGoals.filter((_, i) => i !== index));
  };

  const handleAddPrescription = useCallback(async (item: MedicationItem) => {
    try {
      // Validate doctor profile is loaded
      if (!doctorProfile?._id) {
        toast.error("Doctor profile not loaded. Please try again.");
        return;
      }

      // Add safety checks before adding prescription
      // const safetyChecks = await checkDrugSafety(item);

      // Find selected pharmacy details
      const selectedPharmacy = pharmacies?.find(p => p._id === item.pharmacyId);

      // Create prescription in database
      const prescriptionId = await createPrescription({
        patientId: patientId as Id<"patients">,
        doctorId: doctorProfile._id as Id<"doctors">,
        medication: {
          name: item.name,
          genericName: item.genericName,
          strength: item.strength,
          dosageForm: item.dosageForm,
          ndc: undefined,
          rxcui: undefined,
        },
        dosage: {
          quantity: item.quantity,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || "",
          refills: item.refills,
        },
        pharmacy: selectedPharmacy ? {
          ncpdpId: selectedPharmacy._id, // Using _id as ncpdpId for now
          name: selectedPharmacy.name,
          address: `${selectedPharmacy.address.street}, ${selectedPharmacy.address.city}, ${selectedPharmacy.address.state} ${selectedPharmacy.address.zipCode}`,
          phone: selectedPharmacy.phone,
        } : undefined,
        deliveryMethod: item.deliveryMethod === "pickup" ? "print" :
                       item.deliveryMethod === "delivery" ? "electronic" :
                       "electronic",
        priority: item.urgency as "routine" | "urgent" | "stat",
        notes: item.notes,
      });

      const prescriptionWithSafety = {
        ...item,
        id: prescriptionId,
        // safetyChecks,
        prescriptionStatus: 'pending' as const,
        pharmacyName: selectedPharmacy?.name,
      };

      setPrescriptions(prev => [...prev, prescriptionWithSafety]);

      // Log prescription to RAG system
      medicalRAGHooks.onPrescriptionIssued({
        prescriptionId,
        doctorId: doctorProfile._id,
        patientId,
        medications: [{
          name: item.name,
          dosage: `${item.strength} ${item.dosageForm}`,
          frequency: item.frequency,
          duration: item.duration || '30 days',
          quantity: parseInt(item.quantity) || 0,
        }],
        pharmacy: selectedPharmacy?.name,
        instructions: item.instructions,
        refillsAllowed: item.refills,
        notes: item.notes,
        createdAt: Date.now(),
      });

      // Show safety warnings if any
      // if (safetyChecks.hasWarnings) {
      //   toast.warning("Safety alerts detected for this prescription. Please review.");
      // } else {
        toast.success("Prescription created successfully");
      // }
    } catch (error) {
      console.error("Error adding prescription:", error);
      toast.error("Failed to create prescription");
    }
  }, [patientId, pharmacies, createPrescription, doctorProfile]);

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(item => item.id !== id));
    toast.success("Prescription removed");
  };

  const handleFormSubmit = async (data: TreatmentFormData) => {
    try {
      // Validate doctor profile is loaded
      if (!doctorProfile?._id) {
        toast.error("Doctor profile not loaded. Please try again.");
        return;
      }

      // Validate doctor-patient relationship exists
      if (!currentDoctorPatient?._id) {
        toast.error("Doctor-patient relationship not found. Please try again.");
        return;
      }

      // Validate all prescriptions have safety checks
      const prescriptionsWithoutSafety = prescriptions.filter(p => !p.safetyChecks);
      if (prescriptionsWithoutSafety.length > 0) {
        toast.error("Please complete safety checks for all prescriptions");
        return;
      }

      // Create treatment plan in database
      const treatmentPlanId = await createTreatmentPlan({
        doctorPatientId: currentDoctorPatient._id as Id<"doctorPatients">,
        soapNoteId: data.selectedSOAP && data.selectedSOAP !== "none" ? data.selectedSOAP as Id<"soapNotes"> : undefined,
        title: data.title,
        diagnosis: data.diagnosis,
        plan: data.plan,
        goals: data.goals,
        status: "active" as const,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0],
      });

      // Submit treatment with prescriptions (for parent component)
      if (onSubmit) {
        onSubmit(data, prescriptions);
      }

      // Log to RAG system
      medicalRAGHooks.onTreatmentPlanCreated({
        treatmentId: treatmentPlanId,
        doctorId: doctorProfile._id,
        patientId,
        diagnosis: data.diagnosis,
        treatmentType: data.title,
        description: data.plan,
        goals: data.goals,
        duration: data.endDate ? `${data.startDate.toLocaleDateString()} to ${data.endDate.toLocaleDateString()}` : undefined,
        followUpRequired: true,
        notes: data.notes,
        createdAt: Date.now(),
      });

      toast.success("Treatment plan created successfully");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Error submitting treatment:", error);
      toast.error("Failed to create treatment");
    }
  };



  return (
    <div className="h-full">
      {/* Three Column Layout - Full Space */}
      <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* First Column - Treatment Templates */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Treatment Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4">
            <TreatmentTemplates
              onSelectTemplate={(template) => {
                // Auto-fill form with template data
                form.setValue("title", template.name);
                form.setValue("diagnosis", template.condition);
                form.setValue("plan", template.description);
                form.setValue("goals", template.goals);

                // Add template medications to prescriptions
                const templateMedications = template.medications.map((med, index) => ({
                  id: `template-${index}`,
                  name: med.name,
                  strength: med.dosage,
                  frequency: med.frequency,
                  instructions: med.instructions,
                  duration: med.duration,
                  type: 'prescription' as const,
                  quantity: "30",
                  refills: 0,
                  dosageForm: "tablet",
                  pharmacyId: "",
                  pharmacyName: "",
                  deliveryMethod: "pickup" as const,
                  urgency: "routine" as const,
                  notes: `From template: ${template.name}`,
                }));

                setPrescriptions(prev => [...prev, ...templateMedications]);
                toast.success(`Applied template: ${template.name}`);
              }}
            />

            {/* Patient History Insights */}
            <div className="mt-4 pt-4 border-t">
              <PatientHistoryInsights
                patientId={patientId as any}
                onInsightSelect={(insight) => {
                  // Auto-apply insights to form
                  if (insight.type === "condition_trend" && insight.data.condition) {
                    form.setValue("diagnosis", insight.data.condition);
                  }
                  toast.info(`Applied insight: ${insight.title}`);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Second Column - Treatment Details */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Treatment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-2">
                    {/* SOAP Note Selection */}
                    <FormField
                      control={form.control}
                      name="selectedSOAP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Based on SOAP Note (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a SOAP note" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No SOAP note</SelectItem>
                              {transformedSoapNotes.map((note) => (
                                <SelectItem key={note.id} value={note.id}>
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{note.title}</span>
                                      <Badge variant={note.type === 'referral' ? 'default' : 'secondary'} className="text-xs">
                                        {note.type}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{note.date}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Hypertension Management" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Diagnosis</FormLabel>
                            <FormControl>
                              <Input placeholder="Primary diagnosis" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment Plan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed treatment plan and approach..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Goals */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">Treatment Goals</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a treatment goal..."
                          value={currentGoal}
                          onChange={(e) => setCurrentGoal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                        />
                        <Button type="button" onClick={handleAddGoal} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {form.watch("goals").length > 0 && (
                        <div className="space-y-2">
                          {form.watch("goals").map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <span className="flex-1 text-sm">{goal}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveGoal(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Create Treatment
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Third Column - Prescriptions */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4 space-y-4">
            <EnhancedPrescriptionForm
              onAdd={handleAddPrescription}
              pharmacies={pharmacies || []}
              patientId={patientId}
              isLoading={pharmacies === undefined}
            />


          </CardContent>
        </Card>

        {/* Fourth Column - Added Prescriptions */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Added Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-4">
            <ScrollArea className="h-full">
              <div className="pr-2">
                {prescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Prescriptions Added</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                      Add prescriptions from the middle column to see them listed here.
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Total: 0 prescriptions
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header with counts */}
                    <div className="flex items-center justify-between pb-3 border-b">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {prescriptions.length} Prescriptions
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Total: {prescriptions.length}
                      </Badge>
                    </div>

                    {/* Items list */}
                    <div className="space-y-3">
                      {prescriptions.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-base">{item.name}</h4>
                                <Badge variant="default" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Prescription
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Strength:</span> {item.strength} {item.dosageForm}
                                  {item.frequency && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="font-medium">Frequency:</span> {item.frequency}
                                    </>
                                  )}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Quantity:</span> {item.quantity}
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">Refills:</span> {item.refills}
                                </p>

                                {item.pharmacyName && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Pharmacy:</span> {item.pharmacyName}
                                  </p>
                                )}

                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Delivery:</span> {item.deliveryMethod}
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">Urgency:</span> {item.urgency}
                                </p>

                                {item.instructions && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    <span className="font-medium">Instructions:</span> {item.instructions}
                                  </p>
                                )}

                                {/* Safety Check Indicators */}
                                {item.safetyChecks?.hasWarnings && (
                                  <div className="flex items-center gap-1 text-amber-600 mt-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-xs">Safety alerts present</span>
                                  </div>
                                )}

                                {/* Prescription Status */}
                                <div className="flex items-center gap-1 mt-2">
                                  {item.prescriptionStatus === 'draft' && (
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-2 w-2 mr-1" />
                                      Draft
                                    </Badge>
                                  )}
                                  {item.prescriptionStatus === 'sent' && (
                                    <Badge variant="default" className="text-xs">
                                      <CheckCircle className="h-2 w-2 mr-1" />
                                      Sent
                                    </Badge>
                                  )}
                                  {item.prescriptionStatus === 'error' && (
                                    <Badge variant="destructive" className="text-xs">
                                      <XCircle className="h-2 w-2 mr-1" />
                                      Error
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePrescription(item.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



// Enhanced Prescription Form Component
interface EnhancedPrescriptionFormProps {
  onAdd: (item: MedicationItem) => void;
  pharmacies: PharmacyOption[];
  patientId: string;
  isLoading: boolean;
}

const EnhancedPrescriptionForm: React.FC<EnhancedPrescriptionFormProps> = ({
  onAdd,
  pharmacies,
  patientId: _patientId,
  isLoading: _isLoading
}) => {

  const prescriptionForm = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      name: "",
      genericName: "",
      strength: "",
      dosageForm: "tablet",
      frequency: "",
      instructions: "",
      quantity: "",
      refills: 0,
      duration: "",
      pharmacyId: "",
      deliveryMethod: "pickup",
      urgency: "routine",
      deliveryAddress: undefined,
      notes: "",
    },
  });

  const watchDeliveryMethod = prescriptionForm.watch("deliveryMethod");
  const watchPharmacyId = prescriptionForm.watch("pharmacyId");
  const watchMedicationName = prescriptionForm.watch("name");
  const selectedPharmacy = pharmacies.find(p => p._id === watchPharmacyId);

  // Filter pharmacies based on search
  // useEffect(() => {
  //   if (!pharmacySearch.trim()) {
  //     setFilteredPharmacies(pharmacies);
  //   } else {
  //     const filtered = pharmacies.filter(pharmacy =>
  //       pharmacy.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
  //       pharmacy.chainName?.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
  //       pharmacy.address.city.toLowerCase().includes(pharmacySearch.toLowerCase())
  //     );
  //     setFilteredPharmacies(filtered);
  //   }
  // }, [pharmacySearch, pharmacies]);

  // Drug name suggestions (could be enhanced with actual drug database)
  useEffect(() => {
    if (watchMedicationName && watchMedicationName.length > 2) {
      // Mock drug suggestions - replace with actual drug database API
      const mockSuggestions = [
        "Lisinopril", "Metformin", "Amlodipine", "Metoprolol", "Omeprazole",
        "Simvastatin", "Losartan", "Albuterol", "Gabapentin", "Sertraline"
      ].filter(drug =>
        drug.toLowerCase().includes(watchMedicationName.toLowerCase())
      );
      // setDrugSuggestions(mockSuggestions);
    } else {
      // setDrugSuggestions([]);
    }
  }, [watchMedicationName]);

  const handleSubmit = (data: PrescriptionFormData) => {
    const pharmacyName = selectedPharmacy?.name || "";

    onAdd({
      id: "",
      ...data,
      type: 'prescription',
      pharmacyName,
    });
    prescriptionForm.reset();
  };

  return (
    <Form {...prescriptionForm}>
      <form onSubmit={prescriptionForm.handleSubmit(handleSubmit)} className="space-y-4">
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-2">
            {/* Medication Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medication Details
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={prescriptionForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lisinopril" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={prescriptionForm.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={prescriptionForm.control}
                  name="dosageForm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage Form</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="liquid">Liquid</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="cream">Cream</SelectItem>
                          <SelectItem value="ointment">Ointment</SelectItem>
                          <SelectItem value="inhaler">Inhaler</SelectItem>
                          <SelectItem value="patch">Patch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={prescriptionForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30 tablets" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={prescriptionForm.control}
                  name="refills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refills</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select refills" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 refills</SelectItem>
                          <SelectItem value="1">1 refill</SelectItem>
                          <SelectItem value="2">2 refills</SelectItem>
                          <SelectItem value="3">3 refills</SelectItem>
                          <SelectItem value="5">5 refills</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={prescriptionForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={prescriptionForm.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special instructions..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pharmacy Selection */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pharmacy Selection
              </h4>

              <FormField
                control={prescriptionForm.control}
                name="pharmacyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Pharmacy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a pharmacy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pharmacies.map((pharmacy) => (
                          <SelectItem key={pharmacy._id} value={pharmacy._id}>
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{pharmacy.name}</span>
                                {pharmacy.chainName && (
                                  <Badge variant="outline" className="text-xs">
                                    {pharmacy.chainName}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {pharmacy.address.street}, {pharmacy.address.city}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                {pharmacy.deliveryAvailable && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Truck className="h-2 w-2 mr-1" />
                                    Delivery
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-2 w-2 mr-1" />
                                  Pickup
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Method */}
              {selectedPharmacy && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={prescriptionForm.control}
                    name="deliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pickup">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Pickup
                              </div>
                            </SelectItem>
                            {selectedPharmacy.deliveryAvailable && (
                              <SelectItem value="delivery">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-3 w-3" />
                                  Delivery
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={prescriptionForm.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="stat">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Delivery Address (if delivery selected) */}
              {watchDeliveryMethod === "delivery" && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <h5 className="font-medium text-sm">Delivery Address</h5>

                  <FormField
                    control={prescriptionForm.control}
                    name="deliveryAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={prescriptionForm.control}
                      name="deliveryAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={prescriptionForm.control}
                      name="deliveryAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={prescriptionForm.control}
                    name="deliveryAddress.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={prescriptionForm.control}
                    name="deliveryAddress.instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Special delivery instructions..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </Button>
      </form>
    </Form>
  );
};
