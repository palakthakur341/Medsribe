"use client";

import * as React from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { MiniChart, ProgressRing } from "@/components/ui/mini-chart";
import {
  Users,
  Calendar,
  FileText,
  Heart,
  Activity,
  Stethoscope
} from "lucide-react";

interface DashboardStatsProps {
  userRole: "doctor" | "patient";
  data?: {
    patients?: number;
    appointments?: number;
    records?: number;
    soapNotes?: number;
    healthScore?: number;
    vitals?: {
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
    };
    trends?: {
      patients?: number[];
      appointments?: number[];
      records?: number[];
    };
  };
}

export function DashboardStats({ userRole, data }: DashboardStatsProps) {
  const mockData = {
    patients: data?.patients || 24,
    appointments: data?.appointments || 8,
    records: data?.records || 156,
    soapNotes: data?.soapNotes || 12,
    healthScore: data?.healthScore || 85,
    vitals: {
      heartRate: data?.vitals?.heartRate || 72,
      bloodPressure: data?.vitals?.bloodPressure || "120/80",
      temperature: data?.vitals?.temperature || 98.6,
    },
    trends: {
      patients: data?.trends?.patients || [18, 20, 22, 19, 24, 26, 24],
      appointments: data?.trends?.appointments || [5, 8, 6, 10, 12, 8, 8],
      records: data?.trends?.records || [120, 135, 142, 148, 152, 155, 156],
    },
  };

  const cardClass = "p-3 sm:p-4 rounded-lg shadow-sm bg-card border border-border";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {userRole === "doctor" ? (
        <>
          <MetricCard
            className={cardClass}
            title="Total Patients"
            value={mockData.patients}
            change={{ value: 12.5, type: "increase", period: "vs last month" }}
            icon={<Users className="h-4 w-4" />}
            description="Active patients"
            chart={
              <MiniChart
                data={mockData.trends.patients.map(v => ({ value: v }))}
                type="area"
                color="hsl(var(--chart-1))"
              />
            }
          />
          <MetricCard
            className={cardClass}
            title="Today's Appointments"
            value={mockData.appointments}
            change={{ value: -5.2, type: "decrease", period: "vs yesterday" }}
            icon={<Calendar className="h-4 w-4" />}
            description="Consultations today"
            status={mockData.appointments > 10 ? "warning" : "success"}
            chart={
              <MiniChart
                data={mockData.trends.appointments.map(v => ({ value: v }))}
                type="bar"
                color="hsl(var(--chart-2))"
              />
            }
          />
          <MetricCard
            className={cardClass}
            title="Medical Records"
            value={mockData.records}
            change={{ value: 8.1, type: "increase", period: "this week" }}
            icon={<FileText className="h-4 w-4" />}
            description="Patient files"
            chart={
              <MiniChart
                data={mockData.trends.records.map(v => ({ value: v }))}
                type="line"
                color="hsl(var(--chart-3))"
              />
            }
          />
          <MetricCard
            className={cardClass}
            title="SOAP Notes"
            value={mockData.soapNotes}
            change={{ value: 15.3, type: "increase", period: "this week" }}
            icon={<Stethoscope className="h-4 w-4" />}
            description="This week"
            status="info"
          />
        </>
      ) : (
        <>
          <MetricCard
            className={cardClass}
            title="Health Score"
            value={`${mockData.healthScore}%`}
            change={{ value: 3.2, type: "increase", period: "this month" }}
            icon={<Heart className="h-4 w-4" />}
            description="Overall rating"
            status={
              mockData.healthScore >= 80
                ? "success"
                : mockData.healthScore >= 60
                ? "warning"
                : "error"
            }
            chart={
              <ProgressRing
                value={mockData.healthScore}
                size={44}
                strokeWidth={3}
                color={
                  mockData.healthScore >= 80
                    ? "hsl(var(--chart-1))"
                    : mockData.healthScore >= 60
                    ? "hsl(var(--chart-4))"
                    : "hsl(var(--destructive))"
                }
              >
                <span className="text-xs font-semibold">{mockData.healthScore}%</span>
              </ProgressRing>
            }
          />
          <MetricCard
            className={cardClass}
            title="Heart Rate"
            value={`${mockData.vitals.heartRate} BPM`}
            change={{ value: -2.1, type: "decrease", period: "vs last" }}
            icon={<Activity className="h-4 w-4" />}
            description="Recent check"
            status={
              mockData.vitals.heartRate >= 60 && mockData.vitals.heartRate <= 100
                ? "success"
                : "warning"
            }
          />
          <MetricCard
            className={cardClass}
            title="Blood Pressure"
            value={mockData.vitals.bloodPressure}
            icon={<Heart className="h-4 w-4" />}
            description="Latest"
            status="success"
          />
          <MetricCard
            className={cardClass}
            title="SOAP Notes"
            value={mockData.soapNotes}
            change={{ value: 25.0, type: "increase", period: "this month" }}
            icon={<FileText className="h-4 w-4" />}
            description="Note entries"
            status="info"
          />
        </>
      )}
    </div>
  );
}

interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
  }>;
  className?: string;
}

export function QuickStats({ stats, className = "" }: QuickStatsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 sm:p-3 rounded-md bg-card border border-border shadow-sm"
        >
          {stat.icon && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{
                backgroundColor: stat.color ? `${stat.color}20` : 'hsl(var(--primary) / 0.1)',
                color: stat.color || 'hsl(var(--primary))',
              }}
            >
              {stat.icon}
            </div>
          )}
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}