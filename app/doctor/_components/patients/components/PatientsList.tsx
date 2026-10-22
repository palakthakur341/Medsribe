import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { usePatientActions } from "../hooks";
import type { PatientsListProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientsList Component
 * 
 * Displays a list of patients with empty state handling
 * Integrates with patient actions automatically
 */
export const PatientsList = React.memo<PatientsListProps>(({
  patients,
  isLoading = false,
  emptyMessage = "No patients found",
  onPatientAction,
  className = "",
}) => {
  const {
    removePatient,
    loadingStates,
  } = usePatientActions();

  // Handle patient actions
  const handleView = (patientId: string) => {
    onPatientAction?.("view", patientId as any);
  };

  const handleRemove = async (doctorPatientId: string) => {
    try {
      await removePatient(doctorPatientId as any);
      onPatientAction?.("remove", doctorPatientId as any);
    } catch (error) {
      console.error("Failed to remove patient:", error);
    }
  };

  // Remove the inline skeleton since we now use individual skeleton loading

  if (patients.length === 0) {
    return (
      <div className={cn("h-full border border-border rounded-xl flex items-center justify-center p-8 bg-background", className)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2 text-foreground">No Patients Found</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-sm">
            {emptyMessage}
          </p>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border border-border rounded-xl flex flex-col bg-background", className)}>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {patients.map((relationship) => {
            const relationshipId = relationship._id;
            const isActionLoading = Object.keys(loadingStates).some(key =>
              key.includes(relationshipId) && loadingStates[key]
            );

            return (
              <PatientCard
                key={relationshipId}
                relationship={relationship}
                onView={handleView}
                onRemove={handleRemove}
                isLoading={isActionLoading}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

PatientsList.displayName = "PatientsList";
