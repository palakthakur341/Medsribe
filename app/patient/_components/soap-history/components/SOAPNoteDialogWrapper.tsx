"use client";

import React from "react";
import { SOAPNoteDialog } from "./SOAPNoteDialog";
import { useSOAPNoteDialog } from "../hooks/useSOAPNoteDialog";
import { SOAPNote } from "../types";

interface SOAPNoteDialogWrapperProps {
  children: (props: {
    openDialog: (note: SOAPNote) => void;
    closeDialog: () => void;
    isOpen: boolean;
    selectedNote: SOAPNote | null;
  }) => React.ReactNode;
}

/**
 * SOAP Note Dialog Wrapper Component
 * 
 * Provides a render prop pattern for easy integration with any component
 * that needs to display SOAP notes in a dialog overlay.
 * 
 * Usage:
 * <SOAPNoteDialogWrapper onDownload={handleDownload} onShare={handleShare}>
 *   {({ openDialog }) => (
 *     <Button onClick={() => openDialog(note)}>View Note</Button>
 *   )}
 * </SOAPNoteDialogWrapper>
 */
export const SOAPNoteDialogWrapper = React.memo<SOAPNoteDialogWrapperProps>(({
  children,
}) => {
  const { selectedNote, isOpen, openDialog, closeDialog, setOpen } = useSOAPNoteDialog();

  return (
    <>
      {/* Render children with dialog controls */}
      {children({
        openDialog,
        closeDialog,
        isOpen,
        selectedNote,
      })}

      {/* Simple document-style dialog */}
      <SOAPNoteDialog
        note={selectedNote}
        open={isOpen}
        onOpenChange={setOpen}
      />
    </>
  );
});

SOAPNoteDialogWrapper.displayName = "SOAPNoteDialogWrapper";

/**
 * Alternative: Simple hook-based approach
 * For components that prefer to manage the dialog directly
 */
export function useSOAPNoteDialogComponent() {
  const dialogState = useSOAPNoteDialog();

  const DialogComponent = React.useMemo(() => (
    <SOAPNoteDialog
      note={dialogState.selectedNote}
      open={dialogState.isOpen}
      onOpenChange={dialogState.setOpen}
    />
  ), [
    dialogState.selectedNote,
    dialogState.isOpen,
    dialogState.setOpen,
  ]);

  return {
    ...dialogState,
    DialogComponent,
  };
}
