import {
  LayoutDashboard,
  Users,
  Calendar,
  Mic,
  History,
  Share,
  UserPlus,
  Bot,
  Activity,
  MessageCircle,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  items?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Doctor Navigation Configuration
export const doctorNavigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/doctor",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "AI Assistant",
    items: [
      {
        title: "Medical Assistant",
        href: "/doctor/assistant",
        icon: Bot,
      },
    ],
  },
  {
    title: "Patient Management",
    items: [
      {
        title: "Patients",
        href: "/doctor/patients",
        icon: Users,
      },
      {
        title: "Appointments",
        href: "/doctor/appointments",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Patient Chat",
        href: "/doctor/chat",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Medical Records",
    items: [
      {
        title: "Shared SOAP Notes",
        href: "/doctor/shared-soap",
        icon: Share,
      },
      {
        title: "Referrals",
        href: "/doctor/referrals",
        icon: UserPlus,
      },
    ],
  },
];

// Patient Navigation Configuration
export const patientNavigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/patient",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "AI Assistant",
    items: [
      {
        title: "Medical Assistant",
        href: "/patient/assistant",
        icon: Bot,
      },
    ],
  },
  {
    title: "Medical Notes",
    items: [
      {
        title: "Create SOAP Note",
        href: "/patient/soap/generate",
        icon: Mic,
      },
      {
        title: "My SOAP Notes",
        href: "/patient/soap/history",
        icon: History,
      },
    ],
  },
  {
    title: "Healthcare",
    items: [
      {
        title: "Appointments",
        href: "/patient/appointments",
        icon: Calendar,
      },
      {
        title: "Treatments",
        href: "/patient/treatments",
        icon: Activity,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/patient/chat",
        icon: MessageCircle,
      },
    ],
  },
];

// Helper function to get navigation based on user role
export function getNavigationForRole(role: "doctor" | "patient"): NavSection[] {
  return role === "doctor" ? doctorNavigation : patientNavigation;
}

// Helper function to find current route info
export function findCurrentRoute(navigation: NavSection[], pathname: string) {
  for (const section of navigation) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { section: section.title, item: item.title };
      }
    }
  }
  return null;
}
