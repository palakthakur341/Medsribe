import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";
import { ReceivedReferralCard } from "./ReceivedReferralCard";
import { cn } from "@/lib/utils";
import type { ReceivedReferralsListProps } from "../types";

/**
 * ReceivedReferralsList Component
 * 
 * Displays a list of received referrals with empty states
 * Handles both loading and empty states appropriately
 */
export const ReceivedReferralsList = React.memo<ReceivedReferralsListProps>(({
  referrals,
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
  className = "",
}) => {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-base">Received Referrals</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          {referrals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {referrals.map((referral) => (
                <ReceivedReferralCard
                  key={referral._id}
                  referral={referral}
                  selectedReferral={selectedReferral}
                  responseNotes={responseNotes}
                  onSelectReferral={onSelectReferral}
                  onResponseNotesChange={onResponseNotesChange}
                  onAccept={onAccept}
                  onDecline={onDecline}
                  onComplete={onComplete}
                  onViewSOAP={onViewSOAP}
                  formatDate={formatDate}
                  getUrgencyBadge={getUrgencyBadge}
                  getStatusBadge={getStatusBadge}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

/**
 * EmptyState Component for Received Referrals
 */
const EmptyState = React.memo(() => {
  return (
    <div className="text-center py-8">
      <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-medium mb-1">No referrals found</h3>
      <p className="text-sm text-muted-foreground">
        You haven't received any referrals yet
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";
ReceivedReferralsList.displayName = "ReceivedReferralsList";
