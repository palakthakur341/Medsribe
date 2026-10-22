import { useState, useCallback, useMemo } from "react";
import type { UseSettingsReturn, UserSettings, NotificationSettings, AppearanceSettings, PrivacySettings, SecuritySettings } from "../types";

/**
 * Custom hook for managing user settings
 * Handles settings state, persistence, and updates
 */
export function useSettings(): UseSettingsReturn {
  // Default settings
  const defaultSettings: UserSettings = useMemo(() => ({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      appointmentReminders: true,
      reminderTiming: "24h",
    },
    appearance: {
      theme: "light",
      language: "English",
      fontSize: "medium",
    },
    privacy: {
      dataSharing: false,
      analyticsOptOut: false,
      marketingEmails: false,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginNotifications: true,
    },
  }), []);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Update settings function
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(prevSettings => ({
        ...prevSettings,
        ...newSettings,
        notifications: {
          ...prevSettings.notifications,
          ...(newSettings.notifications || {}),
        },
        appearance: {
          ...prevSettings.appearance,
          ...(newSettings.appearance || {}),
        },
        privacy: {
          ...prevSettings.privacy,
          ...(newSettings.privacy || {}),
        },
        security: {
          ...prevSettings.security,
          ...(newSettings.security || {}),
        },
      }));

      // In a real app, this would make an API call to save settings
      console.log("Settings updated:", newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset settings function
  const resetSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(defaultSettings);
      
      // In a real app, this would make an API call to reset settings
      console.log("Settings reset to defaults");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [defaultSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}
