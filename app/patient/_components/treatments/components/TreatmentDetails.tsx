import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Pill,
  Calendar,
  Target,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Building2,
  Hash,
  Timer,
  RefreshCw,
  Heart,
  User,
  Phone,
  Package,
  Truck,
  ShoppingCart,
} from "lucide-react";
import type { TreatmentDetailsProps } from "../types";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

/**
 * TreatmentDetails Component
 * 
 * Displays detailed treatment information with consistent UI standards
 * Follows AppointmentsList design patterns and conventions
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatment,
  standaloneMedications = [],
  onViewTreatment,
  className = "",
}) => {
  // Fetch prescription orders for this treatment plan
  const prescriptionOrders = useQuery(
    api.prescriptionOrders.getOrdersByTreatmentPlanId,
    treatment ? { treatmentPlanId: treatment._id as Id<"treatmentPlans"> } : "skip"
  );

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatLongDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "picked_up":
      case "delivered":
        return "bg-primary/10 text-primary border-primary/20";
      case "cancelled":
      case "on_hold":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "processing":
        return <RefreshCw className="h-3 w-3" />;
      case "ready":
        return <CheckCircle className="h-3 w-3" />;
      case "picked_up":
        return <ShoppingCart className="h-3 w-3" />;
      case "delivered":
        return <Truck className="h-3 w-3" />;
      case "cancelled":
      case "on_hold":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getOrderStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your prescription has been sent to the pharmacy";
      case "processing":
        return "The pharmacy is preparing your medication";
      case "ready":
        return "Your medication is ready for pickup";
      case "picked_up":
        return "You have picked up your medication";
      case "delivered":
        return "Your medication has been delivered";
      case "cancelled":
        return "This prescription order was cancelled";
      case "on_hold":
        return "This prescription is temporarily on hold";
      default:
        return "Status unknown";
    }
  };

  if (!treatment) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-medium">Select a Treatment Plan</h3>
          <p className="text-sm text-muted-foreground">
            Choose a treatment from the list to view detailed information about your care plan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{treatment.title}</h3>
              <p className="text-xs text-muted-foreground">
                Started {formatLongDate(treatment.startDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs px-2 py-0.5", getStatusColor(treatment.status))}
            >
              {treatment.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
              {treatment.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
              {treatment.status === "discontinued" && <AlertTriangle className="h-3 w-3 mr-1" />}
              <span className="capitalize font-medium">{treatment.status}</span>
            </Badge>
            {onViewTreatment && (
              <Button variant="outline" size="sm" onClick={() => onViewTreatment(treatment)} className="gap-1">
                <Eye className="h-3 w-3" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
          
          {/* Treatment Overview */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Diagnosis */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Your Diagnosis</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{treatment.diagnosis}</p>
              </div>

              {/* Treatment Plan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Treatment Plan</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{treatment.plan}</p>
              </div>
            </div>
          </div>

          {/* Treatment Goals */}
          {treatment.goals && treatment.goals.length > 0 && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Treatment Goals</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {treatment.goals.length} {treatment.goals.length === 1 ? 'Goal' : 'Goals'}
                </Badge>
              </div>
              <div className="space-y-2">
                {treatment.goals.map((goal: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Medications</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {treatment.medicationDetails.length} {treatment.medicationDetails.length === 1 ? 'Medication' : 'Medications'}
                </Badge>
              </div>
              <div className="space-y-3">
                {treatment.medicationDetails.map((medication, index: number) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
                    {/* Medication Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                          <Pill className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{medication.name}</h4>
                          {medication.genericName && (
                            <p className="text-xs text-muted-foreground">Generic: {medication.genericName}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {medication.strength}
                      </Badge>
                    </div>

                    {/* Medication Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="text-foreground">{medication.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="text-foreground">{medication.frequency}</span>
                        </div>
                        {medication.refills > 0 && (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Refills:</span>
                            <span className="text-foreground">{medication.refills}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Form:</span>
                          <span className="text-foreground capitalize">{medication.dosageForm}</span>
                        </div>
                        {medication.duration && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="text-foreground">{medication.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-2 bg-background rounded border">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">Instructions: </span>
                        {medication.instructions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Information */}
          {treatment.doctor && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Doctor</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {treatment.doctor.firstName?.[0]}{treatment.doctor.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                      </h4>
                      {treatment.doctor.primarySpecialty && (
                        <p className="text-xs text-muted-foreground">{treatment.doctor.primarySpecialty}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Phone className="h-3 w-3" />
                    Contact
                  </Button>
                </div>
                
                {/* Doctor Details */}
                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {treatment.doctor.email && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{treatment.doctor.email}</span>
                    </div>
                  )}
                  {treatment.doctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{treatment.doctor.phone}</span>
                    </div>
                  )}
                  {treatment.doctor.licenseNumber && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">License:</span>
                      <span className="text-foreground font-mono">{treatment.doctor.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pharmacy Information */}
          {treatment.pharmacy && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Pharmacy</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">{treatment.pharmacy.name}</h4>
                  {treatment.pharmacy.chainName && (
                    <p className="text-xs text-muted-foreground">{treatment.pharmacy.chainName}</p>
                  )}
                  {treatment.pharmacy.address && (
                    <p className="text-xs text-muted-foreground">
                      {treatment.pharmacy.address.street}, {treatment.pharmacy.address.city}, {treatment.pharmacy.address.state} {treatment.pharmacy.address.zipCode}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {treatment.medicationDetails?.length || 0} prescription{(treatment.medicationDetails?.length || 0) !== 1 ? 's' : ''} sent
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Standalone Medications */}
          {standaloneMedications.length > 0 && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Additional Medications</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {standaloneMedications.length} {standaloneMedications.length === 1 ? 'Medication' : 'Medications'}
                </Badge>
              </div>
              <div className="space-y-3">
                {standaloneMedications.map((medication) => {
                  const dosageDisplay = medication.dosage;
                  const frequencyDisplay = medication.frequency;

                  const getStatusColor = (status: string) => {
                    return status === 'active'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20';
                  };

                  return (
                    <div key={medication._id} className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
                      {/* Medication Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                            <Pill className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {medication.medicationName}
                            </h4>
                            <p className="text-xs text-muted-foreground">Additional medication</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(medication.status))}>
                          {medication.status}
                        </Badge>
                      </div>

                      {/* Medication Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Dosage:</span>
                            <span className="text-foreground">{dosageDisplay}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Schedule:</span>
                            <span className="text-foreground">{frequencyDisplay}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {medication.doctor && (
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Prescribed by:</span>
                              <span className="text-foreground">Dr. {medication.doctor.firstName} {medication.doctor.lastName}</span>
                            </div>
                          )}
                          {medication.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Started:</span>
                              <span className="text-foreground">{new Date(medication.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      {medication.instructions && (
                        <div className="p-2 bg-background rounded border">
                          <p className="text-xs text-foreground">
                            <span className="font-medium">Instructions: </span>
                            {medication.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prescription Orders */}
          {prescriptionOrders && prescriptionOrders.length > 0 && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Your Prescription Orders</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {prescriptionOrders.length} {prescriptionOrders.length === 1 ? 'Order' : 'Orders'}
                </Badge>
              </div>
              <div className="space-y-3">
                {prescriptionOrders.map((order, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
                    {/* Order Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-foreground">{order.medicationDetails.name}</h4>
                          <Badge variant="outline" className={cn("text-xs", getOrderStatusColor(order.status))}>
                            {getOrderStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{getOrderStatusMessage(order.status)}</p>
                      </div>
                      {order.estimatedReadyTime && order.status !== "picked_up" && order.status !== "delivered" && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Expected Ready</p>
                          <p className="text-xs font-medium text-foreground">
                            {new Date(order.estimatedReadyTime).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Medication Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Pill className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">Your Medication</span>
                        </div>
                        <p className="text-foreground">{order.medicationDetails.dosage}</p>
                        <p className="text-muted-foreground">Quantity: {order.medicationDetails.quantity}</p>
                        {order.medicationDetails.refills > 0 && (
                          <p className="text-muted-foreground">Refills: {order.medicationDetails.refills}</p>
                        )}
                      </div>

                      {/* Pharmacy Details */}
                      {order.pharmacy && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-muted-foreground">Your Pharmacy</span>
                          </div>
                          <p className="text-foreground font-medium">{order.pharmacy.name}</p>
                          {order.pharmacy.chainName && (
                            <p className="text-muted-foreground">{order.pharmacy.chainName}</p>
                          )}
                          {order.pharmacy.address && (
                            <p className="text-muted-foreground">
                              {order.pharmacy.address.street}, {order.pharmacy.address.city}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Delivery Method */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {order.deliveryMethod === "delivery" ? 
                            <Truck className="h-3 w-3 text-muted-foreground" /> : 
                            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          }
                          <span className="font-medium text-muted-foreground">How You'll Get It</span>
                        </div>
                        <p className="text-foreground capitalize">{order.deliveryMethod}</p>
                        {order.deliveryMethod === "delivery" && order.deliveryAddress && (
                          <p className="text-muted-foreground">
                            Delivering to: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          </p>
                        )}
                        {order.deliveryMethod === "pickup" && (
                          <p className="text-muted-foreground">Pick up at pharmacy location</p>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    {order.medicationDetails.instructions && (
                      <div className="p-2 bg-primary/5 rounded border border-primary/20">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">Important Instructions</span>
                        </div>
                        <p className="text-xs text-foreground">{order.medicationDetails.instructions}</p>
                      </div>
                    )}

                    {/* Pharmacy Notes */}
                    {order.pharmacyNotes && (
                      <div className="p-2 bg-background rounded border">
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">Message from Pharmacy</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{order.pharmacyNotes}</p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                      {order.actualReadyTime && (
                        <span>Ready: {new Date(order.actualReadyTime).toLocaleDateString()}</span>
                      )}
                      {order.pickedUpAt && (
                        <span>Picked up: {new Date(order.pickedUpAt).toLocaleDateString()}</span>
                      )}
                      {order.deliveredAt && (
                        <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";