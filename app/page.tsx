/**
 * MedScribe 2.0 Landing Page (Single File Component)
 *
 * This application is a fully responsive marketing page for a fictional, HIPAA-compliant
 * clinical workflow platform.
 *
 * All components, logic, and styling are contained within this file using React hooks
 * and Tailwind CSS classes with theme-aware CSS variables only.
 */

"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Stethoscope,
  Lock,
  ArrowRight,
  Menu,
  X,
  Database,
  FileText,
  Sun,
  Moon,
  Calendar,
  HeartPulse,
  User,
  MessageSquare,
  ArrowUpRight,
  Bot,
  Activity,
  Pill,
} from 'lucide-react';

// --- Interfaces ---

interface NavigationProps {
  handleNavigation: (path: string) => void;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

interface SimpleBentoCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  dark?: boolean;
  secondaryContent?: string;
  isFeatured?: boolean;
}

interface DualFeatureCardProps extends NavigationProps {
  label: string;
  heading: string;
  description: string;
  tags?: string[];
  visual: React.ReactNode | null;
  buttonText?: string;
  reversed?: boolean;
}

interface RxFeatureCardProps {
  icon: React.ElementType;
  title: string;
  innovation: string;
  description: string;
}

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  points: string[];
}

// --- Local Dependency Mocks & Utilities ---

const cn = (...classes: (string | boolean | undefined)[]): string => classes.filter(Boolean).join(' ');

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-foreground" />
      ) : (
        <Sun className="w-4 h-4 text-foreground" />
      )}
    </button>
  );
};

// Simple Button Component
const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', disabled = false, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`rounded-full transition-all duration-300 flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

// Mock Badge Component
const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <div className={`text-xs font-semibold px-4 py-2 rounded-full ${className}`}>
    {children}
  </div>
);

// Simple Bento Card Component with Parallax Hover Effect
const SimpleBentoCard: React.FC<SimpleBentoCardProps> = ({ icon: Icon, title, description, dark = false, secondaryContent, isFeatured = false }) => {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const cardBg = dark
    ? 'bg-card border-border'
    : 'bg-background border-border';

  const iconBg = dark
    ? 'bg-primary/10 text-primary'
    : 'bg-muted text-foreground';

  const badgeBg = 'bg-primary text-primary-foreground font-bold';

  return (
    <div
      className={`p-6 rounded-2xl border ${cardBg} text-foreground transition-all duration-300 flex flex-col justify-between h-full shadow-2xl hover:shadow-primary/20 cursor-pointer ${isFeatured ? 'relative z-10' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} transition-colors`}>
          <Icon size={20} />
        </div>
        {secondaryContent && (
          <div className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeBg} shadow-md`}>
            {secondaryContent}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-serif font-medium mb-1">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Reusable Dual Feature Card component
const DualFeatureCard: React.FC<DualFeatureCardProps> = ({
  label,
  heading,
  description,
  tags,
  visual,
  buttonText = "Explore",
  reversed = false,
  handleNavigation
}) => {
  return (
    <div className="rounded-[2.5rem] bg-card p-3 border border-border shadow-xl shadow-foreground/5">
      <div className={cn("grid md:grid-cols-2 gap-4 h-full", visual === null ? "md:grid-cols-1" : reversed && "md:grid-flow-col")}>

        {/* Left Side / Content */}
        <div className={cn("p-8 md:p-12 flex flex-col justify-center", visual !== null && reversed && "md:order-2")}>
          <div className="mb-6 text-sm font-medium text-primary uppercase tracking-widest">{label}</div>
          <h3 className="text-3xl md:text-4xl font-serif mb-6 text-foreground leading-tight">{heading}</h3>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {description}
          </p>

          {tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag) => (
                <Badge key={tag} className="bg-primary/10 text-primary rounded-full border border-primary/20">{tag}</Badge>
              ))}
            </div>
          )}

          <Button
            onClick={() => handleNavigation(
              label.includes("SOAP") ? "/soap" : "/companion"
            )}
            className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3"
          >
            {buttonText} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Right Side / Visual - Only rendered if 'visual' is not null */}
        {visual !== null && (
          <div className={cn(
            "bg-card text-card-foreground border border-border shadow-sm",
            "rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px]",
            reversed ? "md:order-1" : "md:order-2"
          )}>
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)_/_0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)_/_0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative z-10 h-full w-full">
              {visual}
            </div>

            <div className="mt-auto pt-8 relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse" />
                SYSTEM ACTIVE
              </div>
              <div className="text-muted-foreground text-xs font-mono">ID: 8821-X</div>
            </div>

          </div>
        )}

        {/* If visual is null, the content section takes up the full width, and the status bar is included in the footer of this block */}
        {visual === null && (
          <div className="mt-auto pt-8 relative z-10 flex items-center justify-between col-span-full pt-0 pb-8 px-8 md:px-12">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] animate-pulse" />
              SYSTEM ACTIVE
            </div>
            <div className="text-muted-foreground text-xs font-mono">HIPAA-AUDIT-READY</div>
          </div>
        )}

      </div>
    </div>
  )
}

// Dedicated visual component for the SOAP DualFeatureCard
const SOAPPipelineVisual: React.FC = () => {
  const pipelineSteps = [
    { label: "Input Processing (Audio/Text)", colorClass: "text-[hsl(var(--chart-1))]" },
    { label: "Structuring & Categorization", colorClass: "text-[hsl(var(--chart-2))]" },
    { label: "Quality Scoring (Clinical Audit)", colorClass: "text-[hsl(var(--chart-3))]" },
    { label: "Safety Validation (Rx, Allergies)", colorClass: "text-[hsl(var(--destructive))]" },
    { label: "Specialty Detection & Finalize", colorClass: "text-[hsl(var(--chart-4))]" },
  ];
  return (
    <div className="relative z-10 flex flex-col h-full justify-between">
      <h4 className="text-xl font-serif font-bold mb-6 text-foreground">
        5-Step AI Processing Pipeline
      </h4>

      <div className="flex flex-col gap-4">
        {pipelineSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card ${step.colorClass}`}>
              <span className="font-bold text-xs">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-mono text-sm text-foreground/90">{step.label}</p>
              {index < pipelineSteps.length - 1 && (
                <div className="w-px h-4 bg-border ml-4 my-1"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <FileText className="w-8 h-8 text-primary" />
        <p className="text-sm text-foreground/70">
          Output: Clinically scored, auditable SOAP Note ready for sign-off.
        </p>
      </div>
    </div>
  )
}

// New Feature Section: AI-Powered SOAP Note Generation
const AIPoweredSOAPSection: React.FC<NavigationProps> = ({ handleNavigation }) => {

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="w-full mx-auto max-w-7xl">
        <DualFeatureCard
          label="AI-Powered SOAP Automation"
          heading="Audio/Text to Clinical Documentation with Quality Scoring"
          description="MedScribe 2.0's flagship feature slashes documentation time by 30+ minutes per patient. Our RAG-enhanced AI instantly converts unstructured audio or text into comprehensive, clinically accurate SOAP notes, complete with built-in quality scoring and safety validation."
          tags={["Time Savings", "Clinical Accuracy", "Multi-Speaker Recognition", "Specialty Templates"]}
          visual={<SOAPPipelineVisual />}
          buttonText="Explore SOAP Pipeline"
          handleNavigation={handleNavigation}
        />
      </div>
    </section>
  );
};

// Dedicated visual component for the Chat Simulator
const ChatSimulatorVisual: React.FC = () => {

  // Define message structure
  interface Message {
    id: number;
    role: 'user' | 'assistant';
    text: string;
    time: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'idle' | 'reading' | 'thinking' | 'replying'>('idle');

  // Helper function to pause execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    let isMounted = true;
    const simulateChat = async () => {
      while (isMounted) {

        // 1. Reset state
        setMessages([]);
        setStatus('idle');

        await delay(1000);
        if (!isMounted) return;

        // 2. Initial User Message
        setMessages([{
          id: 1,
          role: 'user',
          text: "What's my follow-up plan for my hypertension, based on the last visit?",
          time: "10:42 AM"
        }]);

        // 3. Knowledge Retrieval (reading)
        await delay(500);
        if (!isMounted) return;
        setStatus("reading");

        await delay(2000);
        if (!isMounted) return;

        // 4. Reasoning/Tool Use (thinking/analyzing)
        setStatus("thinking");

        await delay(1800);
        if (!isMounted) return;

        // 5. Response
        setStatus("replying");

        setMessages(prev => [...prev, {
          id: 2,
          role: 'assistant',
          text: "Based on your last SOAP note, your Plan includes continuing Lisinopril 10mg daily and scheduling a follow-up BP check in 4 weeks. Dr. Sharma also recommended starting a low-sodium diet immediately.",
          time: "10:43 AM"
        }]);

        // 6. Hold and Loop
        await delay(100);
        setStatus("idle");

        await delay(5000);
        if (!isMounted) return;
      }
    };

    simulateChat();

    return () => {
      isMounted = false;
    };
  }, []);

  const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => (
    <div
      className={cn("flex transition-all duration-300", msg.role === 'user' ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg backdrop-blur-sm border relative group",
          msg.role === 'user'
            ? "bg-primary/10 text-foreground border-primary/20 rounded-tr-sm"
            : "bg-card/50 text-foreground/90 border-border rounded-tl-sm"
        )}
      >
        {msg.text}
        <div className={cn(
          "text-[9px] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5",
          msg.role === 'user' ? "right-1 text-muted-foreground" : "left-1 text-muted-foreground"
        )}>
          {msg.time}
        </div>
      </div>
    </div>
  );

  const StatusIndicator: React.FC<{ currentStatus: typeof status }> = ({ currentStatus }) => {
    if (currentStatus === 'idle' || currentStatus === 'replying') return null;

    const isReading = currentStatus === 'reading';
    const label = isReading ? "Reading Documents..." : "Analyzing Context...";
    const dotColor = isReading ? "bg-[hsl(var(--chart-3))]" : "bg-[hsl(var(--chart-4))]";
    const textColor = isReading ? "text-[hsl(var(--chart-3))]" : "text-[hsl(var(--chart-4))]";

    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2 transition-opacity duration-300">
        <div className="flex space-x-1">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]", dotColor)}></div>
          <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]", dotColor)}></div>
          <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", dotColor)}></div>
        </div>
        <span className={cn("font-mono text-[10px] uppercase tracking-wider", textColor)}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="relative z-10 h-full flex flex-col justify-between bg-background rounded-[2rem] border border-border shadow-2xl">

      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md shrink-0 rounded-t-[2rem]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-2.5 w-2.5 absolute bottom-0 right-0 bg-[hsl(var(--chart-2))] rounded-full border-2 border-background z-10" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-muted to-muted/80 flex items-center justify-center text-foreground border border-border shadow-inner">
              <Bot className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground tracking-tight">Personal Companion</div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
              <span>RAG v1.0</span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span>Connected</span>
            </div>
          </div>
        </div>
        <div className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="flex flex-col justify-end min-h-full gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              <MessageBubble msg={msg} />
            </div>
          ))}

          <StatusIndicator currentStatus={status} />
        </div>
      </div>

      <div className="p-4 border-t border-border bg-background/50 shrink-0">
        <div className="h-12 rounded-full bg-card/50 border border-primary/20 flex items-center px-5 justify-between hover:border-primary/50 transition-colors cursor-text group">
          <span className="text-muted-foreground text-sm group-hover:text-foreground/70 transition-colors">Ask follow-up...</span>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

// New Section: RAG-Enhanced Medical Assistant
export const RAGAssistantSection: React.FC<NavigationProps> = ({ handleNavigation }) => {
  return (
    <section className="py-24 px-4 md:px-6">
      <div className="w-full mx-auto max-w-7xl">
        <DualFeatureCard
          label="Context-Aware Medical Intelligence"
          heading="Personal Companion - Context-aware AI for both roles"
          description="This is NOT just a chatbot. The Personal Companion uses RAG to access your entire medical history (SOAP notes, prescriptions, treatments) to provide personalized, safe, and contextually grounded guidance—for both patients and clinical staff."
          tags={["Personalized Guidance", "Medical Education", "Symptom Analysis", "Real-Time Context"]}
          visual={<ChatSimulatorVisual />}
          buttonText="Explore Personal Companion"
          handleNavigation={handleNavigation}
          reversed={true}
        />
      </div>
    </section>
  );
};

// --- RxFeatureCard ---
const RxFeatureCard: React.FC<RxFeatureCardProps> = ({ icon: Icon, title, innovation, description }) => {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border flex flex-col h-full transition-shadow duration-300 hover:shadow-primary/30 hover:shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <h4 className="text-xl font-serif font-medium text-foreground">{title}</h4>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider font-mono">
          {innovation}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Integrated Prescription Management
export const IntegratedRxSection: React.FC<NavigationProps> = ({ handleNavigation }) => {

  const rxFeatures = [
    {
      icon: Lock,
      title: "Multi-Layer Safety Net",
      innovation: "Innovation: Multi-layer safety validation",
      description: "AI automatically runs Drug Interaction, Allergy Alerts, and History Contraindication checks *before* submission. Blocks dangerous prescriptions (Major interactions, Anaphylaxis risk) and creates a bulletproof audit trail.",
    },
    {
      icon: Activity,
      title: "Real-Time Orchestration",
      innovation: "Innovation: Convex WebSockets for instant updates",
      description: "From doctor's click to pharmacy's receipt and patient's 'ready for pickup' notification—all updates are instant. Reduces fulfillment time by 40% by eliminating phone and fax delays.",
    },
    {
      icon: Database,
      title: "Seamless Ecosystem Integration",
      innovation: "Innovation: Complete 360° patient view",
      description: "Prescriptions are automatically linked to Treatment Plans, SOAP Notes, and Appointments. This contextual data provides pharmacists with full care rationale and ensures integrated follow-up.",
    },
    {
      icon: Shield,
      title: "NDC/RxCUI Standardization",
      innovation: "Innovation: Standardized drug coding",
      description: "Uses National Drug Code (NDC) and RxNorm Concept Unique Identifier (RxCUI) to guarantee 100% accurate drug matching, eliminating confusion between generics and brands and ensuring safety database interoperability.",
    },
  ];

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="w-full mx-auto max-w-7xl">

        <div className="text-center max-w-4xl mx-auto mb-16 px-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
            Safety, Speed, Compliance
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
            Integrated Prescription Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            MedScribe 2.0 provides an end-to-end prescription lifecycle, leveraging multi-layer AI validation to achieve **near-zero medication errors** and 40% faster fulfillment time.
          </p>
        </div>

        {/* Feature Grid with Asymmetrical Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rxFeatures.map((feature, index) => {
            let colSpanClass = '';

            if (index === 0) {
              colSpanClass = 'lg:col-span-1';
            } else if (index === 1) {
              colSpanClass = 'lg:col-span-2';
            }
            else if (index === 2) {
              colSpanClass = 'lg:col-span-2';
            } else if (index === 3) {
              colSpanClass = 'lg:col-span-1';
            }

            return (
              <div key={index} className={colSpanClass}>
                <RxFeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  innovation={feature.innovation}
                  description={feature.description}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Button
            onClick={() => handleNavigation('/rx-compliance')}
            className="w-fit bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 px-8 py-3 rounded-full font-medium border transition-colors shadow-md hover:shadow-lg"
          >
            View Compliance Details <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

      </div>
    </section>
  );
};

// --- RoleCard ---
const RoleCard: React.FC<RoleCardProps> = ({ icon: Icon, title, points }) => (
  <div className="p-8 rounded-2xl bg-card border border-border flex flex-col h-full transition-shadow duration-300 hover:shadow-primary/30 hover:shadow-2xl">
    <Icon className="w-8 h-8 text-primary mb-4" />
    <h4 className="text-2xl font-serif font-bold text-foreground mb-4">{title}</h4>
    <ul className="space-y-3 text-muted-foreground list-disc list-inside ml-2">
      {points.map((point, index) => (
        <li key={index} className="text-sm leading-relaxed">{point}</li>
      ))}
    </ul>
  </div>
);

export const MultiRoleIntegrationSection: React.FC<NavigationProps> = ({ handleNavigation }) => {
  const roleData = [
    {
      icon: Stethoscope,
      title: "Doctors: Focus on Care Delivery",
      points: [
        "Manage the full clinical workflow—from appointments and SOAP notes to prescriptions and treatment plans.",
        "Always work with complete patient history and real-time updates.",
        "Intelligent safeguards built into every action, ensuring compliance.",
        "Securely collaborate with specialists and pharmacies."
      ],
    },
    {
      icon: User,
      title: "Patients: Informed and Engaged",
      points: [
        "View medical records and detailed prescriptions through the portal.",
        "Track appointments and medication fulfillment status in real-time.",
        "Receive proactive updates, reminders, and patient education materials.",
        "Access to the context-aware Personal Companion AI for guidance."
      ],
    },
    {
      icon: Pill,
      title: "Pharmacies: Verified Clinical Context",
      points: [
        "Receive verified, electronic prescriptions with full clinical context (not just drug names).",
        "See immediate safety and interaction context provided by the platform.",
        "Real-time status updates and order tracking reduce manual callbacks and delays.",
        "Enhance patient counseling with better, integrated patient history."
      ],
    },
  ];

  return (
    <section className="py-24 px-4 md:px-6 bg-background border-t border-border">
      <div className="w-full mx-auto max-w-7xl">

        <div className="text-center max-w-5xl mx-auto mb-16 px-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20 text-xs font-medium uppercase tracking-wider">
            Seamless Synchronization
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
            One Platform. Three Roles. Zero Disconnects.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            MedScribe 2.0 is built as a single, unified healthcare ecosystem—bringing doctors, patients, and pharmacies onto the same platform while preserving strict role-based access and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {roleData.map((role, index) => (
            <RoleCard key={index} icon={role.icon} title={role.title} points={role.points} />
          ))}
        </div>

        <div className="p-8 md:p-12 rounded-[2rem] bg-card border border-border text-center shadow-xl">
          <h3 className="text-3xl font-serif font-bold mb-4 text-primary">
            True Continuity of Care
          </h3>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8">
            Every action updates instantly across all roles—no refresh, no polling, no waiting. This real-time by design approach eliminates communication gaps, ensuring safer prescriptions and a superior patient experience.
          </p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="text-sm text-foreground/70 font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-[hsl(var(--destructive))]" /> STRICT ROLE-BASED ACCESS
            </div>
            <div className="text-sm text-foreground/70 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-[hsl(var(--chart-2))]" /> HIPAA COMPLIANCE GUARANTEED
            </div>
            <Button
              onClick={() => handleNavigation('/security')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3"
            >
              Review Security Architecture
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export const DoctorAccessSection: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-6">
      <div className="w-full mx-auto max-w-7xl">

        <div className="text-center max-w-5xl mx-auto mb-16 px-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))] border border-[hsl(var(--chart-4))]/20 text-xs font-medium uppercase tracking-wider">
            Patient-First Access
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
            Always-Available Care, Built Around Real Doctors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find, connect, and stay in touch with the right doctor—without friction. MedScribe 2.0 connects patients with verified, licensed doctors who are available for appointments, follow-ups, and ongoing care—supported by real-time communication and seamless scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Verified Doctors */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-0 bg-[hsl(var(--chart-4))]/5 blur-2xl rounded-2xl pointer-events-none" />
            <SimpleBentoCard
              icon={Stethoscope}
              title="Verified Doctors, Real Availability"
              description="Patients can discover doctors by specialty, experience, and availability. Live schedules ensure appointments are booked only when doctors are actually available—no waiting, no double-booking."
              secondaryContent="Live Updates"
              dark={true}
              isFeatured={true}
            />
          </div>

          {/* Card 2: Smart Scheduling */}
          <SimpleBentoCard
            icon={Calendar}
            title="Smart Appointment Scheduling"
            description="Book, reschedule, or manage appointments in real time. Time-slot based scheduling adapts instantly to doctor availability and patient needs."
            secondaryContent="Zero Conflicts"
            dark={true}
          />

          {/* Card 3: Direct Communication */}
          <SimpleBentoCard
            icon={MessageSquare}
            title="Direct, Secure Communication"
            description="Patients can message their doctors securely for follow-ups, questions, and guidance—without unnecessary visits or phone calls."
            secondaryContent="HIPAA Secure"
            dark={false}
          />

          {/* Card 4: Easy Referrals */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-0 bg-[hsl(var(--chart-4))]/5 blur-2xl rounded-2xl pointer-events-none" />
            <SimpleBentoCard
              icon={ArrowRight}
              title="Easy Referrals to Specialists"
              description="When specialist care is needed, referrals happen seamlessly: Medical context is shared securely, specialists receive the full picture, and patients stay informed at every step."
              secondaryContent="Full Context"
              dark={false}
              isFeatured={true}
            />
          </div>

          {/* Card 5: Continuous Care */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-0 bg-[hsl(var(--chart-4))]/5 blur-2xl rounded-2xl pointer-events-none" />
            <SimpleBentoCard
              icon={HeartPulse}
              title="Continuous Care, Not One-Time Visits"
              description="Doctors stay connected through follow-up appointments, prescription updates, treatment plan tracking, and ongoing health monitoring. Care doesn't end when the appointment does."
              secondaryContent="Always On"
              dark={true}
            />
          </div>

          <SimpleBentoCard
            icon={Shield}
            title="Secure Communication"
            description="Patients can message their doctors securely for follow-ups, questions, and guidance—without unnecessary visits or phone calls."
            secondaryContent="HIPAA Secure"
            dark={false}
          />
        </div>

        <div className="mt-24 p-8 md:p-12 rounded-[2rem] bg-card border border-border text-center shadow-xl">
          <h3 className="text-3xl font-serif font-bold mb-4 text-[hsl(var(--chart-4))]">
            Designed for Trust and Privacy
          </h3>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Appointment updates, messages, prescription changes, and referrals are reflected instantly, keeping patients and doctors aligned without delays. Only verified doctors are available, and all access is limited to assigned care relationships.
          </p>
        </div>

      </div>
    </section>
  );
};

// Main App Component
const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnroll = () => {
    // Start the signup flow by choosing a role, then registering
    handleNavigation('/auth/select-role');
  };

  return (
    <div className="min-h-screen z-10 bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden transition-colors duration-300">

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="pattern-dots-radial" />
        <div className="pattern-gradient" />
      </div>
      <style>{`
        .pattern-dots-radial {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(var(--dot-color) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          opacity: 1;
          mask-image: radial-gradient(ellipse at center, transparent 30%, black 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, transparent 30%, black 70%);
        }

        .pattern-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, var(--gradient-center) 0%, transparent 70%);
          opacity: 1;
        }

        :root {
          --dot-color: rgba(0, 0, 0, 0.08);
          --gradient-center: rgba(255, 255, 255, 0.4);
        }

        .dark {
          --dot-color: rgba(255, 255, 255, 0.08);
          --gradient-center: rgba(255, 255, 255, 0.15);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md py-4 border-b border-border' : 'bg-transparent py-6'
        }`}>
        <div className="container mx-auto px-6 flex justify-between items-center max-w-7xl">
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 group"
            aria-label="MedScribe home"
          >
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg transition-colors shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">
              MedScribe 2.0
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <ThemeToggle />
            <Button
              onClick={() => handleNavigation('/auth/login')}
              className="flex items-center gap-2 bg-card hover:bg-muted text-foreground px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow border border-border"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Button>
            <Button
              onClick={handleEnroll}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-lg"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Enroll Now</span>
            </Button>
          </div>

          <Button
            className="md:hidden text-foreground p-2 h-10 w-10 border border-border bg-card hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[80px] bg-background/95 backdrop-blur-md p-6 z-40 transition-transform duration-300 transform border-t border-border">
            <div className="flex flex-col gap-4 text-lg">
              <ThemeToggle />
              <button
                onClick={() => { handleNavigation('/auth/login'); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 bg-card text-foreground px-5 py-3 rounded-full text-base font-medium transition-all h-auto border border-border"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => { handleEnroll(); setMobileMenuOpen(false); }}
                className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full text-base font-medium transition-all h-auto shadow-lg"
              >
                <Stethoscope className="w-5 h-5" />
                <span>Enroll Now</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-12 max-w-[1400px]">

        {/* Hero Section */}
        <section className="mb-24">
          <div className="text-center max-w-6xl mx-auto mb-16 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border-border border text-xs font-medium mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              HIPAA Compliant. AI-Powered. Real-Time.
            </div>
            <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-8 leading-[1.1] text-foreground">
              AI-Powered, Unified Healthcare. <br className="hidden md:block" />
              Focus on Care, Not Documentation.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-generated SOAP notes, real-time appointment scheduling, and healthcare-grade security in one focused platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleEnroll}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Get Started
              </button>
              <button
              onClick={() => document.getElementById('core-features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 px-8 py-4 rounded-full font-medium border transition-colors shadow-md hover:shadow-lg"
              >
                View Core Features
              </button>
            </div>
          </div>

          {/* AI/E-Prescribing Mockup Placeholder */}
          <div className="relative w-full mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-border z-10 transform translate-y-1 shadow-2xl shadow-primary/30 transition-all duration-500 hover:scale-[1.005]">
              <img
                src="https://raw.githubusercontent.com/Heria021/hariii_suthar/refs/heads/main/public/projects/MedScribe.png"
                alt="MedScribe UI Mockup"
                className="w-full h-auto object-cover"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/18181B/FFFFFF?text=MedScribe+2.0+Clinical+Dashboard'; }}
              />
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section id="core-features" className="py-24 bg-background">

          <div className="text-center max-w-3xl mx-auto mb-16 px-4">

            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
              MedScribe Core Features
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Focused tools for faster documentation, dependable scheduling, and secure care delivery.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* Card 1: AI SOAP Note Generation */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
              <SimpleBentoCard
                icon={FileText}
                title="AI SOAP Note Generation"
                description="Speak naturally during appointments. Our AI generates complete SOAP notes in 60 seconds—with built-in quality scoring to ensure clinical accuracy. Doctors save an average of 2 hours per day on documentation—time that goes back to patient care."
                secondaryContent="Most Popular"
                dark={true}
                isFeatured={true}
              />
            </div>

            {/* Card 2: Real-Time Scheduling */}
            <SimpleBentoCard
              icon={Calendar}
              title="Real-Time Scheduling"
              description="Patients book instantly. Doctors see updates immediately. Zero double-bookings. Reschedule requests handled automatically—no phone tag required."
              secondaryContent="Convex Sync"
              dark={false}
            />

            {/* Card 3: HIPAA & Security */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
              <SimpleBentoCard
                icon={Lock}
                title="HIPAA & Security"
                description="Full HIPAA compliance with AES-256 encryption, role-based access control, and auditable logging for every action."
                secondaryContent="AES-256"
                dark={true}
              />
            </div>

          </div>

        </section>

        {/* New Feature Section 1: AI-Powered SOAP Note Generation */}
        <AIPoweredSOAPSection handleNavigation={handleNavigation} />

        {false && <section className="mb-12 overflow-hidden min-h-[90vh] flex items-center relative">
          {/* Vanishing gradient in bottom right corner - FIXED FOR VISIBILITY */}
          <div
            // Use standard -z-10 to ensure it is behind z-10 dashboard, but large enough to cover the bottom right area.
            className="absolute bottom-0 right-0 w-[100%] h-[100%] pointer-events-none -z-10"
            style={{
              // Adjusted position (at 90% 90%) and strength (0.40) to force visibility in the bottom right corner
              background: 'radial-gradient(ellipse at 90% 90%, hsl(var(--primary) / 0.40) 0%, transparent 60%)',
              filter: 'blur(150px)', // Increased blur for max effect
            }}
          ></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content (Highest Z-index) */}
            <div className="px-4 lg:pr-8 z-20">
              <div className={cn("p-8 md:p-12 flex flex-col justify-center")}>
                <div className="mb-6 text-sm font-medium text-primary uppercase tracking-widest">
                  Unified Clinical Command Center
                </div>
                <h3 className="text-3xl md:text-4xl font-serif mb-6 text-foreground leading-tight">
                  One real-time dashboard for SOAP, prescriptions, and follow-up.
                </h3>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  MedScribe 2.0 brings every clinical signal into a single, live view—appointments, SOAP notes,
                  prescriptions, and treatment plans stay perfectly in sync. No more hopping between EHR tabs,
                  portals, or inboxes; every update streams into the same canvas so your team always works off the
                  latest version of the truth.
                </p>

                {/* {tags && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {tags.map((tag) => (
                      <Badge key={tag} className="bg-primary/10 text-primary rounded-full border border-primary/20">{tag}</Badge>
                    ))}
                  </div>
                )} */}

                <Button
                  onClick={() => handleNavigation('/doctor')}
                  className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3"
                >
                  <span className="mr-2 text-sm font-medium">View Clinical Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>


            {/* Right Dashboard - Adjusted placement to reveal the gradient behind it */}
            <div className="relative lg:absolute lg:left-[50%] lg:top-3/5 lg:-translate-y-1/2 lg:w-[100%] px-4 lg:px-0 z-10">
              <div
                className="relative rounded-[2rem] overflow-hidden border border-border/50 transition-all duration-700 hover:scale-[1.02]"
                style={{
                  transform: 'rotateY(-20deg) rotateX(-18deg) rotateZ(-10deg)',
                  transformStyle: 'preserve-3d',
                  perspective: '2000px'
                }}
              >
                <div className="relative">
                  <img
                    src="https://raw.githubusercontent.com/Heria021/hariii_suthar/refs/heads/main/public/projects/MedScribe.png"
                    alt="MedScribe Dashboard"
                    className="w-full h-auto object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/18181B/FFFFFF?text=MedScribe+2.0+Clinical+Dashboard'; }}
                  />
                  {/* Fade overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, hsl(var(--background)) 0%, transparent 30%), linear-gradient(to top, hsl(var(--background)) 0%, transparent 40%)'
                    }}
                  ></div>
                </div>
              </div>
              {/* Subtle glow effect for floating feel */}
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full -z-10 opacity-40"></div>
            </div>
          </div>
        </section>}


        {/* Footer */}
        <footer className="mt-12 bg-card rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden border border-border shadow-2xl">
          <div className="relative z-10">
            <div className="max-w-md">
              <h2 className="text-4xl font-serif font-bold mb-6 text-foreground">Ready to transform your practice?</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Create secure SOAP notes, keep schedules in sync, and spend more time on patient care.
              </p>
              <button onClick={handleEnroll} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-bold transition-colors shadow-xl">
                Get Started
              </button>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
            <p>© 2026 MedScribe Inc. | All rights reserved.</p>
          </div>

          {/* Abstract glow effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        </footer>

      </main>
    </div>
  );
};

export default App;
