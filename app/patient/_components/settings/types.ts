import { Id } from "@/convex/_generated/dataModel";

// Core interfaces
export interface Patient {
  _id: Id<"patients">;
  firstName?: string;
  lastName?: string;
  userId: Id<"users">;
  email?: string;
  mrn?: string;
  createdAt?: number;
}

// Settings interfaces
export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  appointmentReminders: boolean;
  reminderTiming: "1h" | "24h" | "48h";
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";
}

export interface PrivacySettings {
  dataSharing: boolean;
  analyticsOptOut: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
}

// Component props interfaces
export interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  href?: string;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface SettingsToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export interface SettingsSelectProps {
  label: string;
  description: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

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

export interface UseSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export interface UseThemeReturn {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
}

// Settings categories
export type SettingsCategory = 
  | "profile"
  | "notifications" 
  | "appearance"
  | "security"
  | "privacy"
  | "support";

export interface SettingsCategoryConfig {
  id: SettingsCategory;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SettingsItemConfig[];
}

export interface SettingsItemConfig {
  id: string;
  type: "navigation" | "toggle" | "select" | "action";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href?: string;
  badge?: string;
  disabled?: boolean;
  action?: {
    type: "button" | "switch" | "select";
    props?: any;
  };
}

// Form types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Event types
export type SettingsEventType = "updated" | "reset" | "exported";

export interface SettingsEvent {
  type: SettingsEventType;
  category: SettingsCategory;
  timestamp: number;
  data: any;
}

// Loading and error states
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error: Error | null;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  role?: string;
}

// Theme and styling types
export interface SettingsTheme {
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
