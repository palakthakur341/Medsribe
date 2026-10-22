"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SOAPNote } from "../types";
import { cn } from "@/lib/utils";

interface SOAPNoteDialogProps {
  note: SOAPNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Simple Document-Style SOAP Note Dialog
 * Clean, readable document format without buttons or complex UI
 */
export const SOAPNoteDialog = React.memo<SOAPNoteDialogProps>(({
  note,
  open,
  onOpenChange,
  className,
}) => {
  // Don't render if no note
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl w-[90vw] h-[85vh] p-0 gap-0 bg-white dark:bg-gray-900",
          className
        )}
        aria-describedby="soap-note-document"
      >
        <ScrollArea className="h-full">
          <div className="p-8 md:p-12 lg:p-16">
            {/* Document Header */}
            <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                SOAP Clinical Note
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generated on {new Date(note.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Document Content */}
            <div
              id="soap-note-document"
              className="prose prose-gray dark:prose-invert max-w-none"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                lineHeight: '1.8',
                fontSize: '16px'
              }}
            >
              {/* Subjective Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 uppercase tracking-wide border-b border-blue-200 dark:border-blue-700 pb-1">
                  Subjective
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.subjective}
                </div>
              </div>

              {/* Objective Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 uppercase tracking-wide border-b border-green-200 dark:border-green-700 pb-1">
                  Objective
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.objective}
                </div>
              </div>

              {/* Assessment Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-3 uppercase tracking-wide border-b border-orange-200 dark:border-orange-700 pb-1">
                  Assessment
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.assessment}
                </div>
              </div>

              {/* Plan Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3 uppercase tracking-wide border-b border-purple-200 dark:border-purple-700 pb-1">
                  Plan
                </h2>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {note.plan}
                </div>
              </div>

              {/* Recommendations Section (if available) */}
              {note.recommendations && note.recommendations.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-3 uppercase tracking-wide border-b border-indigo-200 dark:border-indigo-700 pb-1">
                    Recommendations
                  </h2>
                  <div className="text-gray-800 dark:text-gray-200">
                    <ul className="list-disc list-inside space-y-2">
                      {note.recommendations.map((recommendation, index) => (
                        <li key={index} className="leading-relaxed">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <div className="flex justify-center items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                  {note.qualityScore && (
                    <span>Quality Score: {note.qualityScore}%</span>
                  )}
                  {note.processingTime && (
                    <span>Processing Time: {note.processingTime}</span>
                  )}
                  <span>Document ID: {note._id.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

SOAPNoteDialog.displayName = "SOAPNoteDialog";
