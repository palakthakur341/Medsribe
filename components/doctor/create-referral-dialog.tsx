"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Stethoscope, 
  CheckCircle, 
  Loader2,
  UserCheck,
  Star,
  AlertTriangle,
  Clock
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soapNoteId?: string;
  patientId: string;
  fromDoctorId: string;
  onSuccess?: () => void;
}

const REFERRAL_TYPES = [
  { value: "consultation", label: "Consultation", description: "One-time consultation" },
  { value: "co_management", label: "Co-management", description: "Shared care" },
  { value: "transfer_care", label: "Transfer Care", description: "Complete transfer" },
  { value: "second_opinion", label: "Second Opinion", description: "Expert opinion only" },
  { value: "procedure", label: "Procedure", description: "Specific procedure" },
];

const URGENCY_LEVELS = [
  { value: "routine", label: "Routine", color: "bg-green-100 text-green-800" },
  { value: "urgent", label: "Urgent", color: "bg-yellow-100 text-yellow-800" },
  { value: "stat", label: "STAT", color: "bg-red-100 text-red-800" },
];

const SPECIALTIES = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
  "Hematology", "Nephrology", "Neurology", "Oncology", "Orthopedics",
  "Psychiatry", "Pulmonology", "Rheumatology", "Urology", "Other"
];

export function CreateReferralDialog({ 
  open, 
  onOpenChange, 
  soapNoteId,
  patientId,
  fromDoctorId,
  onSuccess 
}: CreateReferralDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [referralType, setReferralType] = useState<string>("");
  const [specialtyRequired, setSpecialtyRequired] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("routine");
  const [reasonForReferral, setReasonForReferral] = useState("");
  const [clinicalQuestion, setClinicalQuestion] = useState("");
  const [relevantHistory, setRelevantHistory] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [workupCompleted, setWorkupCompleted] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isOpenReferral, setIsOpenReferral] = useState(false);

  // Get all doctors except the current doctor for referral
  const doctors = useQuery(
    api.doctors.getAll,
    { excludeDoctorId: fromDoctorId as any }
  );
  
  // Create referral mutation
  const createReferral = useMutation(api.referrals.create);

  // Filter doctors by specialty and search term
  const filteredDoctors = doctors?.filter(doctor => {
    // Exclude the current doctor (additional safety check)
    if (doctor._id === fromDoctorId) return false;

    const matchesSearch = searchTerm === "" ||
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.primarySpecialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.secondarySpecialties?.some(spec =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      doctor.hospitalAffiliations?.some(hospital =>
        hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSpecialty = !specialtyRequired ||
      doctor.primarySpecialty === specialtyRequired ||
      doctor.secondarySpecialties?.includes(specialtyRequired);

    return matchesSearch && matchesSpecialty;
  })?.sort((a, b) => {
    // Sort by specialty match first, then by name
    const aSpecialtyMatch = a.primarySpecialty === specialtyRequired ? 1 : 0;
    const bSpecialtyMatch = b.primarySpecialty === specialtyRequired ? 1 : 0;

    if (aSpecialtyMatch !== bSpecialtyMatch) {
      return bSpecialtyMatch - aSpecialtyMatch;
    }

    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  const handleCreate = async () => {
    if (!referralType || !specialtyRequired || !reasonForReferral.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isOpenReferral && !selectedDoctorId) {
      toast.error("Please select a doctor or choose open referral");
      return;
    }

    setIsCreating(true);
    try {
      await createReferral({
        fromDoctorId: fromDoctorId as any,
        toDoctorId: isOpenReferral ? undefined : (selectedDoctorId as any),
        patientId: patientId as any,
        soapNoteId: soapNoteId ? (soapNoteId as any) : undefined,
        referralType: referralType as any,
        specialtyRequired,
        urgency: urgency as any,
        reasonForReferral,
        clinicalQuestion: clinicalQuestion.trim() || undefined,
        relevantHistory: relevantHistory.trim() || undefined,
        currentMedications: currentMedications.trim() || undefined,
        workupCompleted: workupCompleted.trim() || undefined,
      });

      toast.success(isOpenReferral ? "Open referral created successfully!" : "Referral sent successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating referral:", error);
      toast.error("Failed to create referral. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedDoctorId("");
    setReferralType("");
    setSpecialtyRequired("");
    setUrgency("routine");
    setReasonForReferral("");
    setClinicalQuestion("");
    setRelevantHistory("");
    setCurrentMedications("");
    setWorkupCompleted("");
    setSearchTerm("");
    setIsOpenReferral(false);
  };

  const selectedDoctor = doctors?.find(d => d._id === selectedDoctorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Create Referral
          </DialogTitle>
          <DialogDescription>
            Create a referral to send the patient to a specialist for consultation or treatment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Referral Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralType">Referral Type *</Label>
              <Select value={referralType} onValueChange={setReferralType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty Required *</Label>
              <Select value={specialtyRequired} onValueChange={setSpecialtyRequired}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <Badge className={level.color} variant="secondary">
                        {level.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Referral *</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for this referral..."
                value={reasonForReferral}
                onChange={(e) => setReasonForReferral(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Clinical Question</Label>
              <Textarea
                id="question"
                placeholder="Specific clinical question for the specialist..."
                value={clinicalQuestion}
                onChange={(e) => setClinicalQuestion(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Right Column - Doctor Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Doctor Selection</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="openReferral"
                  checked={isOpenReferral}
                  onChange={(e) => setIsOpenReferral(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="openReferral" className="text-sm">Open Referral</Label>
              </div>
            </div>

            {!isOpenReferral && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search doctors by name or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-2 space-y-2">
                    {filteredDoctors?.length === 0 ? (
                      <div className="text-center py-8">
                        <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || specialtyRequired
                            ? "No doctors found matching your criteria"
                            : "No doctors available for referral"
                          }
                        </p>
                        {specialtyRequired && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try searching for doctors in {specialtyRequired}
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredDoctors?.map((doctor) => (
                        <Card
                          key={doctor._id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md",
                            selectedDoctorId === doctor._id
                              ? "ring-2 ring-primary bg-primary/5 shadow-md"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedDoctorId(doctor._id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={doctor.profileImageUrl} />
                                <AvatarFallback className="bg-primary/10">
                                  {doctor.firstName[0]}{doctor.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium truncate">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                  </p>
                                  {selectedDoctorId === doctor._id && (
                                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                  )}
                                  {doctor.primarySpecialty === specialtyRequired && (
                                    <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate mb-2">
                                  {doctor.primarySpecialty}
                                  {doctor.secondarySpecialties && doctor.secondarySpecialties.length > 0 && (
                                    <span className="text-xs"> • {doctor.secondarySpecialties.slice(0, 2).join(", ")}</span>
                                  )}
                                </p>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {doctor.yearsOfExperience || 0}+ years
                                  </Badge>
                                  {doctor.isAcceptingNewPatients && (
                                    <Badge variant="secondary" className="text-xs">
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Available
                                    </Badge>
                                  )}
                                  {doctor.hospitalAffiliations && doctor.hospitalAffiliations.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {doctor.hospitalAffiliations[0]}
                                    </Badge>
                                  )}
                                </div>
                                {doctor.bio && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {doctor.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </>
            )}

            {isOpenReferral && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-medium">Open Referral</p>
                  <p className="text-sm text-muted-foreground">
                    This referral will be available for any {specialtyRequired || 'specialist'} to accept
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Clinical Information */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium">Additional Clinical Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="history">Relevant History</Label>
              <Textarea
                id="history"
                placeholder="Relevant medical history..."
                value={relevantHistory}
                onChange={(e) => setRelevantHistory(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                placeholder="Current medications and dosages..."
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workup">Workup Completed</Label>
            <Textarea
              id="workup"
              placeholder="Tests, procedures, and workup already completed..."
              value={workupCompleted}
              onChange={(e) => setWorkupCompleted(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!referralType || !specialtyRequired || !reasonForReferral.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                {isOpenReferral ? "Create Open Referral" : "Send Referral"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
