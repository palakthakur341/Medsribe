import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Video,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  CalendarClock,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useAppointmentFormatters, useAppointmentActions } from "../hooks";
import type { Appointment } from "../types";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onStatusChange?: (action: string, appointmentId: string) => void;
}

interface RescheduleRequest {
  _id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  currentDateTime: number;
  requestedSlotId?: string;
  requestedDateTime?: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  adminNotes?: string;
  requestedAt: number;
  respondedAt?: number;
  respondedBy?: string;
  appointment?: any;
  patient?: any;
  requestedSlot?: any;
}

/**
 * AppointmentDetails Component
 * 
 * Shows detailed information about a selected appointment
 * including patient info, appointment details, and status actions
 */
export const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  appointment,
  onStatusChange,
}) => {
  const { data: session } = useSession();
  const { formatTime, formatDate, getStatusColor, getStatusIcon } = useAppointmentFormatters();

  // Appointment actions hook (UPDATED for new slot-based system)
  const {
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    rescheduleAppointmentWithSlot,
    joinCall,
    loadingStates,
    errors,
  } = useAppointmentActions();

  // State for reschedule request management
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseType, setResponseType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);

  // Fetch reschedule requests for this appointment
  const rescheduleRequests = useQuery(
    api.appointmentRescheduleRequests.getByDoctor,
    appointment?.doctor?._id ? {
      doctorId: appointment.doctor._id,
      status: "pending"
    } : "skip"
  );

  // Mutations for handling reschedule requests
  const approveRequest = useMutation(api.appointmentRescheduleRequests.approveRequest);
  const rejectRequest = useMutation(api.appointmentRescheduleRequests.rejectRequest);

  // Get reschedule request for this specific appointment
  const appointmentRescheduleRequest = rescheduleRequests?.find(
    req => req.appointmentId === appointment?._id
  );

  const handleApprove = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setResponseType("approve");
    setAdminNotes("");
    setShowResponseDialog(true);
  };

  const handleReject = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setResponseType("reject");
    setAdminNotes("");
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest || !session?.user?.id) return;

    const userId = session.user.id as Id<"users">;

    try {
      if (responseType === "approve") {
        await approveRequest({
          requestId: selectedRequest._id as any,
          adminNotes: adminNotes || undefined,
          respondedBy: userId,
        });
        toast.success("Reschedule request approved!");
      } else {
        if (!adminNotes.trim()) {
          toast.error("Please provide a reason for rejection");
          return;
        }
        await rejectRequest({
          requestId: selectedRequest._id as any,
          adminNotes: adminNotes,
          respondedBy: userId,
        });
        toast.success("Reschedule request rejected");
      }

      setShowResponseDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    }
  };

  // Button action handlers
  const handleConfirm = async () => {
    if (!appointment) return;
    try {
      await confirmAppointment(appointment._id as any);
      toast.success("Appointment confirmed successfully!");
      onStatusChange?.("confirm", appointment._id);
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    try {
      await cancelAppointment(appointment._id as any);
      toast.success("Appointment cancelled successfully!");
      onStatusChange?.("cancel", appointment._id);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleStart = async () => {
    if (!appointment) return;
    try {
      await startAppointment(appointment._id as any);
      toast.success("Appointment started!");
      onStatusChange?.("start", appointment._id);
    } catch (error) {
      console.error("Error starting appointment:", error);
      toast.error("Failed to start appointment");
    }
  };

  const handleComplete = async () => {
    if (!appointment) return;
    try {
      await completeAppointment(appointment._id as any);
      toast.success("Appointment completed!");
      onStatusChange?.("complete", appointment._id);
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  const handleJoinCall = () => {
    if (!appointment) return;
    try {
      joinCall(appointment);
      onStatusChange?.("join", appointment._id);
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error("Failed to join call");
    }
  };

  const handleReschedule = () => {
    if (!appointment) return;
    // This will trigger the parent component to open reschedule dialog
    onStatusChange?.("reschedule", appointment._id);
  };

  if (!appointment) {
    return (
      <div className="h-full border border-border/50 rounded-lg">
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm">No appointment selected</h3>
            <p className="text-xs text-muted-foreground">
              Select an appointment to view details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const patientAge = appointment.patient?.dateOfBirth 
    ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()
    : "N/A";

  const getStatusActions = () => {
    const isLoading = (action: string) => loadingStates[`${appointment?._id}_${action}`] || false;

    // If there's a pending reschedule request, show approve/reschedule/cancel buttons
    if (appointmentRescheduleRequest) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleApprove(appointmentRescheduleRequest)}
            disabled={isLoading("approve")}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReschedule}
            disabled={isLoading("reschedule")}
            className="flex-1"
          >
            <CalendarClock className="h-4 w-4 mr-1" />
            Reschedule
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading("cancel")}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      );
    }

    // Normal status-based actions
    switch (appointment.status) {
      case "scheduled":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading("confirm")}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReschedule}
              disabled={isLoading("reschedule")}
              className="flex-1"
            >
              <CalendarClock className="h-4 w-4 mr-1" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading("cancel")}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={appointment.location?.type === "telemedicine" ? handleJoinCall : handleStart}
              disabled={isLoading(appointment.location?.type === "telemedicine" ? "join" : "start")}
              className="flex-1"
            >
              {appointment.location?.type === "telemedicine" ? (
                <>
                  <Video className="h-4 w-4 mr-1" />
                  Join Call
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReschedule}
              disabled={isLoading("reschedule")}
              className="flex-1"
            >
              <CalendarClock className="h-4 w-4 mr-1" />
              Reschedule
            </Button>
          </div>
        );
      case "in_progress":
        return (
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={isLoading("complete")}
            className="w-full"
          >
            <Square className="h-4 w-4 mr-1" />
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col border border-border/50 rounded-lg">
      {/* Compact Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Appointment Details</h2>
              <p className="text-xs text-muted-foreground">View and manage appointment information</p>
            </div>
          </div>

          {/* Status Badge in Header */}
          <Badge
            variant="secondary"
            className={cn("text-xs capitalize", getStatusColor(appointment.status))}
          >
            {getStatusIcon(appointment.status)}
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Current Appointment - Compact */}
        <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Current Appointment</span>
              <span className="text-muted-foreground ml-auto text-xs">
                ID: {appointment._id.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {formatDate(appointment.appointmentDateTime)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {formatTime(appointment.appointmentDateTime)}
                </span>
                <span className="text-muted-foreground">({appointment.duration}m)</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            <h4 className="font-medium text-sm">Contact</h4>
          </div>

          <div className="pl-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </span>
            </div>

            {appointment.patient?.primaryPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.patient.primaryPhone}</span>
              </div>
            )}

            {appointment.patient?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{appointment.patient.email}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Appointment Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/60"></div>
            <h4 className="font-medium text-sm">Details</h4>
          </div>

          <div className="pl-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{appointment.appointmentType.replace('_', ' ')}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4" />
              <span className="text-muted-foreground">Reason:</span>
              <span className="font-medium flex-1">{appointment.visitReason}</span>
            </div>

            <div className="flex items-start gap-2">
              {appointment.location?.type === "telemedicine" ? (
                <Video className="h-4 w-4 text-muted-foreground mt-0.5" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium capitalize">{appointment.location?.type}</span>
                </div>
                {appointment.location?.address && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {appointment.location.address}
                  </p>
                )}
                {appointment.location?.room && (
                  <p className="text-xs text-muted-foreground">
                    Room: {appointment.location.room}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Chief Complaint */}
        {appointment.chiefComplaint && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500/60"></div>
                <h4 className="font-medium text-sm">Chief Complaint</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-4">
                {appointment.chiefComplaint}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Vitals */}
        {appointment.vitals && Object.keys(appointment.vitals).length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
                <h4 className="font-medium text-sm">Vitals</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pl-4">
                {appointment.vitals.bloodPressure && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">BP:</span>
                    <span className="font-medium">{appointment.vitals.bloodPressure}</span>
                  </div>
                )}
                {appointment.vitals.heartRate && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">HR:</span>
                    <span className="font-medium">{appointment.vitals.heartRate} bpm</span>
                  </div>
                )}
                {appointment.vitals.temperature && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{appointment.vitals.temperature}°F</span>
                  </div>
                )}
                {appointment.vitals.oxygenSaturation && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">O2:</span>
                    <span className="font-medium">{appointment.vitals.oxygenSaturation}%</span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Notes */}
        {appointment.notes && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500/60"></div>
                <h4 className="font-medium text-sm">Notes</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-4">
                {appointment.notes}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Reschedule Request */}
        {appointmentRescheduleRequest && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500/60"></div>
              <h4 className="font-medium text-sm">Reschedule Request</h4>
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
            </div>

            <div className="pl-4 space-y-3">
              {/* Current vs Requested Time */}
              <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Requested</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(appointmentRescheduleRequest.currentDateTime)}</span>
                      <span className="text-muted-foreground">at</span>
                      <span className="font-medium">{formatTime(appointmentRescheduleRequest.currentDateTime)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {appointmentRescheduleRequest.requestedSlot ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(`${appointmentRescheduleRequest.requestedSlot.date}T${appointmentRescheduleRequest.requestedSlot.time}`), 'MMM d')}</span>
                          <span className="text-muted-foreground">at</span>
                          <span className="font-medium">{format(new Date(`${appointmentRescheduleRequest.requestedSlot.date}T${appointmentRescheduleRequest.requestedSlot.time}`), 'h:mm a')}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No specific time</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Reason</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointmentRescheduleRequest.reason}
                </p>
              </div>

              {/* Request Info */}
              <div className="text-xs text-muted-foreground">
                Requested {format(new Date(appointmentRescheduleRequest.requestedAt), "MMM d 'at' h:mm a")}
              </div>
            </div>
          </div>
        )}

        {/* Final separator before actions */}
        {appointmentRescheduleRequest && <Separator />}
      </div>

      {/* Action Buttons */}
      {getStatusActions() && (
        <div className="flex-shrink-0 p-4 pt-2 border-t border-border/50">
          {getStatusActions()}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {responseType === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {responseType === "approve" ? "Approve" : "Reject"} Reschedule Request
            </DialogTitle>
            <DialogDescription>
              {responseType === "approve"
                ? "Approve this reschedule request. The appointment will be automatically updated if a specific time was requested."
                : "Reject this reschedule request. Please provide a reason for the patient."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="notes">
                {responseType === "approve" ? "Notes (Optional)" : "Reason for Rejection"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  responseType === "approve"
                    ? "Add any notes for the patient..."
                    : "Explain why the request cannot be accommodated..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              variant={responseType === "approve" ? "default" : "destructive"}
            >
              {responseType === "approve" ? "Approve Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
