import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import type { SentReferralCardProps } from "../types";

/**
 * SentReferralCard Component
 * 
 * Displays an individual sent referral with patient info and referral status
 * Shows receiving doctor or specialty information
 */
export const SentReferralCard = React.memo<SentReferralCardProps>(({
  referral,
  onViewSOAP,
  formatDate,
  getUrgencyBadge,
  getStatusBadge,
}) => {
  return (
    <div className="p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-green-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {/* Patient and Receiving Doctor Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">
                {referral.patient?.firstName} {referral.patient?.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {referral.toDoctor
                  ? `Referred to Dr. ${referral.toDoctor.firstName} ${referral.toDoctor.lastName}`
                  : `Open referral for ${referral.specialtyRequired}`
                }
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
        <div className="flex flex-col gap-1">
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
    </div>
  );
});

SentReferralCard.displayName = "SentReferralCard";
