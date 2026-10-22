import { Id } from "@/convex/_generated/dataModel";

// Core treatment interfaces
export interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
  userId?: Id<"users">;
  email?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  userId: Id<"users">;
  email?: string;
}

export interface PharmacyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Pharmacy {
  _id: Id<"pharmacies">;
  name: string;
  chainName?: string;
  address?: PharmacyAddress;
  phone?: string;
  email?: string;
}

export interface Medication {
  _id: Id<"medications">;
  patientId: Id<"patients">;
  treatmentPlan?: {
    _id: Id<"treatmentPlans">;
    title: string;
  };
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: "active" | "discontinued" | "completed";
  startDate: number;
  endDate?: number;
  prescribedBy?: Id<"doctors">;
  doctor?: Doctor;
  createdAt?: number;
  updatedAt?: number;
}

// Medication details structure (matching the schema)
export interface MedicationDetails {
  name: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  ndc?: string;
  rxcui?: string;
  quantity: string;
  frequency: string;
  duration?: string;
  instructions: string;
  refills: number;
}

export interface TreatmentPlan {
  _id: Id<"treatmentPlans">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  title: string;
  diagnosis: string;
  plan: string;
  goals?: string[];
  status: "active" | "completed" | "discontinued";
  startDate: number;
  endDate?: number;
  doctor?: Doctor;
  patient?: Patient;
  pharmacy?: Pharmacy;
  medicationDetails?: MedicationDetails[]; // Updated to match schema
  medications?: Medication[]; // Keep for backward compatibility with prescriptions
  createdAt?: number;
  updatedAt?: number;
}

// Treatment filters and sorting
export type TreatmentStatus = TreatmentPlan["status"];

export interface TreatmentFilters {
  status: TreatmentStatus[];
  searchTerm: string;
  doctorId?: Id<"doctors">;
}

export type TreatmentSortBy = "date" | "title" | "status" | "doctor";
export type SortOrder = "asc" | "desc";

export interface TreatmentSort {
  sortBy: TreatmentSortBy;
  order: SortOrder;
}

// Treatment statistics
export interface TreatmentStats {
  total: number;
  active: number;
  completed: number;
  discontinued: number;
  activeMedications: number;
  totalMedications: number;
}

// Component variant types
export type TreatmentCardVariant = "default" | "compact" | "detailed";
export type TreatmentListVariant = "grid" | "list";
export type StatusVariant = "success" | "error" | "warning" | "pending";

// Hook return types
export interface UsePatientAuthReturn {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  isLoading: boolean;
  isAuthenticated: boolean;
  isPatient: boolean;
  user: any;
  patientProfile: Patient | undefined;
  redirectToLogin: () => void;
}

export interface UsePatientTreatmentsReturn {
  treatmentPlans: TreatmentPlan[] | undefined;
  medications: Medication[] | undefined;
  treatmentsWithMedications: TreatmentPlan[];
  standaloneMedications: Medication[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  stats: TreatmentStats;
}

// Component props interfaces
export interface TreatmentCardProps {
  treatment: TreatmentPlan;
  variant?: TreatmentCardVariant;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface TreatmentListProps {
  treatments: TreatmentPlan[];
  selectedTreatment?: TreatmentPlan | null;
  onSelectTreatment?: (treatment: TreatmentPlan) => void;
  variant?: TreatmentListVariant;
  emptyState?: React.ReactNode;
  className?: string;
  maxItems?: number;
  isLoading?: boolean;
}

export interface TreatmentDetailsProps {
  treatment: TreatmentPlan | null;
  standaloneMedications?: Medication[];
  onViewTreatment?: (treatment: TreatmentPlan) => void;
  className?: string;
}

export interface TreatmentStatsProps {
  stats: TreatmentStats;
  isLoading?: boolean;
  className?: string;
}

export interface TreatmentFiltersProps {
  filters: TreatmentFilters;
  onFiltersChange: (filters: TreatmentFilters) => void;
  stats: TreatmentStats;
  className?: string;
}

export interface TreatmentEmptyStateProps {
  type: "treatments" | "medications";
  searchTerm?: string;
  statusFilter?: TreatmentStatus;
  className?: string;
}

// Utility types
export interface TreatmentFormData {
  title: string;
  diagnosis: string;
  plan: string;
  goals: string[];
  status: TreatmentStatus;
  startDate: number;
  endDate?: number;
}

// Loading and error states
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error: Error | null;
}

// Pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface TreatmentListState {
  treatments: TreatmentPlan[];
  pagination: PaginationState;
  filters: TreatmentFilters;
  sort: TreatmentSort;
  loading: boolean;
  error: Error | null;
}

// Event types
export type TreatmentEventType = "created" | "updated" | "completed" | "discontinued";

export interface TreatmentEvent {
  type: TreatmentEventType;
  treatmentId: Id<"treatmentPlans">;
  timestamp: number;
  data: any;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  role?: string;
}

// Theme and styling types
export interface TreatmentTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    muted: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}
