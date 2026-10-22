import { Id } from "@/convex/_generated/dataModel";

// Base types from the database
export interface Patient {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email?: string;
  mrn?: string;
  gender: string;
  dateOfBirth: string;
  primaryPhone?: string;
}

export interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primarySpecialty: string;
  licenseNumber: string;
}

export interface SOAPNote {
  _id: Id<"soapNotes">;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  qualityScore?: number;
}

export interface Referral {
  _id: Id<"referrals">;
  patient: Patient;
  fromDoctor?: Doctor;
  toDoctor?: Doctor;
  soapNote?: SOAPNote;
  reasonForReferral: string;
  clinicalQuestion?: string;
  urgency: "routine" | "urgent" | "stat";
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled" | "expired";
  specialtyRequired?: string;
  responseMessage?: string;
  createdAt: number;
  updatedAt?: number;
}

// Filter types
export interface ReferralsFilters {
  searchTerm: string;
  statusFilter: string;
}

// Hook return types
export interface UseReferralsAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  doctorProfile: Doctor | null | undefined;
}

export interface UseReferralsDataReturn {
  receivedReferrals: Referral[] | undefined;
  sentReferrals: Referral[] | undefined;
  filteredReceivedReferrals: Referral[];
  filteredSentReferrals: Referral[];
  isLoading: boolean;
  error: string | null;
  filters: ReferralsFilters;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  clearAllFilters: () => void;
}

export interface UseReferralsActionsReturn {
  selectedReferral: string | null;
  responseNotes: string;
  setSelectedReferral: (id: string | null) => void;
  setResponseNotes: (notes: string) => void;
  handleAcceptReferral: (referralId: string) => Promise<void>;
  handleDeclineReferral: (referralId: string) => Promise<void>;
  handleCompleteReferral: (referralId: string) => Promise<void>;
  handleViewSOAP: (soapNoteId: string, patientName?: string) => void;
  isProcessing: boolean;
  soapViewer: any; // UseSOAPViewerReturn type
  clearResponseForm: () => void;
}

export interface UseReferralsFormattersReturn {
  formatDate: (timestamp: number) => string;
  getUrgencyBadge: (urgency: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

// Component props types
export interface ReferralsFiltersProps {
  filters: ReferralsFilters;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface ReceivedReferralCardProps {
  referral: Referral;
  selectedReferral: string | null;
  responseNotes: string;
  onSelectReferral: (id: string | null) => void;
  onResponseNotesChange: (notes: string) => void;
  onAccept: (referralId: string) => Promise<void>;
  onDecline: (referralId: string) => Promise<void>;
  onComplete: (referralId: string) => Promise<void>;
  onViewSOAP: (soapNoteId: string, patientName?: string) => void;
  formatDate: (timestamp: number) => string;
  getUrgencyBadge: (urgency: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  isProcessing: boolean;
}

export interface SentReferralCardProps {
  referral: Referral;
  onViewSOAP: (soapNoteId: string, patientName?: string) => void;
  formatDate: (timestamp: number) => string;
  getUrgencyBadge: (urgency: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export interface ReceivedReferralsListProps {
  referrals: Referral[];
  selectedReferral: string | null;
  responseNotes: string;
  onSelectReferral: (id: string | null) => void;
  onResponseNotesChange: (notes: string) => void;
  onAccept: (referralId: string) => Promise<void>;
  onDecline: (referralId: string) => Promise<void>;
  onComplete: (referralId: string) => Promise<void>;
  onViewSOAP: (soapNoteId: string, patientName?: string) => void;
  formatDate: (timestamp: number) => string;
  getUrgencyBadge: (urgency: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  isProcessing: boolean;
  className?: string;
}

export interface SentReferralsListProps {
  referrals: Referral[];
  onViewSOAP: (soapNoteId: string, patientName?: string) => void;
  formatDate: (timestamp: number) => string;
  getUrgencyBadge: (urgency: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  className?: string;
}

export interface ReferralResponseFormProps {
  referralId: string;
  responseNotes: string;
  onResponseNotesChange: (notes: string) => void;
  onAccept: (referralId: string) => Promise<void>;
  onDecline: (referralId: string) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

// Utility types
export type ReferralStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled" | "expired";
export type ReferralUrgency = "routine" | "urgent" | "stat";
