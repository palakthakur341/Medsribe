"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Pill,
  Building2,
  Hash,
  Timer,
  RefreshCw,
  Package,
  Truck,
  ShoppingCart,
  Clock,
} from "lucide-react";

interface TreatmentDetailsContentProps {
  treatment: any;
  prescriptionOrders: any[];
  onScheduleAppointment: () => void;
}

export const TreatmentDetailsContent = React.memo<TreatmentDetailsContentProps>(({
  treatment,
  prescriptionOrders,
  onScheduleAppointment,
}) => {
  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Actions Section - Standardized UI */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Treatment Actions</h2>
        </div>
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start hover:bg-muted/50 border-border/50"
            onClick={onScheduleAppointment}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Schedule Follow-up Appointment</div>
                <div className="text-sm text-muted-foreground">Book a follow-up visit for this treatment</div>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Medications - Enhanced Grid Layout */}
      {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Prescribed Medications</h2>
            <Badge variant="secondary" className="ml-auto">
              {treatment.medicationDetails.length} {treatment.medicationDetails.length === 1 ? 'Medication' : 'Medications'}
            </Badge>
          </div>
          <div className="space-y-2">
            {treatment.medicationDetails.map((medication: any, index: number) => (
              <div key={index} className="group relative bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                {/* Compact Header Row */}
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Medication Icon & Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <Pill className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground truncate">{medication.name}</h4>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-primary/5 text-primary border-primary/20">
                            {medication.strength}
                          </Badge>
                        </div>
                        {medication.genericName && (
                          <p className="text-xs text-muted-foreground truncate">Generic: {medication.genericName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <span>{medication.quantity}</span>
                    </div>
                    {medication.refills > 0 && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>{medication.refills}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span className="font-medium">{medication.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Details Grid */}
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Left: Dosage & Form */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          <span className="font-medium">Form:</span>
                        </div>
                        <span className="text-foreground capitalize">{medication.dosageForm}</span>
                      </div>
                      {medication.duration && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">Duration:</span>
                          </div>
                          <span className="text-foreground">{medication.duration}</span>
                        </div>
                      )}
                      {medication.ndc && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span className="font-medium">NDC:</span>
                          </div>
                          <span className="text-foreground font-mono">{medication.ndc}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Instructions */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 text-xs">
                        <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-muted-foreground">Instructions: </span>
                          <span className="text-foreground leading-relaxed">{medication.instructions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Footer */}
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {medication.rxcui && (
                        <span className="font-mono">RxCUI: {medication.rxcui}</span>
                      )}
                      <span className="capitalize">{medication.dosageForm} form</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <CheckCircle className="h-3 w-3" />
                      <span className="font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Orders - Pharmacy Fulfillment Details */}
      {prescriptionOrders && prescriptionOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Prescription Orders</h2>
            <Badge variant="secondary" className="ml-auto">
              {prescriptionOrders.length} {prescriptionOrders.length === 1 ? 'Order' : 'Orders'}
            </Badge>
          </div>
          <div className="space-y-3">
            {prescriptionOrders.map((order, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-3">
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{order.medicationDetails.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                    </div>
                    {order.estimatedReadyTime && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Est. Ready</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(order.estimatedReadyTime).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Medication Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <Pill className="h-3 w-3" />
                        Medication
                      </div>
                      <p className="text-sm text-foreground">{order.medicationDetails.dosage}</p>
                      <p className="text-xs text-muted-foreground">Qty: {order.medicationDetails.quantity}</p>
                    </div>

                    {/* Pharmacy Details */}
                    {order.pharmacy && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <Building2 className="h-3 w-3" />
                          Pharmacy
                        </div>
                        <p className="text-sm font-semibold text-foreground">{order.pharmacy.name}</p>
                        {order.pharmacy.chainName && (
                          <p className="text-xs text-muted-foreground">{order.pharmacy.chainName}</p>
                        )}
                      </div>
                    )}

                    {/* Delivery Method */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {order.deliveryMethod === "delivery" ? <Truck className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                        Fulfillment
                      </div>
                      <p className="text-sm text-foreground capitalize">{order.deliveryMethod}</p>
                      {order.deliveryMethod === "delivery" && order.deliveryAddress && (
                        <p className="text-xs text-muted-foreground">
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pharmacy Notes */}
                  {order.pharmacyNotes && (
                    <div className="p-3 bg-background rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Pharmacy Notes</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.pharmacyNotes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

TreatmentDetailsContent.displayName = "TreatmentDetailsContent";
