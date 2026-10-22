"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accessibility,
  Eye,
  EyeOff,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large" | "extra-large";
  contrast: "normal" | "high" | "low";
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  soundEnabled: boolean;
  focusIndicators: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  announceToScreenReader: (message: string) => void;
  playSound: (type: "success" | "error" | "info") => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "medium",
  contrast: "normal",
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  soundEnabled: false,
  focusIndicators: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size
    root.setAttribute("data-font-size", settings.fontSize);
    
    // Contrast
    root.setAttribute("data-contrast", settings.contrast);
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty("--motion-reduce", "1");
    } else {
      root.style.removeProperty("--motion-reduce");
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.setAttribute("data-focus-indicators", "true");
    } else {
      root.removeAttribute("data-focus-indicators");
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.setAttribute("data-keyboard-nav", "true");
    } else {
      root.removeAttribute("data-keyboard-nav");
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Screen reader announcements
  const announceToScreenReader = (message: string) => {
    if (!settings.screenReader) return;

    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Sound feedback
  const playSound = (type: "success" | "error" | "info") => {
    if (!settings.soundEnabled) return;

    // Create audio context for sound feedback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different types
      switch (type) {
        case "success":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        case "error":
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          break;
        case "info":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Audio feedback not available:", error);
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    playSound,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={cn(
        "accessibility-wrapper",
        settings.fontSize === "small" && "text-sm",
        settings.fontSize === "large" && "text-lg",
        settings.fontSize === "extra-large" && "text-xl",
        settings.contrast === "high" && "contrast-high",
        settings.contrast === "low" && "contrast-low",
        settings.reducedMotion && "motion-reduce"
      )}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Accessibility Control Panel Component
export const AccessibilityControls: React.FC<{ className?: string }> = ({ className }) => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
    announcement?: string
  ) => {
    updateSetting(key, value);
    if (announcement) {
      announceToScreenReader(announcement);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Accessibility className="h-4 w-4 mr-2" />
          Accessibility
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <div className="p-2 space-y-3">
          {/* Font Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Font Size</label>
            <div className="grid grid-cols-2 gap-1">
              {(["small", "medium", "large", "extra-large"] as const).map((size) => (
                <Button
                  key={size}
                  variant={settings.fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSettingChange("fontSize", size, `Font size changed to ${size}`)}
                  className="text-xs"
                >
                  <Type className="h-3 w-3 mr-1" />
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Contrast */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contrast</label>
            <div className="grid grid-cols-3 gap-1">
              {(["normal", "high", "low"] as const).map((contrast) => (
                <Button
                  key={contrast}
                  variant={settings.contrast === contrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSettingChange("contrast", contrast, `Contrast changed to ${contrast}`)}
                  className="text-xs"
                >
                  <Contrast className="h-3 w-3 mr-1" />
                  {contrast.charAt(0).toUpperCase() + contrast.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Toggle Settings */}
          <div className="space-y-2">
            <DropdownMenuItem
              onClick={() => handleSettingChange("reducedMotion", !settings.reducedMotion, 
                `Reduced motion ${!settings.reducedMotion ? "enabled" : "disabled"}`)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <MousePointer className="h-4 w-4 mr-2" />
                Reduced Motion
              </span>
              <Badge variant={settings.reducedMotion ? "default" : "outline"}>
                {settings.reducedMotion ? "On" : "Off"}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleSettingChange("screenReader", !settings.screenReader,
                `Screen reader support ${!settings.screenReader ? "enabled" : "disabled"}`)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                {settings.screenReader ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                Screen Reader
              </span>
              <Badge variant={settings.screenReader ? "default" : "outline"}>
                {settings.screenReader ? "On" : "Off"}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleSettingChange("keyboardNavigation", !settings.keyboardNavigation,
                `Keyboard navigation ${!settings.keyboardNavigation ? "enabled" : "disabled"}`)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <Keyboard className="h-4 w-4 mr-2" />
                Keyboard Navigation
              </span>
              <Badge variant={settings.keyboardNavigation ? "default" : "outline"}>
                {settings.keyboardNavigation ? "On" : "Off"}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleSettingChange("soundEnabled", !settings.soundEnabled,
                `Sound feedback ${!settings.soundEnabled ? "enabled" : "disabled"}`)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                Sound Feedback
              </span>
              <Badge variant={settings.soundEnabled ? "default" : "outline"}>
                {settings.soundEnabled ? "On" : "Off"}
              </Badge>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityProvider;
