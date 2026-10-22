/**
 * Main SOAP Generation Content Component
 * Compact, modern interface with both audio and text processing capabilities
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  FileText,
  Sparkles,
  Shield,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MessageSquare
} from "lucide-react";

import { SOAPGenerateContentProps } from "../types";
import { useSOAPGenerate } from "../hooks/useSOAPGenerate";

import { AudioInputSection } from "./AudioInputSection";
import { TextInputSection } from "./TextInputSection";
import { ConversationInputSection } from "./ConversationInputSection";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { QualityMetricsDisplay } from "./QualityMetricsDisplay";
import { SOAPResultPreview } from "./SOAPResultPreview";

export function SOAPGenerateContent({
  patientProfile,
  className,
}: SOAPGenerateContentProps) {
  const { state, actions } = useSOAPGenerate(patientProfile);

  const handleSaveAndView = async () => {
    if (state.result) {
      await actions.saveSOAPNote(state.result);
    }
  };

  return (
    <div className={cn("h-full flex flex-col p-4 min-h-0", className)}>
      {!state.result ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
          {/* Input Section - 3 columns on desktop */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Content based on selected mode */}
              {state.mode === 'audio' ? (
                <AudioInputSection
                  onAudioReady={actions.handleAudioReady}
                  onAudioRemove={actions.handleAudioRemove}
                  onProcess={actions.handleAudioProcess}
                  audioBlob={state.audioBlob}
                  fileName={state.fileName}
                  isProcessing={state.isProcessing}
                />
              ) : (
                <TextInputSection
                  value={state.textInput}
                  onChange={actions.setTextInput}
                  onProcess={actions.handleTextProcess}
                  isProcessing={state.isProcessing}
                />
              )}

              {/* Processing Indicator */}
              {state.isProcessing && (
                <div>
                  <ProcessingIndicator processingState={state.processingState} />
                </div>
              )}

              {/* Error Display */}
              {state.error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">{state.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={actions.clearError}
                    className="mt-2"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Section - 1 column on desktop */}
          <div className="flex flex-col min-h-0 space-y-4">
            {/* Mode Selection Buttons - Fixed at top */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                variant={state.mode === 'audio' ? 'default' : 'outline'}
                onClick={() => actions.setMode('audio')}
                className="flex items-center gap-2 justify-start h-10"
              >
                <Mic className="h-4 w-4" />
                Audio Recording
              </Button>
              <Button
                variant={state.mode === 'text' ? 'default' : 'outline'}
                onClick={() => actions.setMode('text')}
                className="flex items-center gap-2 justify-start h-10"
              >
                <FileText className="h-4 w-4" />
                Text Input
              </Button>
              {/* <Button
                variant={state.mode === 'conversation' ? 'default' : 'outline'}
                onClick={() => actions.setMode('conversation')}
                className="flex items-center gap-2 justify-start h-10"
              >
                <MessageSquare className="h-4 w-4" />
                Conversation
              </Button> */}
            </div>

            {/* Guidelines Section - Open layout without card */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6">

              <Separator />

              {/* Enhanced AI Features Section */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Features
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Specialty Detection</div>
                      <div className="text-muted-foreground">Auto-identifies medical specialty</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Quality Metrics</div>
                      <div className="text-muted-foreground">Real-time quality assessment</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Safety Checks</div>
                      <div className="text-muted-foreground">Critical item identification</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Best Practices - Open layout */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-foreground">Best Practices</h4>
                <div className="space-y-2">
                  {state.mode === 'audio' ? (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Clear Speech</div>
                          <div className="text-muted-foreground">Speak at moderate pace with clear pronunciation</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Quiet Environment</div>
                          <div className="text-muted-foreground">Minimize background noise for better transcription</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Proper Distance</div>
                          <div className="text-muted-foreground">Hold device 6-8 inches from your mouth</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Section Breaks</div>
                          <div className="text-muted-foreground">Pause briefly between SOAP sections</div>
                        </div>
                      </div>

                    </>
                  ) : state.mode === 'text' ? (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Chief Complaint</div>
                          <div className="text-muted-foreground">Include patient's primary symptoms and concerns</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Physical Exam</div>
                          <div className="text-muted-foreground">Describe examination findings and observations</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Clinical Assessment</div>
                          <div className="text-muted-foreground">State your diagnosis and clinical reasoning</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Treatment Plan</div>
                          <div className="text-muted-foreground">Outline specific treatments and follow-up</div>
                        </div>
                      </div>

                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Natural Responses</div>
                          <div className="text-muted-foreground">Answer questions naturally and conversationally</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Detailed Information</div>
                          <div className="text-muted-foreground">Provide comprehensive details when asked</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Ask Questions</div>
                          <div className="text-muted-foreground">Request clarification if something is unclear</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">AI Guidance</div>
                          <div className="text-muted-foreground">Let the AI guide you through each SOAP section</div>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="h-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
            {/* Quality Metrics */}
            <QualityMetricsDisplay
              metrics={state.result.data.quality_metrics}
              specialty={state.result.data.specialty_detection}
              safety={state.result.data.safety_check}
            />

            <Separator />

            {/* SOAP Preview */}
            <SOAPResultPreview
              result={state.result}
            />
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={actions.reset}
                className="flex items-center gap-2"
              >
                Generate Another
              </Button>
              <Button
                onClick={handleSaveAndView}
                className="flex items-center gap-2"
              >
                Save & View Full Document
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}