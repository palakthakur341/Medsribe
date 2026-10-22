import React from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DoctorMessageList } from "./DoctorMessageList";
import { DoctorChatInput } from "./DoctorChatInput";
import { DoctorChatInterfaceProps } from "../types";
import { useOptimizedDoctorChat, usePatientProfile } from "../hooks";
import { useSession } from "next-auth/react";

export const DoctorChatInterface: React.FC<DoctorChatInterfaceProps> = React.memo(({
  doctorId,
  doctorName,
  onClose,
  className = ""
}) => {
  const { data: session } = useSession();
  const { profile: patientProfile } = usePatientProfile();
  
  const {
    messages,
    inputMessage,
    isLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress
  } = useOptimizedDoctorChat({
    doctorId,
    patientProfile
  });

  const patientName = patientProfile ? 
    `${patientProfile.firstName || ''} ${patientProfile.lastName || ''}`.trim() || 'You' 
    : 'You';

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header following AppointmentsList pattern */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Chat with Dr. {doctorName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Direct messaging
              </p>
            </div>
          </div>
          
          {/* Close button if onClose is provided */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <DoctorMessageList
          messages={messages}
          isLoading={isLoading}
          doctorName={doctorName}
          patientName={patientName}
          currentUserId={session?.user?.id}
          className="flex-1 min-h-0"
        />
        
        <DoctorChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          placeholder={`Message Dr. ${doctorName}...`}
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
});

DoctorChatInterface.displayName = "DoctorChatInterface";