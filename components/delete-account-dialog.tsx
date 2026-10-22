"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountDialogProps {
  userEmail: string;
  userRole: string;
}

export function DeleteAccountDialog({ userEmail, userRole }: DeleteAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const expectedConfirmation = "DELETE MY ACCOUNT";
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) {
      toast({
        title: "Invalid confirmation",
        description: `Please type "${expectedConfirmation}" to confirm.`,
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Account deleted",
          description: "Your account and all data have been permanently deleted.",
        });

        // Sign out and redirect to home page
        await signOut({ redirect: false });
        router.push("/");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setConfirmationText("");
    }
  };

  const getDataDescription = () => {
    if (userRole === "doctor") {
      return "This will permanently delete your doctor profile, all patient relationships, appointments, treatment plans, medications, referrals, SOAP notes, and chat history.";
    } else if (userRole === "patient") {
      return "This will permanently delete your patient profile, medical history, allergies, insurance information, appointments, SOAP notes, audio recordings, and chat history.";
    }
    return "This will permanently delete your account and all associated data.";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">Delete Account</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-left space-y-3">
              <div className="font-medium text-foreground">
                Are you absolutely sure you want to delete your account?
              </div>
              <div className="text-sm">
                {getDataDescription()}
              </div>
              <div className="text-sm font-medium text-destructive">
                This action cannot be undone and all data will be permanently lost.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type <span className="font-mono font-bold">{expectedConfirmation}</span> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedConfirmation}
              className="font-mono"
              disabled={isDeleting}
            />
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Account:</strong> {userEmail}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Role:</strong> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
