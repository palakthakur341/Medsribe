"use client";
/**
 * MedScribe 2.0 SOAP Generation Page (Single File Component)
 * Theme-aware version matching main landing page design system
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
    Shield,
    Stethoscope,
    ArrowRight,
    Brain,
    FileText,
    HeartPulse,
    MessageSquare,
    Target,
    ClipboardList,
    CheckCircle,
    Clock,
    Lightbulb,
    Mic,
    Activity,
    Sun,
    Moon,
    User,
    Menu,
    X,
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
        <div className="rounded-[2.5rem] bg-card border border-border shadow-xl shadow-foreground/5">
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
                        onClick={() => handleNavigation('/details')}
                        className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3"
                    >
                        {buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                {/* Right Side / Visual */}
                {visual !== null && (
                    <div className={cn(
                        "bg-card text-card-foreground border border-border shadow-sm m-2",
                        "rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px]",
                        reversed ? "md:order-1" : "md:order-2"
                    )}>
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

// --- RxFeatureCard (for Input Methods section) ---
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

// --- DYNAMIC VERTICAL FLOW VISUAL ---

interface StepProps {
    Icon: React.ElementType;
    color: string;
    badge: string;
}

const getStepProps = (index: number): StepProps => {
    const iconMap = [Mic, Stethoscope, Target, FileText, Brain, CheckCircle, ClipboardList, HeartPulse, Activity, Shield];
    const colorMap = ['text-[hsl(var(--chart-1))]', 'text-[hsl(var(--chart-2))]', 'text-[hsl(var(--chart-3))]', 'text-[hsl(var(--chart-4))]', 'text-primary', 'text-[hsl(var(--chart-1))]', 'text-[hsl(var(--chart-2))]', 'text-[hsl(var(--destructive))]', 'text-muted-foreground', 'text-primary'];

    const Icon = iconMap[index % iconMap.length];
    const color = colorMap[index % colorMap.length];

    let badge: string;
    if (index === 0) {
        badge = 'Input';
    } else if (index === 8) {
        badge = 'Output';
    } else {
        badge = `Step ${index}`;
    }

    return { Icon, color, badge };
};

const pipelineSteps = [
    { title: "Voice Note / Text Note", description: "Raw consultation data ingestion (.wav, .mp3, or text shorthand).", index: 0 },
    { title: "Medical Validation & Correction", description: "Terminology check, transcription error correction, and safety flag detection.", index: 1 },
    { title: "Specialty & Configuration Detection", description: "Determines specialty (e.g., Cardiology) to apply dynamic formatting rules.", index: 2 },
    { title: "SOAP Generation (LLM)", description: "Structured creation of Subjective, Objective, Assessment, and Plan sections.", index: 3 },
    { title: "Clinical Reasoning Enhancement", description: "Deepening diagnostic rationale and adding differential diagnoses.", index: 4 },
    { title: "Quality Metrics Calculation", description: "Scores for Completeness, Coherence, and Documentation Quality (0-100%).", index: 5 },
    { title: "Safety Check & Contraindication Analysis", description: "Final pass for drug interactions and critical symptom detection.", index: 6 },
    { title: "Final Formatting & Storage", description: "PDF generation, clinical compliance formatting, and audit trail creation.", index: 7 },
    { title: "Final SOAP Document Ready", description: "Complete, signed, and saved clinical record.", index: 8 },
];

const SOAPDynamicFlowVisual: React.FC = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const totalSteps = pipelineSteps.length;
    const stepHeight = 150;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStepIndex(prev => (prev + 1) % totalSteps);
        }, 2500);

        return () => {
            clearInterval(interval);
        };
    }, [totalSteps]);

    const translateY = (currentStepIndex - 1) * stepHeight;

    return (
        <div className="w-full h-full p-2 flex flex-col items-center justify-start">
            <div className="w-full max-w-sm h-[450px] overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150px] border-y border-primary/30 pointer-events-none z-10 opacity-50"></div>

                <div
                    className="w-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(${-translateY}px)` }}
                >
                    {pipelineSteps.map((step, index) => {
                        const { Icon, color, badge } = getStepProps(step.index);
                        const isCurrent = index === currentStepIndex;
                        const isFinalStep = index === pipelineSteps.length - 1;

                        return (
                            <div key={index} className="flex items-center h-[150px] p-2 shrink-0">

                                <div className="flex flex-col items-center mr-4 shrink-0 h-full w-10">

                                    <div className="h-1/2 w-px bg-border relative flex items-start justify-center">
                                        {isCurrent && index > 0 && <ArrowRight className="w-3 h-3 rotate-90 text-primary opacity-80 animate-pulse absolute top-0" />}
                                    </div>

                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                                        isCurrent
                                            ? `bg-primary/20 ${color} border-primary shadow-lg shadow-primary/30 scale-110`
                                            : `bg-muted ${color} border-border opacity-50 scale-100`
                                    )}>
                                        <Icon className={cn("w-5 h-5", color)} />
                                    </div>

                                    {!isFinalStep && (
                                        <div className="h-1/2 w-px bg-border"></div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className={cn(
                                        "p-4 rounded-xl border shadow-md transition-all duration-500",
                                        isCurrent
                                            ? 'bg-card border-primary shadow-xl shadow-primary/20'
                                            : 'bg-card/50 border-border opacity-60'
                                    )}>
                                        <h5 className="text-base font-semibold text-foreground mb-1">
                                            {badge}: {step.title}
                                        </h5>
                                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 text-sm font-mono text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps}
            </div>
        </div>
    );
};


// 2. Main Processing Pipeline Showcase
const SOAPVisualDualCardSection: React.FC<NavigationProps> = ({ handleNavigation }) => (
    <section className="py-24 px-4 md:px-6">
        <div className="w-full mx-auto max-w-7xl">
            <DualFeatureCard
                label="AI-Powered Workflow"
                heading="The Autonomous 9-Step Documentation Pipeline"
                description="This visualization demonstrates the end-to-end process: from raw voice or text input, through 9 critical steps of clinical reasoning and safety checks, culminating in a fully structured, quality-scored SOAP note."
                tags={["9-Step Verification", "Clinical Reasoning", "Compliance Guaranteed"]}
                visual={<SOAPDynamicFlowVisual />}
                buttonText="View AI Documentation"
                handleNavigation={handleNavigation}
                reversed={false}
            />
        </div>
    </section>
);


// 1. Core Benefits Grid (MATCHING MAIN LANDING PAGE STYLE)
const SOAPCoreBenefits: React.FC = () => {
    return (
        <section className="py-24 bg-background">
            <div className="w-full mx-auto max-w-7xl">

                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
                        Why AI-Powered Documentation?
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        MedScribe 2.0 transforms documentation from a burden into a competitive advantage, ensuring accuracy and clinical quality.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Card 1: Time Savings */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={Clock}
                            title="Time Savings Guaranteed"
                            description="Reduces clinical documentation time by an average of 30 minutes per patient encounter. More time for care, less time for charts."
                            secondaryContent="Most Popular"
                            dark={true}
                            isFeatured={true}
                        />
                    </div>

                    {/* Card 2: Safety Validation */}
                    <SimpleBentoCard
                        icon={HeartPulse}
                        title="Maximum Safety Validation"
                        description="Automatic checks for drug interactions, allergies, and dosage appropriateness during note finalization."
                        secondaryContent="AI Safety"
                        dark={true}
                    />

                    {/* Card 3: Quality Scoring */}
                    <SimpleBentoCard
                        icon={CheckCircle}
                        title="Automatic Quality Scoring"
                        description="Notes receive real-time scores for completeness, coherence, and documentation best practices."
                        secondaryContent="Quality AI"
                        dark={false}
                    />

                    {/* Card 4: Specialty Templates */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={Stethoscope}
                            title="Specialty-Specific Templates"
                            description="AI adapts vocabulary, structure, and required fields based on the detected medical specialty."
                            secondaryContent="Smart AI"
                            dark={true}
                            isFeatured={true}
                        />
                    </div>

                    {/* Card 5: Complete Auditability */}
                    <div className="md:col-span-2 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl pointer-events-none" />
                        <SimpleBentoCard
                            icon={FileText}
                            title="Complete Auditability"
                            description="Every generated note is timestamped, versioned, and stored in a HIPAA-compliant, auditable format."
                            secondaryContent="HIPAA Ready"
                            dark={false}
                            isFeatured={true}
                        />
                    </div>

                    {/* Card 6: RAG Learning */}
                    <SimpleBentoCard
                        icon={Lightbulb}
                        title="Continuous RAG Learning"
                        description="Notes feed back into the Companion's RAG system, making the AI smarter and more personalized over time."
                        secondaryContent="Deep RAG"
                        dark={true}
                    />

                </div>
            </div>
        </section>
    )
}

// 3. Input Methods (MATCHING "Integrated Prescription Management" STYLE)
const SOAPInputMethods: React.FC<NavigationProps> = ({ handleNavigation }) => {

    const inputFeatures = [
        {
            icon: MessageSquare,
            title: "Audio-to-SOAP",
            innovation: "Innovation: Hands-Free Documentation",
            description: "Record patient conversation (MP3, WAV, M4A). AI uses multi-speaker recognition to transcribe and separate patient/provider dialogue, creating structured notes without typing.",
        },
        {
            icon: ClipboardList,
            title: "Text-to-SOAP",
            innovation: "Innovation: Flexible Input",
            description: "Type bullet points or shorthand notes. AI automatically structures the data into the correct S.O.A.P. format and enhances terminology for clinical accuracy.",
        },
    ];

    return (
        <section className="py-24 px-4 md:px-6">
            <div className="w-full mx-auto max-w-7xl">

                <div className="text-center max-w-4xl mx-auto mb-16 px-4">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                        Input Flexibility
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
                        Multiple Input Methods
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Choose the method that fits your clinical style—seamless transcription or intelligent text structuring.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {inputFeatures.map((feature, index) => (
                        <RxFeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            innovation={feature.innovation}
                            description={feature.description}
                        />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button
                        onClick={() => handleNavigation('/features')}
                        className="w-fit bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 px-8 py-3 rounded-full font-medium border transition-colors shadow-md hover:shadow-lg"
                    >
                        Explore All Features <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

            </div>
        </section>
    );
};

// 4. Quality Scoring System (MATCHING MAIN LANDING PAGE BENTO STYLE)
const QualityScoringSection: React.FC = () => {
    return (
        <section className="py-24 bg-background">
            <div className="w-full mx-auto max-w-7xl">

                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <div className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                        Clinical Accountability
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground">
                        The Automated Quality Scoring System
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Never sign off on a poor note again. Our system guarantees documentation meets the highest compliance and quality standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

                    <SimpleBentoCard
                        icon={CheckCircle}
                        title="Completeness Score"
                        description="Ensures all SOAP sections are present and required clinical fields are populated with sufficient detail (0-100%)."
                        secondaryContent="0-100%"
                        dark={false}
                    />

                    <SimpleBentoCard
                        icon={Activity}
                        title="Clinical Coherence"
                        description="Validates logical flow: does Assessment match Objective findings? Does Plan address Assessment? (0-100%)."
                        secondaryContent="0-100%"
                        dark={true}
                    />

                    <SimpleBentoCard
                        icon={FileText}
                        title="Documentation Quality"
                        description="Assesses medical terminology usage, professional tone, grammar, and clarity for audit compliance."
                        secondaryContent="Audit Ready"
                        dark={true}
                    />

                    <SimpleBentoCard
                        icon={Shield}
                        title="Safety Score"
                        description="Flags red-flag symptoms and ensures allergy cross-referencing and drug interaction checks passed (Pass/Fail)."
                        secondaryContent="Pass/Fail"
                        dark={false}
                    />

                </div>
            </div>
        </section>
    );
};


// 5. Final CTA Section
const FinalCTASection: React.FC<NavigationProps> = ({ handleNavigation }) => (
    <section className="py-24 px-4 md:px-6 bg-card border-t border-border">
        <div className="w-full mx-auto max-w-4xl text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground leading-[1.1]">
                End Documentation Overload Today.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                See how AI-powered SOAP automation fits seamlessly into your clinical workflow.
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


// --- MAIN PAGE COMPONENT ---
export default function SOAPPage() {
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

            <main className="container mx-auto py-6 pb-12 max-w-[1400px]">

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
                                Flagship Feature: Clinical Documentation
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight mb-8 leading-[1.1] text-foreground">
                                AI-Powered SOAP Note Generation.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                                The secure, HIPAA-compliant solution that converts audio or text directly into structured, clinically accurate, and quality-scored documentation.
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
                </section>


                {/* 1. Core Benefits Grid */}
                <SOAPCoreBenefits />

                {/* 2. Main Processing Pipeline Showcase (Dual Card) */}
                <SOAPVisualDualCardSection handleNavigation={handleNavigation} />

                {/* 3. Input Methods */}
                <SOAPInputMethods handleNavigation={handleNavigation} />

                {/* 4. Quality Scoring System (Detailed Grid) */}
                <QualityScoringSection />

                {/* 5. Final CTA Section */}
                <FinalCTASection handleNavigation={handleNavigation} />

            </main>

            {/* Footer (Kept Intact) */}
            <footer className="mt-12 bg-card rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden border border-border shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-md">
                        <h2 className="text-4xl font-serif font-bold mb-6 text-foreground">Ready to transform your practice?</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Join the future of orchestrated clinical care. Start your HIPAA-compliant trial today.
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
}