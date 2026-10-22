import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { SentReferralCard } from "./SentReferralCard";
import { cn } from "@/lib/utils";
import type { SentReferralsListProps } from "../types";

/**
 * SentReferralsList Component
 * 
 * Displays a list of sent referrals with empty states
 * Shows referrals sent by the current doctor
 */
export const SentReferralsList = React.memo<SentReferralsListProps>(({
  referrals,
  onViewSOAP,
  formatDate,
  getUrgencyBadge,
  getStatusBadge,
  className = "",
}) => {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-base">Sent Referrals</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          {referrals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {referrals.map((referral) => (
                <SentReferralCard
                  key={referral._id}
                  referral={referral}
                  onViewSOAP={onViewSOAP}
                  formatDate={formatDate}
                  getUrgencyBadge={getUrgencyBadge}
                  getStatusBadge={getStatusBadge}
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
 * EmptyState Component for Sent Referrals
 */
const EmptyState = React.memo(() => {
  return (
    <div className="text-center py-8">
      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-medium mb-1">No sent referrals</h3>
      <p className="text-sm text-muted-foreground">
        You haven't sent any referrals yet
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";
SentReferralsList.displayName = "SentReferralsList";
