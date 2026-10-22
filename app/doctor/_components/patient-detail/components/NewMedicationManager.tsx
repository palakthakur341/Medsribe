"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pill,
  Trash2,
  Edit,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface MedicationItem {
  name: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  quantity: string;
  frequency: string;
  duration: string;
  instructions: string;
  refills: number;
}

interface NewMedicationManagerProps {
  control: Control<any>;
}

export interface MedicationManagerRef {
  addMedicationsFromTemplate: (templateMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>) => void;
}

export const NewMedicationManager = forwardRef<MedicationManagerRef, NewMedicationManagerProps>(
  ({ control }, ref) => {
    const { fields, append, remove, update } = useFieldArray({
      control,
      name: "medicationDetails",
    });

    useImperativeHandle(ref, () => ({
      addMedicationsFromTemplate: (templateMedications) => {
        templateMedications.forEach((med) => {
          append({
            name: med.name,
            genericName: "",
            strength: med.dosage,
            dosageForm: "tablet",
            quantity: "30",
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
            refills: 0,
          });
        });
      },
    }));

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentMedication, setCurrentMedication] = useState<MedicationItem>({
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

  const resetForm = () => {
    setCurrentMedication({
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
    setEditingIndex(null);
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEdit = (index: number) => {
    const medication = fields[index] as unknown as MedicationItem;
    setCurrentMedication(medication);
    setEditingIndex(index);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentMedication.name || !currentMedication.strength || !currentMedication.frequency) {
      toast.error("Please fill in required fields: Name, Strength, and Frequency");
      return;
    }

    if (editingIndex !== null) {
      // Update existing medication
      update(editingIndex, currentMedication);
      toast.success("Medication updated successfully");
    } else {
      // Add new medication
      append(currentMedication);
      toast.success("Medication added successfully");
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleRemove = (index: number) => {
    remove(index);
    toast.success("Medication removed");
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const isFormValid = currentMedication.name && currentMedication.strength && currentMedication.frequency;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Medications</CardTitle>
            {fields.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {fields.length} medication{fields.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? 'Edit Medication' : 'Add New Medication'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the medication details below. Required fields are marked with *.
                </DialogDescription>
              </DialogHeader>

              <Card className="border-0 shadow-none">
                <CardContent className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Medication Name *</Label>
                        <Input
                          id="name"
                          value={currentMedication.name}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lisinopril"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="genericName" className="text-sm font-medium">Generic Name</Label>
                        <Input
                          id="genericName"
                          value={currentMedication.genericName}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, genericName: e.target.value }))}
                          placeholder="e.g., Lisinopril"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dosage Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Dosage Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="strength" className="text-sm font-medium">Strength *</Label>
                        <Input
                          id="strength"
                          value={currentMedication.strength}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, strength: e.target.value }))}
                          placeholder="e.g., 10mg"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dosageForm" className="text-sm font-medium">Dosage Form</Label>
                        <Select
                          value={currentMedication.dosageForm}
                          onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, dosageForm: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                        <Input
                          id="quantity"
                          value={currentMedication.quantity}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="e.g., 30"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Administration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-sm font-medium">Frequency *</Label>
                        <Select
                          value={currentMedication.frequency}
                          onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Once daily">Once daily</SelectItem>
                            <SelectItem value="Twice daily">Twice daily</SelectItem>
                            <SelectItem value="Three times daily">Three times daily</SelectItem>
                            <SelectItem value="Four times daily">Four times daily</SelectItem>
                            <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                            <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                            <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                            <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                            <SelectItem value="As needed">As needed</SelectItem>
                            <SelectItem value="Before meals">Before meals</SelectItem>
                            <SelectItem value="After meals">After meals</SelectItem>
                            <SelectItem value="At bedtime">At bedtime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                        <Input
                          id="duration"
                          value={currentMedication.duration}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 30 days, Ongoing"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Instructions</h3>
                    <div className="space-y-2">
                      <Label htmlFor="instructions" className="text-sm font-medium">Special Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={currentMedication.instructions}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Special instructions for taking this medication..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Refills */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Prescription Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="refills" className="text-sm font-medium">Number of Refills</Label>
                      <Select
                        value={currentMedication.refills.toString()}
                        onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, refills: parseInt(value) }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} refill{num !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dialog Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="outline" onClick={handleCancel} className="h-10 px-6">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!isFormValid} className="h-10 px-6">
                  {editingIndex !== null ? 'Update' : 'Add'} Medication
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No medications added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add medications to include them in this treatment plan.
            </p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Medication
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const medication = field as unknown as MedicationItem;
              return (
                <div key={field.id} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{medication.name}</h4>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(index)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(index)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Strength</span>
                        <p className="font-medium">{medication.strength}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Form</span>
                        <p className="font-medium">{medication.dosageForm}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</span>
                        <p className="font-medium">{medication.frequency}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Duration</span>
                        <p className="font-medium">{medication.duration || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {medication.instructions && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Instructions</span>
                        <p className="text-sm text-foreground mt-1">{medication.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

NewMedicationManager.displayName = "NewMedicationManager";

export default NewMedicationManager;
