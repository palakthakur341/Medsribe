"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "@/components/ui/action-card";
import { Calendar, Video, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickActionsGridProps } from "../types";

/**
 * Quick actions grid component for appointment-related actions
 * 
 * Features:
 * - Reusable grid of action cards
 * - Configurable variants (default, compact)
 * - Responsive design
 * - Consistent styling with existing ActionCard component
 * - Performance optimized with React.memo
 * 
 * @param props - QuickActionsGridProps
 * @returns JSX.Element
 */
export const QuickActionsGrid = React.memo<QuickActionsGridProps>(({
  className,
  variant = "default",
}) => {
  // Action configuration
  const actions = React.useMemo(() => [
    {
      title: "Book",
      description: "New appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/patient/appointments/book",
    },
    {
      title: "Virtual",
      description: "Online consultation",
      icon: <Video className="h-5 w-5" />,
      href: "/patient/appointments/virtual",
    },
    {
      title: "Emergency",
      description: "Immediate help",
      icon: <AlertCircle className="h-5 w-5" />,
      href: "/patient/emergency",
    },
  ], []);

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="text-sm font-medium">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <ActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              className="border p-3 text-xs"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("w-full space-y-3", className)}>
      <h3 className="text-base font-medium">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            href={action.href}
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
});

QuickActionsGrid.displayName = "QuickActionsGrid";

/**
 * Extended quick actions grid with additional actions
 */
interface ExtendedQuickActionsGridProps extends QuickActionsGridProps {
  showExtended?: boolean;
}

export const ExtendedQuickActionsGrid = React.memo<ExtendedQuickActionsGridProps>(({
  className,
  variant = "default",
  showExtended = false,
}) => {
  // Extended action configuration
  const extendedActions = React.useMemo(() => [
    {
      title: "Book",
      description: "New appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/patient/appointments/book",
    },
    {
      title: "Virtual",
      description: "Online consultation",
      icon: <Video className="h-5 w-5" />,
      href: "/patient/appointments/virtual",
    },
    {
      title: "Emergency",
      description: "Immediate help",
      icon: <AlertCircle className="h-5 w-5" />,
      href: "/patient/emergency",
    },
    ...(showExtended ? [
      {
        title: "History",
        description: "Past appointments",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/appointments/history",
      },
      {
        title: "Prescriptions",
        description: "View medications",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/prescriptions",
      },
      {
        title: "Records",
        description: "Medical records",
        icon: <Calendar className="h-5 w-5" />,
        href: "/patient/records",
      },
    ] : []),
  ], [showExtended]);

  const gridCols = showExtended ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-3";

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {showExtended ? "All Actions" : "Quick Actions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", gridCols)}>
          {extendedActions.map((action) => (
            <ActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              className="h-full"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ExtendedQuickActionsGrid.displayName = "ExtendedQuickActionsGrid";
