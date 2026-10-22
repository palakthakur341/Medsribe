"use client";

import React, { useState, useMemo } from "react";
import { Control } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
import { type TreatmentFormData } from "@/lib/validations/treatment";
import type { Id } from "@/convex/_generated/dataModel";



interface TreatmentSOAPNoteSelectorProps {
  control: Control<TreatmentFormData>;
  patientId: string;
}

export const TreatmentSOAPNoteSelector: React.FC<TreatmentSOAPNoteSelectorProps> = ({
  control,
  patientId
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch SOAP notes for the patient
  const soapNotes = useQuery(
    api.soapNotes.getByPatientId,
    { patientId: patientId as Id<"patients"> }
  );

  // Filter and format SOAP notes
  const formattedSoapNotes = useMemo(() => {
    if (!soapNotes) return [];

    return soapNotes
      .filter(note => note.status === "completed")
      .map(note => ({
        id: note._id,
        title: `SOAP Note - ${format(new Date(note.timestamp), "MMM dd, yyyy")}`,
        date: format(new Date(note.timestamp), "PPP"),
        specialty: note.data?.specialty_detection?.specialty || "General",
        assessment: note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.diagnosis || "",
        plan: note.data?.soap_notes?.soap_notes?.plan?.treatments?.join(", ") || "",
        preview: note.data?.soap_notes?.soap_notes?.assessment?.primary_diagnosis?.diagnosis?.substring(0, 100) + "..." || "No assessment available",
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [soapNotes]);

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return formattedSoapNotes;

    const term = searchTerm.toLowerCase();
    return formattedSoapNotes.filter(note =>
      note.title.toLowerCase().includes(term) ||
      note.specialty.toLowerCase().includes(term) ||
      note.assessment.toLowerCase().includes(term) ||
      note.plan.toLowerCase().includes(term)
    );
  }, [formattedSoapNotes, searchTerm]);

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 pb-3 border-b">
        <h2 className="font-medium">SOAP Note Selection (Optional)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Associate this treatment with an existing SOAP note for better context.
        </p>
      </div>
      <div className="p-4">
        <FormField
          control={control}
          name="soapNoteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select SOAP Note</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? formattedSoapNotes.find(note => note.id === field.value)?.title
                        : "Select SOAP note..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search SOAP notes..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {!soapNotes ? "Loading SOAP notes..." : "No SOAP notes found."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            field.onChange("");
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">No SOAP note</span>
                          </div>
                        </CommandItem>
                        {filteredNotes.map((note) => (
                          <CommandItem
                            key={note.id}
                            value={note.id}
                            onSelect={() => {
                              field.onChange(note.id);
                              setOpen(false);
                            }}
                          >
                            <div className="flex flex-col gap-1 w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{note.title}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {note.specialty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{note.date}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {note.preview}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selected SOAP Note Preview */}
        {control._formValues.soapNoteId && (
          <div className="mt-4 p-3 border rounded-lg bg-primary/5">
            {(() => {
              const selectedNote = formattedSoapNotes.find(
                note => note.id === control._formValues.soapNoteId
              );
              if (!selectedNote) return null;

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{selectedNote.title}</h4>
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedNote.specialty}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{selectedNote.date}</span>
                  </div>
                  {selectedNote.assessment && (
                    <div className="text-xs">
                      <span className="font-medium">Assessment: </span>
                      <span className="text-muted-foreground">
                        {selectedNote.assessment.substring(0, 150)}
                        {selectedNote.assessment.length > 150 ? "..." : ""}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
