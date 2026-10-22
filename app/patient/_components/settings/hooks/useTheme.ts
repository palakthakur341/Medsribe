import { useState, useEffect, useCallback } from "react";
import type { UseThemeReturn } from "../types";

/**
 * Custom hook for theme management
 * Handles theme state, persistence, and system theme detection
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Update resolved theme based on theme setting and system preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
