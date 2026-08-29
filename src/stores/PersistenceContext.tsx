import * as React from "react";
import {
  storageService,
  type PersistedAppState,
  type PersistedAppSettings,
  createEmptyAppState,
} from "@/services/storage";
import { useToast } from "@/hooks/useToast";
import { STORAGE_NAMESPACE, STORAGE_DEMO_NAMESPACE } from "@/services/storage/storage-keys";

export interface PersistenceContextValue {
  isHydrated: boolean;
  isFirstRun: boolean;
  isDemoData: boolean;
  isJudgeMode: boolean;
  lastSavedAt: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  appSettings: PersistedAppSettings;
  // Global Actions
  updateAppSettings: (patch: Partial<PersistedAppSettings>) => void;
  clearLocalData: () => void;
  exportData: () => void;
  validateBackup: (jsonString: string) => import("@/services/storage/storage-service").BackupValidationResult;
  importData: (jsonString: string) => Promise<{ success: boolean; error?: string }>;
  loadDemoWorkspace: () => void;
  resetDemoWorkspace: () => void;
  resetSettings: () => void;
  completeOnboarding: () => void;
  // Judge Mode Actions
  enterJudgeMode: () => void;
  exitJudgeMode: () => void;
  resetJudgeDemo: () => void;
  // State loader for child stores
  initialState: PersistedAppState;
  // Trigger immediate or debounced save with store snapshots
  saveSnapshot: (partial: Partial<PersistedAppState>, immediate?: boolean) => void;
}

const PersistenceContext = React.createContext<PersistenceContextValue | null>(null);

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);
  const [isFirstRun, setIsFirstRun] = React.useState<boolean>(false);
  const [isJudgeMode, setIsJudgeMode] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        window.location.pathname.startsWith("/demo") ||
        storageService.isJudgeModeActive()
      );
    }
    return false;
  });

  const [initialState, setInitialState] = React.useState<PersistedAppState>(createEmptyAppState());
  const [appSettings, setAppSettings] = React.useState<PersistedAppSettings>(
    initialState.settings
  );
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  // In-memory master state ref for debounced batch persistence
  const masterStateRef = React.useRef<PersistedAppState>(initialState);
  const saveTimeoutRef = React.useRef<number | null>(null);
  const isJudgeModeRef = React.useRef<boolean>(isJudgeMode);
  isJudgeModeRef.current = isJudgeMode;

  // 1. App Startup Hydration
  React.useEffect(() => {
    try {
      const activeJudge = isJudgeModeRef.current;
      const { state, isNew, error } = storageService.loadAppState(activeJudge);
      masterStateRef.current = state;
      setInitialState(state);
      setAppSettings(state.settings);
      setIsFirstRun(!activeJudge && isNew && !state.settings.onboardingCompleted && state.projects.length === 0);
      setLastSavedAt(state.savedAt);
      
      if (error) {
        toast({
          title: "Storage Notification",
          description: error,
          variant: "default",
        });
      }
    } catch {
      const fallback = storageService.loadAppState(isJudgeModeRef.current).state;
      masterStateRef.current = fallback;
      setInitialState(fallback);
      setIsFirstRun(!isJudgeModeRef.current);
    } finally {
      setIsHydrated(true);
    }
  }, [toast]);

  // Listen to cross-tab storage changes
  React.useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      const activeKey = isJudgeModeRef.current ? STORAGE_DEMO_NAMESPACE : STORAGE_NAMESPACE;
      if (e.key === activeKey && e.newValue) {
        try {
          const { state } = storageService.loadAppState(isJudgeModeRef.current);
          masterStateRef.current = state;
          setAppSettings(state.settings);
          setLastSavedAt(state.savedAt);
        } catch {
          // Ignore parse errors from concurrent tab
        }
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  // Sync Master State & Debounced Save to localStorage
  const saveSnapshot = React.useCallback(
    (partial: Partial<PersistedAppState>, immediate = false) => {
      masterStateRef.current = {
        ...masterStateRef.current,
        ...partial,
        savedAt: new Date().toISOString(),
      };

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const executeSave = () => {
        setSaveStatus("saving");
        const res = storageService.saveAppState(masterStateRef.current, isJudgeModeRef.current);
        if (res.success) {
          setSaveStatus("saved");
          setSaveError(null);
          setLastSavedAt(masterStateRef.current.savedAt);
        } else {
          setSaveStatus("error");
          setSaveError(res.error || "Storage save error");
          toast({
            title: "Local Storage Issue",
            description: res.error || "Failed to save recent changes.",
            variant: "destructive",
          });
        }
      };

      if (immediate) {
        executeSave();
      } else {
        saveTimeoutRef.current = window.setTimeout(executeSave, 350);
      }
    },
    [toast]
  );

  const updateAppSettings = React.useCallback(
    (patch: Partial<PersistedAppSettings>) => {
      setAppSettings((prev) => {
        const next = { ...prev, ...patch };
        saveSnapshot({ settings: next }, true);
        return next;
      });
    },
    [saveSnapshot]
  );

  const completeOnboarding = React.useCallback(() => {
    setIsFirstRun(false);
    updateAppSettings({ onboardingCompleted: true });
  }, [updateAppSettings]);

  const clearLocalData = React.useCallback(() => {
    storageService.clearAppState();
    const clean = createEmptyAppState();
    clean.settings.onboardingCompleted = true;
    masterStateRef.current = clean;
    setInitialState(clean);
    setAppSettings(clean.settings);
    setLastSavedAt(clean.savedAt);
    setSaveStatus("idle");
    window.location.href = "/";
  }, []);

  const exportData = React.useCallback(() => {
    try {
      const json = storageService.exportAppState(masterStateRef.current);
      const dateStr = new Date().toISOString().split("T")[0];
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sidequest-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Exported",
        description: `Exported sidequest-backup-${dateStr}.json successfully.`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not generate backup file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const validateBackup = React.useCallback(
    (jsonString: string) => {
      return storageService.validateBackupString(jsonString);
    },
    []
  );

  const importData = React.useCallback(
    async (jsonString: string): Promise<{ success: boolean; error?: string }> => {
      const result = storageService.importAppState(jsonString, isJudgeModeRef.current);
      if (result.success && result.state) {
        masterStateRef.current = result.state;
        setInitialState(result.state);
        setAppSettings(result.state.settings);
        setLastSavedAt(result.state.savedAt);
        toast({
          title: "Import Successful",
          description: "Restored your SIDEQUEST workspace from backup.",
        });
        setTimeout(() => {
          window.location.href = isJudgeModeRef.current ? "/demo" : "/";
        }, 300);
        return { success: true };
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Invalid backup file structure.",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    },
    [toast]
  );

  const loadDemoWorkspace = React.useCallback(() => {
    const demo = storageService.loadDemoWorkspace();
    masterStateRef.current = demo;
    setInitialState(demo);
    setAppSettings(demo.settings);
    setIsFirstRun(false);
    toast({
      title: "Demo Workspace Loaded",
      description: "Sample project 'WEBMCP CHALLENGE' is ready for testing.",
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 250);
  }, [toast]);

  const resetDemoWorkspace = React.useCallback(() => {
    loadDemoWorkspace();
  }, [loadDemoWorkspace]);

  // Judge Mode Controls
  const enterJudgeMode = React.useCallback(() => {
    storageService.setJudgeModeActive(true);
    setIsJudgeMode(true);
    isJudgeModeRef.current = true;
    const demo = storageService.loadAppState(true).state;
    masterStateRef.current = demo;
    setInitialState(demo);
    setAppSettings(demo.settings);
    setIsFirstRun(false);
    toast({
      title: "Judge Mode Active",
      description: "Isolated demo workspace loaded. Normal data remains protected.",
    });
  }, [toast]);

  const exitJudgeMode = React.useCallback(() => {
    storageService.setJudgeModeActive(false);
    setIsJudgeMode(false);
    isJudgeModeRef.current = false;
    const standard = storageService.loadAppState(false).state;
    masterStateRef.current = standard;
    setInitialState(standard);
    setAppSettings(standard.settings);
    toast({
      title: "Exited Judge Mode",
      description: "Your standard SIDEQUEST workspace has been restored.",
    });
    if (window.location.pathname.startsWith("/demo")) {
      window.location.href = "/";
    }
  }, [toast]);

  const resetJudgeDemo = React.useCallback(() => {
    const fresh = storageService.resetJudgeDemoState();
    masterStateRef.current = fresh;
    setInitialState(fresh);
    setAppSettings(fresh.settings);
    toast({
      title: "Demo Reset",
      description: "Deterministic judge dataset reloaded. All changes reset.",
    });
    // Dispatch custom event to notify all stores / trackers
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidequest:demo-reset"));
    }
  }, [toast]);

  const resetSettings = React.useCallback(() => {
    const resetSet = {
      ...initialState.settings,
      theme: "system" as const,
      reducedMotion: "system" as const,
      soundEffects: true,
      defaultFocusMinutes: 25,
      autoPromptBreak: true,
    };
    updateAppSettings(resetSet);
    toast({
      title: "Settings Reset",
      description: "Default appearance and productivity preferences restored.",
    });
  }, [initialState.settings, updateAppSettings, toast]);

  const value = React.useMemo<PersistenceContextValue>(
    () => ({
      isHydrated,
      isFirstRun,
      isDemoData: isJudgeMode || appSettings.isDemoData,
      isJudgeMode,
      lastSavedAt,
      saveStatus,
      saveError,
      appSettings,
      updateAppSettings,
      clearLocalData,
      exportData,
      validateBackup,
      importData,
      loadDemoWorkspace,
      resetDemoWorkspace,
      resetSettings,
      completeOnboarding,
      enterJudgeMode,
      exitJudgeMode,
      resetJudgeDemo,
      initialState,
      saveSnapshot,
    }),
    [
      isHydrated,
      isFirstRun,
      isJudgeMode,
      appSettings,
      lastSavedAt,
      saveStatus,
      saveError,
      updateAppSettings,
      clearLocalData,
      exportData,
      validateBackup,
      importData,
      loadDemoWorkspace,
      resetDemoWorkspace,
      resetSettings,
      completeOnboarding,
      enterJudgeMode,
      exitJudgeMode,
      resetJudgeDemo,
      initialState,
      saveSnapshot,
    ]
  );

  return <PersistenceContext.Provider value={value}>{children}</PersistenceContext.Provider>;
}

export function usePersistence(): PersistenceContextValue {
  const ctx = React.useContext(PersistenceContext);
  if (!ctx) {
    throw new Error("usePersistence must be used within a PersistenceProvider");
  }
  return ctx;
}
