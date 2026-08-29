import * as React from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";
export type ReducedMotionPreference = "system" | "on" | "off";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  reducedMotion: ReducedMotionPreference;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setReducedMotion: (preference: ReducedMotionPreference) => void;
}

const STORAGE_KEY = "sidequest-theme";
const MOTION_KEY = "sidequest-reduced-motion";

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light" || saved === "system") {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return "dark";
  });

  const [reducedMotion, setReducedMotionState] = React.useState<ReducedMotionPreference>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const saved = localStorage.getItem(MOTION_KEY);
      if (saved === "system" || saved === "on" || saved === "off") {
        return saved;
      }
    } catch {
      // Ignore
    }
    return "system";
  });

  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(getSystemTheme);
  const [systemReducedMotion, setSystemReducedMotion] = React.useState<boolean>(getSystemReducedMotion);

  // Listen to system theme changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  // Listen to system motion changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Apply theme class to document root
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
  }, [resolvedTheme]);

  // Apply reduced motion data-attribute to document root
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const isMotionReduced =
      reducedMotion === "on" || (reducedMotion === "system" && systemReducedMotion);
    document.documentElement.setAttribute(
      "data-reduced-motion",
      isMotionReduced ? "reduce" : "normal"
    );
  }, [reducedMotion, systemReducedMotion]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setReducedMotion = React.useCallback((pref: ReducedMotionPreference) => {
    setReducedMotionState(pref);
    try {
      localStorage.setItem(MOTION_KEY, pref);
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((current) => {
      const next: Theme =
        (current === "system" ? systemTheme : current) === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, [systemTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      reducedMotion,
      setTheme,
      toggleTheme,
      setReducedMotion,
    }),
    [theme, resolvedTheme, reducedMotion, setTheme, toggleTheme, setReducedMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
