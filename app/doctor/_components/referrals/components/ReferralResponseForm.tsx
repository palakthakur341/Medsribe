import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReferralResponseFormProps } from "../types";

/**
 * ReferralResponseForm Component
 * 
 * Provides form interface for responding to referrals
 * Includes accept, decline, and cancel actions
 */
export const ReferralResponseForm = React.memo<ReferralResponseFormProps>(({
  referralId,
  responseNotes,
  onResponseNotesChange,
  onAccept,
  onDecline,
  onCancel,
  isProcessing,
}) => {
  const handleAccept = () => {
    onAccept(referralId);
  };

  const handleDecline = () => {
    onDecline(referralId);
  };

  return (
    <div className="mt-3 p-3 border rounded bg-muted/50">
      <div className="space-y-2">
        <div>
          <label className="text-xs font-medium">Response Notes</label>
          <Textarea
            placeholder="Add your response or notes..."
            value={responseNotes}
            onChange={(e) => onResponseNotesChange(e.target.value)}
            rows={2}
            className="text-sm"
            disabled={isProcessing}
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            className="h-7 px-3 text-xs"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Accept"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            className="h-7 px-3 text-xs"
            disabled={isProcessing}
          >
            Decline
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-7 px-3 text-xs"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
});

ReferralResponseForm.displayName = "ReferralResponseForm";
