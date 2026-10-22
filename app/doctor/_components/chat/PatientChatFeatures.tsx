import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, FileText, Users, Clock } from "lucide-react";

export const PatientChatFeatures: React.FC = React.memo(() => {
  return (
    <Card className="flex-shrink-0">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Assistant Features</h3>
            <p className="text-xs text-muted-foreground">AI-powered medical capabilities</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2">
          <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Patient Communication</p>
            <p className="text-muted-foreground">Secure messaging with patients</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Conversation History</p>
            <p className="text-muted-foreground">Access to all patient conversations</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Real-time Messaging</p>
            <p className="text-muted-foreground">Instant communication support</p>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
});

PatientChatFeatures.displayName = "PatientChatFeatures";
