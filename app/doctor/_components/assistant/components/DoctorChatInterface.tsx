import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles } from "lucide-react";

// Reuse patient assistant components but with doctor-specific types
import { MessageList, ChatInput } from "@/app/patient/_components/assistant/components";
import { ChatMessage, DoctorProfile } from "../types";

interface DoctorChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  doctorProfile?: DoctorProfile;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const DoctorChatInterface: React.FC<DoctorChatInterfaceProps> = React.memo(({
  messages,
  inputMessage,
  isLoading,
  doctorProfile,
  onInputChange,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Chat with Your Assistant</h3>
              <p className="text-xs text-muted-foreground">AI-powered medical insights</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          patientProfile={doctorProfile as any} // Type compatibility - MessageList works with both
        />
        <ChatInput
          value={inputMessage}
          onChange={onInputChange}
          onSend={onSendMessage}
          onKeyPress={onKeyPress}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
});

DoctorChatInterface.displayName = "DoctorChatInterface";
