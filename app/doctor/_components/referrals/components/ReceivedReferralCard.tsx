import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import { ReferralResponseForm } from "./ReferralResponseForm";
import type { ReceivedReferralCardProps } from "../types";

/**
 * ReceivedReferralCard Component
 * 
 * Displays an individual received referral with patient info, referral details, and actions
 * Includes response form when selected for action
 */
export const ReceivedReferralCard = React.memo<ReceivedReferralCardProps>(({
  referral,
  selectedReferral,
  responseNotes,
  onSelectReferral,
  onResponseNotesChange,
  onAccept,
  onDecline,
  onComplete,
  onViewSOAP,
  formatDate,
  getUrgencyBadge,
  getStatusBadge,
  isProcessing,
}) => {
  const isSelected = selectedReferral === referral._id;

  return (
    <div className="p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          {/* Patient and Referring Doctor Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">
                {referral.patient?.firstName} {referral.patient?.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Referred by Dr. {referral.fromDoctor?.firstName} {referral.fromDoctor?.lastName}
              </p>
            </div>
          </div>

          {/* Status and Urgency Badges */}
          <div className="flex items-center gap-2">
            {getUrgencyBadge(referral.urgency || "routine")}
            {getStatusBadge(referral.status)}
            <Badge variant="outline" className="text-xs">
              {formatDate(referral.createdAt)}
            </Badge>
          </div>

          {/* Referral Details */}
          <div className="space-y-1">
            <div>
              <h4 className="font-medium text-xs">Referral Reason:</h4>
              <p className="text-xs text-muted-foreground">{referral.reasonForReferral}</p>
            </div>
            {referral.clinicalQuestion && (
              <div>
                <h4 className="font-medium text-xs">Clinical Question:</h4>
                <p className="text-xs text-muted-foreground">{referral.clinicalQuestion}</p>
              </div>
            )}
            {referral.responseMessage && (
              <div>
                <h4 className="font-medium text-xs">Response:</h4>
                <p className="text-xs text-muted-foreground">{referral.responseMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 ml-3">
          {referral.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectReferral(isSelected ? null : referral._id)}
              className="h-7 px-2 text-xs"
              disabled={isProcessing}
            >
              {isSelected ? "Cancel" : "Respond"}
            </Button>
          )}
          {referral.status === "accepted" && (
            <Button
              size="sm"
              onClick={() => onComplete(referral._id)}
              className="h-7 px-2 text-xs"
              disabled={isProcessing}
            >
              Complete
            </Button>
          )}
          {(referral.status === "accepted" || referral.status === "completed") && referral.soapNote && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewSOAP(
                referral.soapNote!._id,
                `${referral.patient?.firstName} ${referral.patient?.lastName}`
              )}
              className="h-7 px-2 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              View SOAP
            </Button>
          )}
        </div>
      </div>

      {/* Response Form */}
      {isSelected && (
        <ReferralResponseForm
          referralId={referral._id}
          responseNotes={responseNotes}
          onResponseNotesChange={onResponseNotesChange}
          onAccept={onAccept}
          onDecline={onDecline}
          onCancel={() => onSelectReferral(null)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
});

ReceivedReferralCard.displayName = "ReceivedReferralCard";
