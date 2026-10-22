"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Pill,
  Target,
  Heart,
  Brain,
  Thermometer,
  Stethoscope,
  Plus,
  Sparkles,
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
  evidenceLevel: "A" | "B" | "C";
}

const COMPACT_TEMPLATES: TreatmentTemplate[] = [
  {
    id: "hypertension-stage1",
    name: "Stage 1 Hypertension",
    condition: "Essential Hypertension (Stage 1)",
    category: "cardiovascular",
    severity: "mild",
    duration: "3-6 months",
    description: "Evidence-based treatment for newly diagnosed stage 1 hypertension with lifestyle modifications and ACE inhibitor therapy.",
    goals: [
      "Reduce systolic BP to <130 mmHg",
      "Reduce diastolic BP to <80 mmHg",
      "Implement lifestyle modifications"
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
    evidenceLevel: "A"
  },
  {
    id: "diabetes-type2",
    name: "Type 2 Diabetes Initial",
    condition: "Type 2 Diabetes Mellitus",
    category: "endocrine",
    severity: "moderate",
    duration: "6-12 months",
    description: "First-line treatment for newly diagnosed type 2 diabetes with metformin and lifestyle interventions.",
    goals: [
      "Achieve HbA1c <7%",
      "Maintain fasting glucose 80-130 mg/dL",
      "Weight reduction if overweight"
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
    evidenceLevel: "A"
  },
  {
    id: "depression-mild",
    name: "Mild-Moderate Depression",
    condition: "Major Depressive Disorder",
    category: "mental_health",
    severity: "mild",
    duration: "6-12 months",
    description: "Evidence-based treatment for mild to moderate depression with SSRI therapy.",
    goals: [
      "Improve mood and daily functioning",
      "Reduce PHQ-9 score by 50%",
      "Establish regular sleep pattern"
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
    evidenceLevel: "A"
  },
  {
    id: "copd-stable",
    name: "Stable COPD",
    condition: "Chronic Obstructive Pulmonary Disease",
    category: "respiratory",
    severity: "moderate",
    duration: "Ongoing",
    description: "Maintenance therapy for stable COPD with bronchodilator therapy.",
    goals: [
      "Improve exercise tolerance",
      "Reduce exacerbation frequency",
      "Maintain stable lung function"
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
    evidenceLevel: "A"
  },
  {
    id: "anxiety-gad",
    name: "Generalized Anxiety",
    condition: "Generalized Anxiety Disorder",
    category: "mental_health",
    severity: "moderate",
    duration: "6-12 months",
    description: "First-line treatment for GAD with SSRI therapy and CBT referral.",
    goals: [
      "Reduce GAD-7 score to <10",
      "Improve daily functioning",
      "Develop coping strategies"
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
    evidenceLevel: "A"
  },
  {
    id: "osteoarthritis-knee",
    name: "Knee Osteoarthritis",
    condition: "Knee Osteoarthritis",
    category: "musculoskeletal",
    severity: "mild",
    duration: "3-6 months",
    description: "Conservative management of knee osteoarthritis with NSAIDs and physical therapy.",
    goals: [
      "Reduce pain and stiffness",
      "Improve joint mobility",
      "Strengthen supporting muscles"
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
    evidenceLevel: "B"
  }
];

interface CompactTreatmentTemplatesProps {
  onSelectTemplate: (template: TreatmentTemplate) => void;
  className?: string;
}

export const CompactTreatmentTemplates: React.FC<CompactTreatmentTemplatesProps> = ({
  onSelectTemplate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: "All", icon: <Activity className="h-3 w-3" /> },
    { key: "cardiovascular", label: "Heart", icon: <Heart className="h-3 w-3" /> },
    { key: "respiratory", label: "Lungs", icon: <Stethoscope className="h-3 w-3" /> },
    { key: "endocrine", label: "Diabetes", icon: <Thermometer className="h-3 w-3" /> },
    { key: "mental_health", label: "Mental", icon: <Brain className="h-3 w-3" /> },
  ];

  const filteredTemplates = COMPACT_TEMPLATES.filter(template => {
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
    <div className={cn("w-full", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-primary/20 hover:border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Treatment Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick-start with evidence-based treatment plans
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {COMPACT_TEMPLATES.length} templates
                  </Badge>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      type="button"
                      variant={selectedCategory === category.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {category.icon}
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-sm transition-shadow border border-border/50">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-medium">{template.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.condition}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Badge variant="outline" className={cn("text-xs", getSeverityColor(template.severity))}>
                              {template.severity}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getEvidenceLevelColor(template.evidenceLevel))}>
                              {template.evidenceLevel}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onSelectTemplate(template)}
                          className="w-full text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-medium mb-1">No templates found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or category filter
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CompactTreatmentTemplates;
