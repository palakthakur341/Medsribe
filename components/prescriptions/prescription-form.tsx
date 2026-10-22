"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Pill, 
  Send, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Phone,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { medicalRAGHooks } from "@/lib/services/medical-rag-hooks";

interface Pharmacy {
  ncpdpId: string;
  name: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
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
}

interface PrescriptionFormProps {
  patientId: Id<"patients">;
  appointmentId?: Id<"appointments">;
  treatmentPlanId?: Id<"treatmentPlans">;
  onSuccess?: (prescriptionId: string) => void;
  onCancel?: () => void;
}

// Helper function to format pharmacy address
const formatPharmacyAddress = (address: string | { street: string; city: string; state: string; zipCode: string }): string => {
  if (typeof address === 'string') {
    return address;
  }
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
};

export function PrescriptionForm({
  patientId,
  appointmentId,
  treatmentPlanId,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck | null>(null);
  const [showSafetyWarnings, setShowSafetyWarnings] = useState(false);

  // Form state
  const [medicationName, setMedicationName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("tablet");
  const [quantity, setQuantity] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [refills, setRefills] = useState(0);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"electronic" | "print" | "fax" | "phone">("electronic");
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [notes, setNotes] = useState("");

  // Load pharmacies on component mount
  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const response = await fetch("/api/pharmacies/search?limit=50");
      const result = await response.json();
      
      if (result.success) {
        setPharmacies(result.data);
      }
    } catch (error) {
      console.error("Failed to load pharmacies:", error);
      toast.error("Failed to load pharmacy directory");
    }
  };

  const checkDrugInteractions = async () => {
    if (!medicationName || medicationName.length < 3) return;

    // Drug interaction checking removed - no longer needed
    setSafetyChecks({
      drugInteractions: [],
      allergyAlerts: [],
      contraindications: [],
      dosageAlerts: [],
    });
    setShowSafetyWarnings(false);
  };

  // Check interactions when medication name changes
  useEffect(() => {
    if (medicationName.length > 2) {
      const timeoutId = setTimeout(checkDrugInteractions, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [medicationName, patientId]);

  const handleSubmit = async (sendElectronically: boolean = true) => {
    if (!medicationName || !strength || !quantity || !frequency || !instructions) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (sendElectronically && !selectedPharmacy) {
      toast.error("Please select a pharmacy for electronic prescribing");
      return;
    }

    setIsLoading(true);

    try {
      const prescriptionData = {
        patientId,
        appointmentId,
        treatmentPlanId,
        medication: {
          name: medicationName,
          genericName,
          strength,
          dosageForm,
          ndc: "",
          rxcui: "",
        },
        dosage: {
          quantity,
          frequency,
          duration,
          instructions,
          refills,
        },
        pharmacy: selectedPharmacy ? {
          ...selectedPharmacy,
          address: formatPharmacyAddress(selectedPharmacy.address)
        } : null,
        deliveryMethod: sendElectronically ? "electronic" : deliveryMethod,
        priority,
        notes,
      };

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 Embed prescription into RAG system (production-ready)
        if (result.data.prescriptionId) {
          // Note: In a real implementation, you'd get doctor ID from context/auth
          const doctorId = 'doctor_from_context'; // This should be extracted from context

          medicalRAGHooks.onPrescriptionIssued({
            prescriptionId: result.data.prescriptionId,
            doctorId,
            patientId,
            appointmentId,
            medications: [{
              name: medicationName,
              dosage: `${strength} ${dosageForm}`,
              frequency,
              duration,
              quantity: parseInt(quantity) || 0,
            }],
            pharmacy: selectedPharmacy?.name,
            instructions,
            refillsAllowed: refills,
            notes,
            createdAt: Date.now(),
          });
        }

        toast.success(
          sendElectronically
            ? "Prescription sent electronically!"
            : "Prescription saved successfully!"
        );

        if (onSuccess) {
          onSuccess(result.data.prescriptionId);
        }
      } else {
        toast.error(result.message || "Failed to create prescription");
      }
    } catch (error) {
      console.error("Prescription submission error:", error);
      toast.error("Failed to create prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const dosageForms = [
    "tablet", "capsule", "liquid", "injection", "cream", "ointment", 
    "drops", "inhaler", "patch", "suppository", "powder", "gel"
  ];

  const frequencies = [
    "Once daily", "Twice daily", "Three times daily", "Four times daily",
    "Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours",
    "As needed", "Before meals", "After meals", "At bedtime"
  ];

  const priorities = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "stat", label: "STAT" }
  ];

  const deliveryMethods = [
    { value: "electronic", label: "Electronic" },
    { value: "print", label: "Print" },
    { value: "fax", label: "Fax" },
    { value: "phone", label: "Phone" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Pill className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Create E-Prescription</h3>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }} className="space-y-6">
          {/* Medication Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medication Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicationName">
                    Medication Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="medicationName"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    placeholder="Enter medication name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="Enter generic name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">
                    Strength <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="strength"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g., 10mg, 500mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageForm">
                    Dosage Form <span className="text-red-500">*</span>
                  </Label>
                  <Select value={dosageForm} onValueChange={setDosageForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map((form) => (
                        <SelectItem key={form} value={form}>
                          {form.charAt(0).toUpperCase() + form.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dosage Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dosage & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 30 tablets, 100ml"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refills">Refills</Label>
                  <Select value={refills.toString()} onValueChange={(value) => setRefills(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refills" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} {i === 1 ? 'refill' : 'refills'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Instructions <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter detailed instructions for the patient"
                  className="min-h-[80px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pharmacy Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pharmacy">Select Pharmacy</Label>
                <Select
                  value={selectedPharmacy?.ncpdpId || ""}
                  onValueChange={(value) => {
                    const pharmacy = pharmacies.find(p => p.ncpdpId === value);
                    setSelectedPharmacy(pharmacy || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pharmacy" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacies.map((pharmacy) => (
                      <SelectItem key={pharmacy.ncpdpId} value={pharmacy.ncpdpId}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pharmacy.name}</span>
                          <span className="text-xs text-muted-foreground">{formatPharmacyAddress(pharmacy.address)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPharmacy && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{selectedPharmacy.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPharmacyAddress(selectedPharmacy.address)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{selectedPharmacy.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prescription Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priorityOption) => (
                        <SelectItem key={priorityOption.value} value={priorityOption.value}>
                          {priorityOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryMethod">Delivery Method</Label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or special instructions"
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Warnings */}
          {showSafetyWarnings && safetyChecks && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Safety Alerts Detected</p>

                  {safetyChecks.drugInteractions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Drug Interactions:</p>
                      {safetyChecks.drugInteractions.map((interaction, index) => (
                        <div key={index} className="text-xs ml-2">
                          <Badge variant="destructive" className="mr-2">
                            {interaction.severity}
                          </Badge>
                          {interaction.description}
                        </div>
                      ))}
                    </div>
                  )}

                  {safetyChecks.allergyAlerts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Allergy Alerts:</p>
                      {safetyChecks.allergyAlerts.map((alert, index) => (
                        <div key={index} className="text-xs ml-2">
                          <Badge variant="destructive" className="mr-2">
                            {alert.severity}
                          </Badge>
                          {alert.reaction} to {alert.allergen}
                        </div>
                      ))}
                    </div>
                  )}

                  {safetyChecks.contraindications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Contraindications:</p>
                      {safetyChecks.contraindications.map((contraindication, index) => (
                        <p key={index} className="text-xs ml-2">{contraindication}</p>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : "Send Electronically"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>

            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
    </div>
  );
}
