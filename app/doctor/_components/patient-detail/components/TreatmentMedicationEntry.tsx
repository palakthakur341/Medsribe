"use client";

import React from "react";
import { useFieldArray, Control, useWatch } from "react-hook-form";
import { Trash2, Plus, Pill, CheckCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation and Types
import {
  frequencyOptions,
  durationOptions,
  dosageFormOptions,
  type TreatmentFormData,

} from "@/lib/validations/treatment";

interface TreatmentMedicationEntryProps {
  control: Control<TreatmentFormData>;
}

export const TreatmentMedicationEntry: React.FC<TreatmentMedicationEntryProps> = ({ control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicationDetails",
  });

  // Watch the medication details to show summary
  const watchedMedications = useWatch({
    control,
    name: "medicationDetails",
  });

  // Get completed medications for summary
  const completedMedications = watchedMedications?.filter(med =>
    med?.name && med?.strength && med?.frequency
  ) || [];

  // Get incomplete medications
  const incompleteMedications = watchedMedications?.filter(med =>
    !med?.name || !med?.strength || !med?.frequency
  ) || [];

  // Show detailed forms when there are incomplete medications or no medications at all
  const showDetailedForms = incompleteMedications.length > 0 || fields.length === 0;

  const addMedication = () => {
    append({
      name: "",
      genericName: "",
      strength: "",
      dosageForm: "tablet",
      quantity: "",
      frequency: "",
      duration: "",
      instructions: "",
      refills: 0,
    });
  };

  const removeMedication = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };





  // Auto-hide detailed forms when all medications are complete and there are completed ones
  // const shouldShowCompactView = completedMedications.length > 0 && incompleteMedications.length === 0;

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-medium">Medication Details</h2>
            {completedMedications.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  {completedMedications.length} medication{completedMedications.length !== 1 ? 's' : ''} added
                </span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedication}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Medication</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Added Medications Summary */}
      {completedMedications.length > 0 && (
        <div className="p-4 border-b bg-muted/50">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Added Medications:</h3>
          <div className="space-y-3">
            {completedMedications.map((med, index) => {
              // Find the actual field index for removal
              const fieldIndex = fields.findIndex((_field, fieldIdx) => {
                const watchedMed = watchedMedications?.[fieldIdx];
                return watchedMed?.name === med.name &&
                       watchedMed?.strength === med.strength &&
                       watchedMed?.frequency === med.frequency;
              });

              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border shadow-sm">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{med.name}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (fieldIndex !== -1) {
                            remove(fieldIndex);
                          }
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Strength</span>
                        <p className="font-medium text-foreground">{med.strength}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Form</span>
                        <p className="font-medium text-foreground">{med.dosageForm || 'Tablet'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</span>
                        <p className="font-medium text-foreground">{med.frequency}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Duration</span>
                        <p className="font-medium text-foreground">{med.duration || 'As needed'}</p>
                      </div>
                    </div>

                    {med.instructions && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Instructions</span>
                        <p className="text-sm text-foreground mt-1">{med.instructions}</p>
                      </div>
                    )}

                    {(med as any).notes && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Notes</span>
                        <p className="text-sm text-muted-foreground mt-1 italic">{(med as any).notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Detailed Forms Section - Only show when no completed medications */}
      {showDetailedForms && (
        <div className="p-4 space-y-4 sm:space-y-6">
          {fields.map((field, index) => (
          <div key={field.id} className="relative" id={`medication-${index}`}>
            <div className="border border-border rounded-lg p-3 sm:p-4 space-y-4">
              {/* Medication Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground text-sm sm:text-base">
                  Medication {index + 1}
                </h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    aria-label={`Remove medication ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Medication Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Medication Name */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter medication name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Generic Name */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.genericName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generic Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter generic name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Strength */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.strength`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10mg, 500mg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dosage Form */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.dosageForm`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage Form</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dosage form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dosageFormOptions.map((form) => (
                            <SelectItem key={form} value={form}>
                              {form.charAt(0).toUpperCase() + form.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dosage Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Quantity */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 30, 90"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Frequency */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.frequency`}
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
                          {frequencyOptions.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Refills */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.refills`}
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
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i} {i === 1 ? 'refill' : 'refills'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Duration */}
                <FormField
                  control={control}
                  name={`medicationDetails.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Instructions */}
              <FormField
                control={control}
                name={`medicationDetails.${index}.instructions`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Take with food, Avoid alcohol, Take as needed for pain, etc."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

          {/* Add Medication Button (Alternative placement) */}
          {fields.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                No medications added yet
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Medication
              </Button>
            </div>
          )}
        </div>
      )}


    </div>
  );
};
