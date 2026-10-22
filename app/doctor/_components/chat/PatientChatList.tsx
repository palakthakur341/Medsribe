import React, { useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, MessageCircle, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface PatientConversation {
  _id: Id<"doctorPatientConversations">;
  patientId: Id<"patients">;
  lastMessageAt: number;
  patient?: {
    firstName?: string;
    lastName?: string;
    mrn?: string;
  };
}

interface PatientChatListProps {
  conversations: PatientConversation[] | undefined;
  selectedPatientId: Id<"patients"> | null;
  onSelectPatient: (patientId: Id<"patients">) => void;
  onNewConversation?: () => void;
  isLoading?: boolean;
}

export const PatientChatList: React.FC<PatientChatListProps> = React.memo(({
  conversations,
  selectedPatientId,
  onSelectPatient,
  onNewConversation,
  isLoading = false
}) => {
  const handlePatientClick = useCallback((patientId: Id<"patients">) => {
    onSelectPatient(patientId);
  }, [onSelectPatient]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Chat History</h3>
              <p className="text-xs text-muted-foreground">Your conversation sessions</p>
            </div>
          </div>
          {onNewConversation && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={onNewConversation}
              disabled={isLoading}
            >
              <Plus className="h-3 w-3 mr-1" />
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No Conversations</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any active conversations with patients yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={cn(
                      "group p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                      selectedPatientId === conversation.patientId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => handlePatientClick(conversation.patientId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {conversation.patient?.firstName} {conversation.patient?.lastName}
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          MRN: {conversation.patient?.mrn} • {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

PatientChatList.displayName = "PatientChatList";
