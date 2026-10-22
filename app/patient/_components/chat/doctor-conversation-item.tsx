import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
}

interface Conversation {
  _id: Id<"doctorPatientConversations">;
  doctorId: Id<"doctors">;
  lastMessageAt: number;
  doctor?: Doctor;
}

interface DoctorConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (doctorId: Id<"doctors">) => void;
  className?: string;
}

export function DoctorConversationItem({
  conversation,
  isSelected,
  onClick,
  className = ""
}: DoctorConversationItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50",
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        className
      )}
      onClick={() => onClick(conversation.doctorId)}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Stethoscope className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate text-foreground">
            Dr. {conversation.doctor?.firstName} {conversation.doctor?.lastName}
          </h4>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {new Date(conversation.lastMessageAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {conversation.doctor?.primarySpecialty || "General Practice"}
        </p>
      </div>
    </div>
  );
}
