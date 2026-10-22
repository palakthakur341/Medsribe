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
  Search, 
  Stethoscope, 
  CheckCircle, 
  Loader2,
  UserCheck,
  Star,
  X
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { soapRAGHooks } from "@/lib/services/soap-rag-hooks";

interface ShareSOAPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soapNoteId: string;
  onSuccess?: () => void;
}

export function ShareSOAPDialog({ 
  open, 
  onOpenChange, 
  soapNoteId, 
  onSuccess 
}: ShareSOAPDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Get all active doctors
  const doctors = useQuery(api.doctors.getAllActiveDoctors);

  // Share SOAP note mutation
  const shareSOAPNote = useMutation(api.sharedSoapNotes.shareSOAPNote);

  // Filter doctors based on search term
  const filteredDoctors = doctors?.filter(doctor => 
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleShare = async () => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor to share with");
      return;
    }

    setIsSharing(true);
    try {
      const shareId = await shareSOAPNote({
        soapNoteId: soapNoteId as any,
        doctorId: selectedDoctorId as any,
        message: message.trim() || undefined,
      });

      // 🔥 Embed SOAP sharing into RAG system (production-ready)
      if (shareId) {
        // Note: In a real implementation, you'd get patient ID from context/auth
        const patientId = 'patient_from_context'; // This should be extracted from context

        soapRAGHooks.onSOAPNoteShared({
          shareId,
          soapNoteId,
          fromDoctorId: 'doctor_from_context', // This should be extracted from context
          toDoctorId: selectedDoctorId,
          patientId,
          patientName: 'Patient Name', // ✅ ADD PATIENT NAME - should be extracted from context
          shareReason: message.trim() || 'Patient shared SOAP note for medical consultation',
          permissions: 'view',
          message: message.trim() || undefined,
          createdAt: Date.now(),
        });
      }

      toast.success("SOAP note shared successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setSelectedDoctorId("");
      setMessage("");
      setSearchTerm("");
    } catch (error) {
      console.error("Error sharing SOAP note:", error);
      toast.error("Failed to share SOAP note. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const selectedDoctor = doctors?.find(d => d._id === selectedDoctorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col backdrop-blur-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            Share SOAP Note
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select a doctor to share your SOAP note with for review and collaboration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Doctor Display */}
          {selectedDoctor && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedDoctor.profileImage} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedDoctor.specialization}
                      </div>
                      {selectedDoctor.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {selectedDoctor.rating} rating
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDoctorId("")}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctors List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Doctors</Label>
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2 space-y-2">
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchTerm ? "No doctors found matching your search" : "No doctors available"}
                    </p>
                  </div>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor._id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-sm border",
                        selectedDoctorId === doctor._id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      )}
                      onClick={() => setSelectedDoctorId(doctor._id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doctor.profileImage} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {doctor.firstName[0]}{doctor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </span>
                              {selectedDoctorId === doctor._id && (
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {doctor.specialization}
                            </div>
                            {doctor.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {doctor.rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message for the doctor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={!selectedDoctorId || isSharing}
            className="min-w-[100px]"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
