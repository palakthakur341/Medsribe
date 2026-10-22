"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  Search,
  Clock,
  Pill,
  Target,
  FileText,
  Heart,
  Brain,
  Thermometer,
  Stethoscope,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatmentTemplate {
  id: string;
  name: string;
  condition: string;
  category: "cardiovascular" | "respiratory" | "endocrine" | "neurological" | "infectious" | "musculoskeletal" | "mental_health";
  severity: "mild" | "moderate" | "severe";
  duration: string;
  description: string;
  goals: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  followUpSchedule: string[];
  evidenceLevel: "A" | "B" | "C";
  guidelines: string;
}

const TREATMENT_TEMPLATES: TreatmentTemplate[] = [
  {
    id: "hypertension-stage1",
    name: "Stage 1 Hypertension Management",
    condition: "Essential Hypertension (Stage 1)",
    category: "cardiovascular",
    severity: "mild",
    duration: "3-6 months",
    description: "Evidence-based treatment for newly diagnosed stage 1 hypertension with lifestyle modifications and ACE inhibitor therapy.",
    goals: [
      "Reduce systolic BP to <130 mmHg",
      "Reduce diastolic BP to <80 mmHg",
      "Implement lifestyle modifications",
      "Monitor for medication side effects"
    ],
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "Ongoing",
        instructions: "Take in the morning, monitor for dry cough"
      }
    ],
    followUpSchedule: ["2 weeks", "1 month", "3 months"],
    evidenceLevel: "A",
    guidelines: "AHA/ACC 2017 Hypertension Guidelines"
  },
  {
    id: "diabetes-type2-initial",
    name: "Type 2 Diabetes Initial Management",
    condition: "Type 2 Diabetes Mellitus",
    category: "endocrine",
    severity: "moderate",
    duration: "6-12 months",
    description: "First-line treatment for newly diagnosed type 2 diabetes with metformin and lifestyle interventions.",
    goals: [
      "Achieve HbA1c <7%",
      "Maintain fasting glucose 80-130 mg/dL",
      "Weight reduction if overweight",
      "Prevent diabetic complications"
    ],
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily with meals",
        duration: "Ongoing",
        instructions: "Start with 500mg daily, increase to BID after 1 week if tolerated"
      }
    ],
    followUpSchedule: ["2 weeks", "1 month", "3 months", "6 months"],
    evidenceLevel: "A",
    guidelines: "ADA 2023 Standards of Care"
  },
  {
    id: "depression-mild",
    name: "Mild to Moderate Depression",
    condition: "Major Depressive Disorder",
    category: "mental_health",
    severity: "mild",
    duration: "6-12 months",
    description: "Evidence-based treatment for mild to moderate depression with SSRI therapy and psychotherapy referral.",
    goals: [
      "Improve mood and daily functioning",
      "Reduce PHQ-9 score by 50%",
      "Establish regular sleep pattern",
      "Engage in psychotherapy"
    ],
    medications: [
      {
        name: "Sertraline",
        dosage: "25mg",
        frequency: "Once daily",
        duration: "6-12 months minimum",
        instructions: "Take in morning, may increase to 50mg after 1 week"
      }
    ],
    followUpSchedule: ["1 week", "2 weeks", "1 month", "3 months"],
    evidenceLevel: "A",
    guidelines: "APA Practice Guidelines for Depression"
  },
  {
    id: "copd-stable",
    name: "Stable COPD Management",
    condition: "Chronic Obstructive Pulmonary Disease",
    category: "respiratory",
    severity: "moderate",
    duration: "Ongoing",
    description: "Maintenance therapy for stable COPD with bronchodilator and inhaled corticosteroid combination.",
    goals: [
      "Improve exercise tolerance",
      "Reduce exacerbation frequency",
      "Maintain stable lung function",
      "Smoking cessation if applicable"
    ],
    medications: [
      {
        name: "Albuterol/Ipratropium",
        dosage: "2 puffs",
        frequency: "Every 6 hours as needed",
        duration: "Ongoing",
        instructions: "Use spacer device, rinse mouth after use"
      }
    ],
    followUpSchedule: ["1 month", "3 months", "6 months"],
    evidenceLevel: "A",
    guidelines: "GOLD 2023 COPD Guidelines"
  },
  {
    id: "anxiety-gad",
    name: "Generalized Anxiety Disorder",
    condition: "Generalized Anxiety Disorder",
    category: "mental_health",
    severity: "moderate",
    duration: "6-12 months",
    description: "First-line treatment for GAD with SSRI therapy and cognitive behavioral therapy referral.",
    goals: [
      "Reduce GAD-7 score to <10",
      "Improve daily functioning",
      "Develop coping strategies",
      "Reduce physical anxiety symptoms"
    ],
    medications: [
      {
        name: "Escitalopram",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "6-12 months minimum",
        instructions: "Take in morning, may increase to 10mg after 1 week"
      }
    ],
    followUpSchedule: ["1 week", "2 weeks", "1 month", "3 months"],
    evidenceLevel: "A",
    guidelines: "APA Practice Guidelines for Anxiety Disorders"
  },
  {
    id: "osteoarthritis-knee",
    name: "Knee Osteoarthritis Management",
    condition: "Knee Osteoarthritis",
    category: "musculoskeletal",
    severity: "mild",
    duration: "3-6 months",
    description: "Conservative management of knee osteoarthritis with NSAIDs and physical therapy.",
    goals: [
      "Reduce pain and stiffness",
      "Improve joint mobility",
      "Strengthen supporting muscles",
      "Maintain functional independence"
    ],
    medications: [
      {
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "Three times daily with food",
        duration: "2-4 weeks",
        instructions: "Take with food, monitor for GI symptoms"
      }
    ],
    followUpSchedule: ["2 weeks", "1 month", "3 months"],
    evidenceLevel: "B",
    guidelines: "ACR 2019 Osteoarthritis Guidelines"
  }
];

interface TreatmentTemplatesProps {
  onSelectTemplate: (template: TreatmentTemplate) => void;
  className?: string;
}

export const TreatmentTemplates: React.FC<TreatmentTemplatesProps> = ({
  onSelectTemplate,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<TreatmentTemplate | null>(null);

  const categories = [
    { key: "all", label: "All Categories", icon: <Activity className="h-4 w-4" /> },
    { key: "cardiovascular", label: "Cardiovascular", icon: <Heart className="h-4 w-4" /> },
    { key: "respiratory", label: "Respiratory", icon: <Stethoscope className="h-4 w-4" /> },
    { key: "endocrine", label: "Endocrine", icon: <Thermometer className="h-4 w-4" /> },
    { key: "neurological", label: "Neurological", icon: <Brain className="h-4 w-4" /> },
    { key: "mental_health", label: "Mental Health", icon: <Brain className="h-4 w-4" /> },
    { key: "musculoskeletal", label: "Musculoskeletal", icon: <Activity className="h-4 w-4" /> },
  ];

  const filteredTemplates = TREATMENT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-700 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "severe":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-primary/10 text-primary border-primary/20";
      case "B":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "C":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatment templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{template.condition}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className={getSeverityColor(template.severity)}>
                      {template.severity}
                    </Badge>
                    <Badge variant="outline" className={getEvidenceLevelColor(template.evidenceLevel)}>
                      Level {template.evidenceLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Pill className="h-3 w-3" />
                      {template.medications.length} meds
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {template.goals.length} goals
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                          <DialogDescription>{template.condition}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Treatment Goals</h4>
                            <ul className="text-sm space-y-1">
                              {template.goals.map((goal, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Target className="h-3 w-3 mt-0.5 text-primary" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Medications</h4>
                            <div className="space-y-2">
                              {template.medications.map((med, index) => (
                                <div key={index} className="p-2 bg-muted/30 rounded text-sm">
                                  <div className="font-medium">{med.name} {med.dosage}</div>
                                  <div className="text-muted-foreground">{med.frequency} - {med.duration}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{med.instructions}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Follow-up Schedule</h4>
                            <div className="flex gap-2 flex-wrap">
                              {template.followUpSchedule.map((schedule, index) => (
                                <Badge key={index} variant="outline">{schedule}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button onClick={() => onSelectTemplate(template)} className="flex-1">
                              <Plus className="h-4 w-4 mr-2" />
                              Use This Template
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      onClick={() => onSelectTemplate(template)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No templates found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
};

export default TreatmentTemplates;
