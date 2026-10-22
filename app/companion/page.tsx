"use client";
/**
 * MedScribe 2.0 Personal Companion Page (Single File Component)
 * Theme-aware version matching main landing page design system
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
    Shield,
    ArrowRight,
    Brain,
    User,
    MessageSquare,
    ArrowUpRight,
    Bot,
    Activity,
    Clock,
    Globe,
    HeartPulse,
    Database,
    FileText,
    Lock,
    Calendar,
    Pill,
    Target,
    ClipboardList,
    CheckCircle,
    Sun,
    Moon,
    Menu,
    X,
    Stethoscope,
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



// Simple Bento Card Component with Parallax Hover Effect (FROM MAIN LANDING PAGE)
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

// --- RAG Processing Simulator (Combined Visual) ---

interface Message {
    id: number;
    role: 'user' | 'assistant';
    text: string;
    time: string;
}

const RAGProcessingSimulator: React.FC = () => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<'idle' | 'reading' | 'thinking' | 'replying'>('idle');
    const [mounted, setMounted] = useState(false);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        let isMounted = true;
        setMounted(true);

        const simulateChat = async () => {
            while (isMounted) {

                setMessages([]);
                setStatus('idle');

                await delay(1000);
                if (!isMounted) return;

                setMessages([{
                    id: 1,
                    role: 'user',
                    text: "What's my follow-up plan for my hypertension, based on the last visit?",
                    time: "10:42 AM"
                }]);

                await delay(500);
                if (!isMounted) return;
                setStatus("reading");

                await delay(2000);
                if (!isMounted) return;

                setStatus("thinking");

                await delay(1800);
                if (!isMounted) return;

                setStatus("replying");

                setMessages(prev => [...prev, {
                    id: 2,
                    role: 'assistant',
                    text: "Based on your last SOAP note, your Plan includes continuing Lisinopril 10mg daily and scheduling a follow-up BP check in 4 weeks. Dr. Sharma also recommended starting a low-sodium diet immediately.",
                    time: "10:43 AM"
                }]);

                await delay(100);
                setStatus("idle");

                await delay(5000);
                if (!isMounted) return;
            }
        };

        simulateChat();

        return () => {
            isMounted = false;
            setMounted(false);
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

    interface ModuleProps {
        icon: React.ElementType;
        title: string;
        isActive: boolean;
        activeColor: string;
        inactiveColor?: string;
    }

    const Module: React.FC<ModuleProps> = ({ icon: Icon, title, isActive, activeColor, inactiveColor = "bg-muted text-muted-foreground" }) => {
        const shadowClass = isActive
            ? activeColor.includes('chart-3') ? 'shadow-lg shadow-[hsl(var(--chart-3))]/30' :
                activeColor.includes('chart-4') ? 'shadow-lg shadow-[hsl(var(--chart-4))]/30' :
                    activeColor.includes('primary') ? 'shadow-lg shadow-primary/30' : 'shadow-none'
            : 'shadow-none';

        return (
            <div className={cn(
                "relative overflow-hidden rounded-xl border p-5 transition-all duration-500 flex items-center gap-4 group",
                "bg-card border-border opacity-50 grayscale hover:grayscale-0 hover:opacity-100",
                isActive && `border-primary/20 scale-105 z-20 opacity-100 grayscale-0`,
                shadowClass
            )}>
                <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isActive ? `bg-primary/20 ${activeColor}` : inactiveColor
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-medium text-foreground">{title}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-1">
                        {isActive ? <span className={cn(activeColor, 'animate-pulse')}>Active...</span> : "Idle"}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="w-full h-[550px] flex flex-col relative overflow-hidden">

            <div className="flex-1 flex flex-col md:flex-row justify-between items-stretch">

                {/* LEFT: THE STACK (Modules) */}
                <div className="w-full md:w-[320px] p-4 flex flex-col gap-4 relative z-10 shrink-0">
                    <div className="flex items-center justify-between mb-2 pl-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">System Context</div>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="w-1 h-1 rounded-full bg-border" />
                        </div>
                    </div>

                    <Module
                        icon={FileText}
                        title="Knowledge Base"
                        isActive={status === 'reading'}
                        activeColor="text-[hsl(var(--chart-3))]"
                    />

                    <Module
                        icon={FileText}
                        title="Knowledge Base"
                        isActive={status === 'reading'}
                        activeColor="text-[hsl(var(--chart-3))]"
                    />

                    <Module
                        icon={Brain}
                        title="LLM Reasoning"
                        isActive={status === 'thinking'}
                        activeColor="text-[hsl(var(--chart-4))]"
                    />

                    <Module
                        icon={Lock}
                        title="Security Persona"
                        isActive={status === 'replying'}
                        activeColor="text-primary"
                    />
                </div>

                {/* CENTER: DATA BRIDGE */}
                <div className="hidden md:flex w-[120px] shrink-0 items-center justify-center relative px-4">
                    <div className="w-full h-px bg-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                        {status !== 'idle' && (
                            <div
                                style={{ animation: 'dataflow 1.5s linear infinite' }}
                                className={cn(
                                    "absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-transparent opacity-50 blur-sm",
                                    status === 'reading' ? "via-[hsl(var(--chart-3))]" :
                                        status === 'thinking' ? "via-[hsl(var(--chart-4))]" : "via-primary"
                                )}
                            />
                        )}
                    </div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className={cn(
                            "w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center transition-all duration-500",
                            status !== 'idle' ? "shadow-[0_0_30px_-5px_hsl(var(--primary)_/_0.3)] scale-110 border-primary/20" : "opacity-50"
                        )}>
                            <ArrowRight className={cn(
                                "w-4 h-4 transition-colors duration-300",
                                status === 'reading' ? "text-[hsl(var(--chart-3))]" :
                                    status === 'thinking' ? "text-[hsl(var(--chart-4))]" :
                                        status === 'replying' ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: CHAT INTERFACE */}
                <div className="flex-1 flex flex-col h-full bg-background rounded-3xl p-2 border border-border overflow-hidden md:w-2/3">

                    {/* Chat Header */}
                    <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md shrink-0">
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

                    {/* Chat Body */}
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

                    {/* Input Placeholder */}
                    <div className="p-4 border-t border-border bg-background/50 shrink-0">
                        <div className="h-12 rounded-full bg-card/50 border border-primary/20 flex items-center px-5 justify-between hover:border-primary/50 transition-colors cursor-text group">
                            <span className="text-muted-foreground text-sm group-hover:text-foreground/70 transition-colors">Ask follow-up...</span>
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dataflow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

// Unified RAG Showcase Section
const UnifiedRAGShowcase: React.FC<NavigationProps> = ({ handleNavigation }) => {
    return (
        <section className="py-24 px-4 md:px-6">
            <div className="w-full mx-auto max-w-7xl">

                <div className="mb-16 max-w-3xl mx-auto text-center">
                    <div className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">The Neural Core</div>
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tight mb-6 text-foreground leading-[1.1]">
                        Visualizing Context: Live Processing Chain
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Watch the Companion retrieve, reason, and respond in real-time. This live view shows the precise moment RAG documents are accessed and fused with the LLM's logic to generate a grounded answer.
                    </p>
                </div>

                <div className="rounded-[2.5rem] p-4 md:p-8 relative overflow-hidden min-h-[600px] flex items-center justify-center ">
                    <div className="relative z-10 w-full h-full max-w-7xl">
                        <RAGProcessingSimulator />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Companion Core Feature Grid Section (MATCHING MAIN LANDING PAGE STYLE)
const CompanionCoreFeatures: React.FC = () => {
    return (
        <section className="py-24 bg-background">
            <div className="w-full mx-auto max-w-7xl">

                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
                        Intelligence That Understands Your Health.
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        The Personal Companion is integrated deeply into MedScribe's orchestration layer, providing contextually relevant and HIPAA-compliant assistance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Card 1: Deep Context */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={Brain}
                            title="Deep Context-Awareness"
                            description="Utilizes RAG to ground every response in your specific medical files (SOAP notes, Rx history, treatment plans)."
                            secondaryContent="Most Popular"
                            dark={true}
                            isFeatured={true}
                        />
                    </div>

                    {/* Card 2: Role-Based */}
                    <SimpleBentoCard
                        icon={User}
                        title="Role-Based Guidance"
                        description="Provides tailored assistants for doctors (clinical support) and patients (health education), ensuring appropriate content."
                        secondaryContent="Dual Mode"
                        dark={true}
                    />

                    {/* Card 3: Instant Retrieval */}
                    <SimpleBentoCard
                        icon={Clock}
                        title="Instant Information Retrieval"
                        description="Get answers to complex clinical or historical questions in seconds, reducing manual chart review time."
                        secondaryContent="Fast"
                        dark={false}
                    />

                    {/* Card 4: Safety Checks */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={HeartPulse}
                            title="Built-in Safety Checks"
                            description="AI actively cross-references allergies and drug interactions when discussing treatment plans or medications."
                            secondaryContent="Safety AI"
                            dark={true}
                            isFeatured={true}
                        />
                    </div>

                    {/* Card 5: Specialty Logic */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={MessageSquare}
                            title="Seamless Chat Management"
                            description="Conversations are secured, threaded, and archived using robust Convex APIs for complete auditability."
                            secondaryContent="Secure"
                            dark={true}
                        />
                    </div>

                    <SimpleBentoCard
                        icon={Globe}
                        title="Specialty-Specific Logic"
                        description="Learns and adapts its vocabulary and knowledge base based on the medical specialty being served."
                        secondaryContent="Adaptive"
                        dark={false}
                    />

                </div>
            </div>
        </section>
    )
}

// Integration Points Grid (MATCHING MAIN LANDING PAGE BENTO STYLE)
const IntegrationPointsGrid: React.FC<NavigationProps> = ({ handleNavigation }) => {
    return (
        <section className="py-24 bg-background border-t border-border">
            <div className="w-full mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <div className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">Platform Connections</div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-[1.1]">
                        Seamless Integration Points
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        The Companion automatically embeds data from every critical clinical module, ensuring its knowledge base is always complete and up-to-date.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <SimpleBentoCard
                        icon={FileText}
                        title="SOAP Notes"
                        description="Historical clinical documentation automatically indexed and searchable."
                        secondaryContent="Indexed"
                        dark={false}
                    />

                    <SimpleBentoCard
                        icon={Calendar}
                        title="Appointments"
                        description="Scheduling and visit context integrated for timeline awareness."
                        secondaryContent="Real-time"
                        dark={true}
                    />

                    <SimpleBentoCard
                        icon={ClipboardList}
                        title="Medical History"
                        description="Chronic conditions and allergies cross-referenced instantly."
                        secondaryContent="Safety"
                        dark={true}
                    />

                    <SimpleBentoCard
                        icon={Target}
                        title="Referrals"
                        description="Specialist consultations and context automatically included."
                        secondaryContent="Connected"
                        dark={false}
                    />

                    <SimpleBentoCard
                        icon={Pill}
                        title="Prescriptions"
                        description="Medication history and interactions available for guidance."
                        secondaryContent="Drug DB"
                        dark={true}
                    />

                    <SimpleBentoCard
                        icon={Clock}
                        title="Treatment Plans"
                        description="Ongoing care protocols tracked and referenced in conversations."
                        secondaryContent="Active"
                        dark={false}
                    />
                </div>
            </div>
        </section>
    );
};

// Final CTA Section
const FinalCTASection: React.FC<NavigationProps> = ({ handleNavigation }) => (
    <section className="py-24 px-4 md:px-6 bg-card border-t border-border">
        <div className="w-full mx-auto max-w-4xl flex flex-col text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground leading-[1.1]">
                Ready for truly intelligent assistance?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Transform your clinical workflow and empower both doctors and patients with context-aware, HIPAA-compliant AI.
            </p>
            <div className="">
                <Button
                    onClick={() => handleNavigation('/auth/select-role')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-5 text-lg rounded-full font-bold transition-all hover:scale-[1.03] shadow-xl shadow-primary/30"
                >
                    Get Started <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
            </div>
        </div>
    </section>
);

// Main Companion Page Component
const CompanionPage = () => {
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
        handleNavigation('/auth/select-role');
    };

    return (
        <div className="min-h-screen z-10 bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden transition-colors duration-300">

            {/* Background Pattern - Same as landing page */}
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
                    --gradient-center: rgba(255, 255, 255, 0.3);
                }

                .dark {
                    --dot-color: rgba(255, 255, 255, 0.08);
                    --gradient-center: rgba(255, 255, 255, 0.15);
                }
            `}</style>

            {/* Navigation Header */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md py-4 border-b border-border' : 'bg-transparent py-6'}`}>
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

            <main className="container mx-auto px-4 py-6 max-w-[1400px]">


                {/* Hero Section */}
                <section className="mb-12 overflow-hidden min-h-[90vh] flex items-center relative">
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
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border-border border text-xs font-medium mb-8 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                RAG-Enhanced Medical Guidance
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight mb-8 leading-[1.1] text-foreground">
                                Your Personal Companion for Clinical Context.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                                Stop searching through charts. Our AI instantly retrieves, analyzes, and explains information directly from your private, HIPAA-compliant medical history.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleEnroll}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
                                >
                                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Right Dashboard - Adjusted placement to reveal the gradient behind it */}
                        <div className="relative hidden md:block lg:absolute lg:left-[50%] lg:top-3/5 lg:-translate-y-1/2 lg:w-[100%] px-4 lg:px-0 z-10">
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
                </section>


                {/* Core Features Grid */}
                <CompanionCoreFeatures />

                {/* Unified RAG Showcase Section (The Neural Core) (MATCHING MAIN LANDING PAGE STYLE) */}
                <UnifiedRAGShowcase handleNavigation={handleNavigation} />

                {/* Integration Points Grid */}
                <IntegrationPointsGrid handleNavigation={handleNavigation} />

                {/* Final CTA Section */}
                <FinalCTASection handleNavigation={handleNavigation} />

            </main>

            <footer className="mt-12 bg-card rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden border border-border shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-md">
                        <h2 className="text-4xl font-serif font-bold mb-6 text-foreground">Ready to transform your practice?</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Join the future of orchestrated clinical care. See how MedScribe fits seamlessly into your workflow.
                        </p>
                        <button onClick={handleEnroll} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-bold transition-colors shadow-xl">
                            Get Started
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-12 text-sm text-muted-foreground">
                        <ul className="space-y-4">
                            <li className="text-foreground font-bold mb-2">Platform</li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">Features</button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">Pricing</button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">Blog</button>
                            </li>
                        </ul>
                        <ul className="space-y-4">
                            <li className="text-foreground font-bold mb-2">Company</li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">Our Mission</button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">Contact</button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('/')} className="hover:text-primary transition-colors">HIPAA Compliance</button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
                    <p>© 2024 MedScribe Inc. | All rights reserved.</p>
                    <div className="flex gap-4">
                        <button onClick={() => handleNavigation('/privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
                        <button onClick={() => handleNavigation('/terms')} className="hover:text-primary transition-colors">Terms of Service</button>
                    </div>
                </div>

                {/* Abstract glow effect */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            </footer>


        </div>
    );
};

export default CompanionPage;