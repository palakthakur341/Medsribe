import { Id } from "@/convex/_generated/dataModel";

// Core appointment interfaces
export interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
  userId?: Id<"users">;
}

export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  userId: Id<"users">;
  email?: string;
}

export interface AppointmentLocation {
  type: "in_person" | "telemedicine";
  address?: string;
  room?: string;
  meetingLink?: string;
}

export interface Appointment {
  _id: Id<"appointments">;
  doctorPatientId: Id<"doctorPatients">;
  appointmentDateTime: number;
  duration: number;
  timeZone: string;
  appointmentType: "new_patient" | "follow_up" | "consultation" | "procedure" | "telemedicine" | "emergency";
  visitReason: string;
  location: AppointmentLocation;
  status: "scheduled" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
  notes?: string;
  insuranceVerified?: boolean;
  copayAmount?: number;
  doctor?: Doctor;
  patient?: Patient;
  createdAt?: number;
  updatedAt?: number;
}

// Dialog state interfaces
export interface DialogState<T = Id<"appointments">> {
  open: boolean;
  appointmentId: T | null;
}

export interface CancelDialogState extends DialogState {
  reason?: string;
}

export interface RescheduleDialogState extends DialogState {
  newDateTime?: number;
  newDuration?: number;
}

// Action loading states
export interface ActionLoadingStates {
  cancel: Record<string, boolean>;
  reschedule: Record<string, boolean>;
  join: Record<string, boolean>;
}

// Error states
export interface ActionErrors {
  cancel: Record<string, string | null>;
  reschedule: Record<string, string | null>;
  join: Record<string, string | null>;
}

// Appointment filters and sorting
export type AppointmentStatus = Appointment["status"];
export type AppointmentType = Appointment["appointmentType"];

export interface AppointmentFilters {
  status: AppointmentStatus[];
  type: AppointmentType[];
  dateRange: [Date, Date] | null;
  doctorId?: Id<"doctors">;
}

export type AppointmentSortBy = "date" | "doctor" | "type" | "status";
export type SortOrder = "asc" | "desc";

export interface AppointmentSort {
  sortBy: AppointmentSortBy;
  order: SortOrder;
}

// Appointment statistics
export interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  thisMonth: number;
  nextWeek: number;
  completionRate: number;
}

// Component variant types
export type AppointmentCardVariant = "default" | "compact" | "detailed";
export type AppointmentListVariant = "grid" | "list";
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

export interface UsePatientAppointmentsReturn {
  upcomingAppointments: Appointment[] | undefined;
  pastAppointments: Appointment[] | undefined;
  allAppointments: Appointment[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  stats: AppointmentStats;
}

export interface UseAppointmentActionsReturn {
  cancelAppointment: (appointmentId: Id<"appointments">, reason?: string) => Promise<void>;
  rescheduleAppointment: (appointmentId: Id<"appointments">, newSlotId: Id<"timeSlots">, reason?: string) => Promise<void>;
  joinCall: (meetingLink?: string) => void;
  loadingStates: ActionLoadingStates;
  errors: ActionErrors;
  clearError: (action: keyof ActionErrors, appointmentId: string) => void;
}

export interface UseAppointmentDialogsReturn {
  cancelDialog: CancelDialogState;
  rescheduleDialog: RescheduleDialogState;
  openCancelDialog: (appointmentId: Id<"appointments">) => void;
  closeCancelDialog: () => void;
  openRescheduleDialog: (appointmentId: Id<"appointments">) => void;
  closeRescheduleDialog: () => void;
}

export interface UseAppointmentFormattersReturn {
  formatDate: (timestamp: number) => string;
  formatTime: (timestamp: number) => string;
  formatDateTime: (timestamp: number) => string;
  formatRelativeDate: (timestamp: number) => string;
  getAppointmentTypeLabel: (type: AppointmentType) => string;
  getStatusLabel: (status: AppointmentStatus) => string;
  getStatusVariant: (status: AppointmentStatus) => StatusVariant;
  getDurationLabel: (duration: number) => string;
}

// Component props interfaces
export interface AppointmentCardProps {
  appointment: Appointment;
  variant?: AppointmentCardVariant;
  showActions?: boolean;
  onCancel?: (appointmentId: Id<"appointments">) => void;
  onReschedule?: (appointmentId: Id<"appointments">) => void;
  onJoin?: (meetingLink?: string) => void;
  className?: string;
}

export interface AppointmentListProps {
  appointments: Appointment[];
  variant?: AppointmentListVariant;
  showActions?: boolean;
  emptyState?: React.ReactNode;
  onCancel?: (appointmentId: Id<"appointments">) => void;
  onReschedule?: (appointmentId: Id<"appointments">) => void;
  onJoin?: (meetingLink?: string) => void;
  className?: string;
  maxItems?: number;
  virtualized?: boolean;
}

export interface AppointmentActionsProps {
  appointment: Appointment;
  onCancel?: (appointmentId: Id<"appointments">) => void;
  onReschedule?: (appointmentId: Id<"appointments">) => void;
  onJoin?: (meetingLink?: string) => void;
  loadingStates?: ActionLoadingStates;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
  className?: string;
}

export interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: Id<"appointments"> | null;
  appointment?: Appointment;
}

export interface CancelDialogProps extends AppointmentDialogProps {
  onConfirm: (appointmentId: Id<"appointments">, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export interface RescheduleDialogProps extends AppointmentDialogProps {
  onConfirm: (appointmentId: Id<"appointments">, newDateTime: number) => Promise<void>;
  isLoading?: boolean;
}

export interface QuickActionsGridProps {
  className?: string;
  variant?: "default" | "compact";
}

export interface AppointmentStatsProps {
  stats: AppointmentStats;
  isLoading?: boolean;
  className?: string;
}

export interface AppointmentEmptyStateProps {
  type: "upcoming" | "past";
  onBookAppointment?: () => void;
  className?: string;
}

// Utility types
export interface AppointmentFormData {
  appointmentType: AppointmentType;
  visitReason: string;
  appointmentDateTime: number;
  duration: number;
  locationType: "in_person" | "telemedicine";
  address?: string;
  room?: string;
  meetingLink?: string;
  notes?: string;
  insuranceVerified?: boolean;
  copayAmount?: number;
}

// API response types
export interface AppointmentActionResponse {
  success: boolean;
  error?: string;
  appointmentId?: Id<"appointments">;
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

export interface AppointmentListState {
  appointments: Appointment[];
  pagination: PaginationState;
  filters: AppointmentFilters;
  sort: AppointmentSort;
  loading: boolean;
  error: Error | null;
}

// Event types
export type AppointmentEventType = "created" | "updated" | "cancelled" | "completed" | "rescheduled";

export interface AppointmentEvent {
  type: AppointmentEventType;
  appointmentId: Id<"appointments">;
  timestamp: number;
  data: any;
}

// Performance optimization types
export interface VirtualizedListProps {
  height: number;
  itemHeight: number;
  overscan?: number;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  role?: string;
}

// Theme and styling types
export interface AppointmentTheme {
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
