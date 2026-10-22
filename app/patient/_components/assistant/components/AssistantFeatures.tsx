import React from "react";
import { Brain, FileText, Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistantFeaturesProps {
  className?: string;
}

export const AssistantFeatures: React.FC<AssistantFeaturesProps> = React.memo(({ 
  className = "" 
}) => {
  const features = [
    {
      icon: FileText,
      title: "SOAP Analysis",
      description: "Understand your medical notes"
    },
    {
      icon: Activity,
      title: "Treatment Tracking", 
      description: "Monitor your care plans"
    },
    {
      icon: Calendar,
      title: "Health Insights",
      description: "Get personalized guidance"
    }
  ];

  return (
    <div className={cn("border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header following AppointmentsList pattern */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Assistant Features</h3>
            <p className="text-xs text-muted-foreground">
              AI-powered capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="p-4">
        <div className="space-y-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                {/* Feature Icon */}
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted flex-shrink-0 mt-0.5">
                  <IconComponent className="h-3 w-3 text-muted-foreground" />
                </div>
                
                {/* Feature Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

AssistantFeatures.displayName = "AssistantFeatures";
