"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// API and Services
import { api } from "@/convex/_generated/api";
import { medicalRAGHooks } from "@/lib/services/medical-rag-hooks";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


// Validation and Types
import {
  treatmentFormSchema,
  defaultTreatmentFormValues,
  type TreatmentFormData,
} from "@/lib/validations/treatment";

// Local Components
import { NewMedicationManager, type MedicationManagerRef } from "./NewMedicationManager";
import { TreatmentPharmacySelector } from "./TreatmentPharmacySelector";
import { TreatmentSOAPNoteSelector } from "./TreatmentSOAPNoteSelector";
import CompactTreatmentTemplates from "@/components/treatment/compact-treatment-templates";

interface AddTreatmentFormProps {
  patientId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export const AddTreatmentForm: React.FC<AddTreatmentFormProps> = ({
  patientId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGoal, setCurrentGoal] = useState("");
  const medicationManagerRef = useRef<MedicationManagerRef>(null);

  // Authentication and doctor profile
  const { data: session } = useSession();
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get doctor-patient relationship with full patient and doctor details
  const doctorPatientRelation = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId: patientId as Id<"patients">
    } : "skip"
  );

  // Get full doctor-patient relationship details (includes patient and doctor objects)
  const doctorPatientDetails = useQuery(
    api.doctorPatients.getById,
    doctorPatientRelation?._id ? {
      doctorPatientId: doctorPatientRelation._id
    } : "skip"
  );

  // Mutations
  const createTreatmentPlan = useMutation(api.treatmentPlans.create);

  // Form setup with React Hook Form and Zod validation
  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      ...defaultTreatmentFormValues,
      medicationDetails: [], // Start with empty array
    },
  });

  // Goals management
  const addGoal = () => {
    if (currentGoal.trim()) {
      const currentGoals = form.getValues("goals") || [];
      form.setValue("goals", [...currentGoals, currentGoal.trim()]);
      setCurrentGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const currentGoals = form.getValues("goals") || [];
    form.setValue("goals", currentGoals.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleSubmit = async (data: TreatmentFormData) => {
    if (!doctorPatientRelation || !doctorProfile) {
      toast.error("Unable to create treatment: Missing doctor-patient relationship");
      return;
    }

    // Validate required treatment fields
    if (!data.title?.trim()) {
      toast.error("Treatment title is required");
      return;
    }

    if (!data.diagnosis?.trim()) {
      toast.error("Diagnosis is required");
      return;
    }

    if (!data.plan?.trim()) {
      toast.error("Treatment plan is required");
      return;
    }

    // Validate medication details (only if medications are provided)
    if (data.medicationDetails.length > 0) {
      const invalidMedications = data.medicationDetails.filter(
        med => !med.name.trim() || !med.strength.trim() || !med.frequency.trim()
      );

      if (invalidMedications.length > 0) {

        toast.error("Please complete all required medication fields (Name, Strength, Frequency)");
        return;
      }
    }

    setIsSubmitting(true);
    try {


      // Create treatment plan
      const treatmentPlanId = await createTreatmentPlan({
        doctorPatientId: doctorPatientRelation._id,
        soapNoteId: data.soapNoteId && data.soapNoteId !== "" ? data.soapNoteId as any : undefined,
        title: data.title,
        diagnosis: data.diagnosis,
        plan: data.plan,
        goals: data.goals,
        status: "active" as const,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0],
        medicationDetails: data.medicationDetails,
        pharmacyId: data.pharmacyId && data.pharmacyId !== "" ? data.pharmacyId as any : undefined,
      });

      // 🔥 Embed treatment plan into RAG system with patient name
      if (treatmentPlanId && doctorPatientDetails?.patient && doctorPatientDetails?.doctor) {
        const patientName = `${doctorPatientDetails.patient.firstName} ${doctorPatientDetails.patient.lastName}`;

        // Embed treatment plan
        medicalRAGHooks.onTreatmentPlanCreated({
          treatmentId: treatmentPlanId,
          doctorId: doctorPatientDetails.doctor._id,
          patientId: doctorPatientDetails.patient._id,
          patientName,
          appointmentId: undefined, // Could be linked to current appointment if available
          diagnosis: data.diagnosis,
          treatmentType: data.title, // Using title as treatment type
          description: data.plan,
          goals: data.goals,
          duration: data.endDate ? `${data.startDate.toLocaleDateString()} to ${data.endDate.toLocaleDateString()}` : undefined,
          followUpRequired: true, // Default to true for active treatment plans
          notes: undefined,
          createdAt: Date.now(),
        });

        // 🔥 Embed each medication into RAG system
        if (data.medicationDetails && data.medicationDetails.length > 0) {
          data.medicationDetails.forEach((medication, index) => {

            medicalRAGHooks.onMedicationPrescribed({
              medicationId: `${treatmentPlanId}_med_${index}`, // Generate unique ID
              doctorId: doctorPatientDetails.doctor._id,
              patientId: doctorPatientDetails.patient._id,
              patientName,
              appointmentId: undefined,
              medicationName: medication.name,
              dosage: `${medication.strength} ${medication.dosageForm}`,
              frequency: medication.frequency,
              duration: medication.duration || "As prescribed",
              instructions: medication.instructions,
              sideEffects: undefined, // Could be enhanced with medication database lookup
              interactions: undefined, // Could be enhanced with interaction checking
              notes: medication.genericName ? `Generic: ${medication.genericName}` : undefined,
              createdAt: Date.now(),
            });
          });
        }

        // 🔥 Embed each treatment goal into RAG system
        if (data.goals && data.goals.length > 0) {
          data.goals.forEach((goal, index) => {

            medicalRAGHooks.onMedicalGoalSet({
              goalId: `${treatmentPlanId}_goal_${index}`, // Generate unique ID
              doctorId: doctorPatientDetails.doctor._id,
              patientId: doctorPatientDetails.patient._id,
              patientName,
              appointmentId: undefined,
              goalType: "treatment_goal", // Categorize as treatment-related goal
              description: goal,
              targetValue: undefined, // Could be enhanced with specific target values
              currentValue: undefined, // Could be enhanced with baseline measurements
              targetDate: data.endDate?.getTime(), // Use treatment end date as target
              priority: "medium" as const, // Default priority
              status: "active" as const, // New goals are active
              notes: `Related to ${data.diagnosis} treatment plan`,
              createdAt: Date.now(),
            });
          });
        }
      }



      // Log to RAG system
      try {
        medicalRAGHooks.onTreatmentPlanCreated({
          treatmentId: treatmentPlanId,
          doctorId: doctorProfile._id,
          patientId: patientId,
          diagnosis: data.diagnosis,
          treatmentType: data.title,
          description: data.plan,
          goals: data.goals,
          duration: data.endDate ?
            `${data.startDate.toLocaleDateString()} to ${data.endDate.toLocaleDateString()}` :
            undefined,
          followUpRequired: true,
          notes: `Medications: ${data.medicationDetails.map(med => med.name).join(', ')}`,
          createdAt: Date.now(),
        });
      } catch (ragError) {

        // Don't fail the whole operation if RAG logging fails
      }

      toast.success("Treatment plan created successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Treatment form submission error:", error);

      // More specific error messages
      if (error instanceof Error) {
        toast.error(`Failed to create treatment plan: ${error.message}`);
      } else {
        toast.error("Failed to create treatment plan. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {!doctorProfile || !doctorPatientRelation ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Loading treatment form...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
              {/* Form Validation Summary */}
              {Object.keys(form.formState.errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Please correct the following errors:
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {Object.entries(form.formState.errors).map(([field, error]) => (
                        <li key={field} className="text-sm">
                          {field === 'medicationDetails' && Array.isArray(error)
                            ? `Medication details: Please complete all required fields`
                            : error?.message || `${field} is required`}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Treatment Templates Section */}
              <CompactTreatmentTemplates
                onSelectTemplate={(template) => {
                  // Auto-fill form with template data
                  form.setValue("title", template.name);
                  form.setValue("diagnosis", template.condition);
                  form.setValue("plan", template.description);
                  form.setValue("goals", template.goals);

                  // Add template medications using the ref
                  if (medicationManagerRef.current) {
                    medicationManagerRef.current.addMedicationsFromTemplate(template.medications);
                  }

                  toast.success(`Applied template: ${template.name}`);
                }}
              />

              {/* SOAP Note Selection Section */}
              <TreatmentSOAPNoteSelector control={form.control} patientId={patientId} />

              {/* Treatment Information Section */}
              <div className="border rounded-lg bg-card">
                <div className="p-4 pb-3 border-b">
                  <h2 className="font-medium">Treatment Information</h2>
                </div>
                <div className="p-4 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Treatment Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter treatment title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Diagnosis */}
                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter diagnosis"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Treatment Plan Description */}
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the detailed treatment plan..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Treatment Goals */}
                  <div className="space-y-3">
                    <FormLabel>Treatment Goals (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a treatment goal"
                        value={currentGoal}
                        onChange={(e) => setCurrentGoal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGoal();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGoal}
                        disabled={!currentGoal.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.watch("goals")?.length > 0 && (
                      <div className="space-y-2">
                        {form.watch("goals").map((goal, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span className="text-sm">{goal}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGoal(index)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Start Date */}
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
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date (Optional) */}
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
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return startDate ? date < startDate : false;
                                }}
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
              </div>

              {/* Medication Details Section */}
              <NewMedicationManager ref={medicationManagerRef} control={form.control} />

              {/* Pharmacy Selection Section */}
              <TreatmentPharmacySelector control={form.control} />

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !doctorPatientRelation}
                  onClick={() => {
                    console.log("Submit button clicked");
                    console.log("Form state:", form.formState);
                    console.log("Form values:", form.getValues());
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Treatment...
                    </>
                  ) : (
                    "Create Treatment"
                  )}
                </Button>
              </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
