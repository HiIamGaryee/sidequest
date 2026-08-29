import {
  STORAGE_NAMESPACE,
  STORAGE_DEMO_NAMESPACE,
  STORAGE_BACKUP_KEY,
  STORAGE_THEME_KEY,
  STORAGE_ONBOARDING_KEY,
  STORAGE_JUDGE_MODE_KEY,
} from "./storage-keys";
import {
  createEmptyAppState,
  type PersistedAppState,
  type ExportPayload,
  CURRENT_STORAGE_VERSION,
} from "./storage-schema";
import { migratePersistedState } from "./storage-migrations";
import { createDemoWorkspaceState } from "./demo-workspace";

export interface StorageLoadResult {
  state: PersistedAppState;
  isNew: boolean;
  error?: string;
}

export interface StorageSaveResult {
  success: boolean;
  error?: string;
}

export interface StorageImportResult {
  success: boolean;
  state?: PersistedAppState;
  error?: string;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  preview?: {
    app: string;
    version: number;
    exportedAt?: string;
    projectsCount: number;
    questsCount: number;
    questStepsCount: number;
    focusSessionsCount: number;
    sideQuestsCount: number;
    workContextsCount: number;
    recoveryLogsCount: number;
    dailyLoadoutsCount?: number;
    bossBattlesCount?: number;
    skillsUnlockedCount?: number;
    xpEventsCount: number;
    achievementsCount: number;
    totalXp: number;
    level: number;
  };
  state?: PersistedAppState;
}

/**
 * Storage Service - Decoupled persistence layer for SIDEQUEST.
 * Safely wraps browser localStorage with namespace isolation for standard and Judge Demo mode,
 * error isolation, version migrations, and clean import/export capabilities.
 */
class StorageService {
  /**
   * Returns current active storage key depending on whether Judge Mode is active.
   */
  public getActiveKey(isJudgeMode = false): string {
    return isJudgeMode ? STORAGE_DEMO_NAMESPACE : STORAGE_NAMESPACE;
  }

  /**
   * Checks if Judge Mode was active across reloads.
   */
  public isJudgeModeActive(): boolean {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    try {
      return sessionStorage.getItem(STORAGE_JUDGE_MODE_KEY) === "true";
    } catch {
      return false;
    }
  }

  /**
   * Sets Judge Mode active flag in session storage.
   */
  public setJudgeModeActive(active: boolean): void {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    try {
      if (active) {
        sessionStorage.setItem(STORAGE_JUDGE_MODE_KEY, "true");
      } else {
        sessionStorage.removeItem(STORAGE_JUDGE_MODE_KEY);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Loads and migrates the persisted app state.
   */
  public loadAppState(isJudgeMode = false): StorageLoadResult {
    if (typeof window === "undefined" || !window.localStorage) {
      return {
        state: isJudgeMode ? createDemoWorkspaceState() : createEmptyAppState(),
        isNew: true,
      };
    }

    const storageKey = this.getActiveKey(isJudgeMode);

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        if (isJudgeMode) {
          // If Judge Demo mode is loaded for the first time, seed the deterministic demo dataset
          const demo = createDemoWorkspaceState();
          this.saveAppState(demo, true);
          return {
            state: demo,
            isNew: false,
          };
        }

        // Standard user workspace with no prior data
        return {
          state: createEmptyAppState(),
          isNew: true,
        };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (parseError) {
        // Corrupted JSON: preserve backup entry for safety
        try {
          localStorage.setItem(STORAGE_BACKUP_KEY, raw);
        } catch {
          // Ignore
        }
        const fallback = isJudgeMode ? createDemoWorkspaceState() : createEmptyAppState();
        return {
          state: fallback,
          isNew: true,
          error: "Corrupted local storage data was recovered with a clean workspace.",
        };
      }

      const migration = migratePersistedState(parsed);
      return {
        state: migration.state,
        isNew: false,
        error: migration.error,
      };
    } catch (err) {
      const fallback = isJudgeMode ? createDemoWorkspaceState() : createEmptyAppState();
      return {
        state: fallback,
        isNew: true,
        error: err instanceof Error ? err.message : "Failed to load state",
      };
    }
  }

  /**
   * Persists the state to localStorage safely in the active namespace.
   */
  public saveAppState(state: PersistedAppState, isJudgeMode = false): StorageSaveResult {
    if (typeof window === "undefined" || !window.localStorage) {
      return { success: false, error: "Storage not available in this environment" };
    }

    const storageKey = this.getActiveKey(isJudgeMode);

    try {
      const payload: PersistedAppState = {
        ...state,
        savedAt: new Date().toISOString(),
      };
      const serialized = JSON.stringify(payload);
      localStorage.setItem(storageKey, serialized);
      return { success: true };
    } catch (err: unknown) {
      // Detect QuotaExceededError
      const isQuota =
        err instanceof DOMException &&
        (err.code === 22 ||
          err.code === 1014 ||
          err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED");

      const errorMessage = isQuota
        ? "Local storage is full. Please export a backup or clear old history."
        : err instanceof Error
        ? err.message
        : "Failed to save state to local storage";

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Resets ONLY the demo workspace in sidequest:demo:v1 back to initial deterministic state.
   */
  public resetJudgeDemoState(): PersistedAppState {
    const demo = createDemoWorkspaceState();
    this.saveAppState(demo, true);
    return demo;
  }

  /**
   * Destructively clears ONLY standard SIDEQUEST-owned storage namespace keys.
   * STRICTLY never calls localStorage.clear() to avoid wiping unrelated data on same origin.
   */
  public clearAppState(): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }

    try {
      localStorage.removeItem(STORAGE_NAMESPACE);
      localStorage.removeItem(STORAGE_BACKUP_KEY);
      localStorage.removeItem(STORAGE_ONBOARDING_KEY);
      localStorage.removeItem(STORAGE_THEME_KEY);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Exports full state as a formatted JSON string.
   */
  public exportAppState(currentState: PersistedAppState): string {
    const payload: ExportPayload = {
      app: "SIDEQUEST",
      version: CURRENT_STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: currentState,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Pre-validates a backup JSON string and returns counts for user confirmation preview.
   * Does NOT write to storage.
   */
  public validateBackupString(jsonString: string): BackupValidationResult {
    if (!jsonString || typeof jsonString !== "string" || !jsonString.trim()) {
      return { valid: false, error: "Empty or invalid backup file" };
    }

    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== "object") {
        return { valid: false, error: "Invalid backup format: root must be a JSON object" };
      }

      const envelope = parsed as Record<string, unknown>;
      if (envelope.app !== "SIDEQUEST") {
        return {
          valid: false,
          error: "This file is not a valid SIDEQUEST backup (missing app identifier 'SIDEQUEST')",
        };
      }

      const rawData = envelope.data;
      if (!rawData || typeof rawData !== "object") {
        return {
          valid: false,
          error: "Backup file is missing required application data section",
        };
      }

      const migration = migratePersistedState(rawData);
      const state = migration.state;

      const preview = {
        app: "SIDEQUEST",
        version: typeof envelope.version === "number" ? envelope.version : CURRENT_STORAGE_VERSION,
        exportedAt: typeof envelope.exportedAt === "string" ? envelope.exportedAt : undefined,
        projectsCount: state.projects.length,
        questsCount: state.quests.length,
        questStepsCount: state.questSteps.length,
        focusSessionsCount: state.focusSessions.length,
        sideQuestsCount: state.sideQuests.length,
        workContextsCount: state.workContexts.length,
        recoveryLogsCount: state.recoveryLogs.length,
        dailyLoadoutsCount: Object.keys(state.dailyLoadouts || {}).length,
        bossBattlesCount: Object.keys(state.bossConfigs || {}).filter((k) => state.bossConfigs[k]?.enabled).length,
        skillsUnlockedCount: Object.keys(state.skillUnlocks || {}).length,
        xpEventsCount: state.xpEvents.length,
        achievementsCount: Object.keys(state.unlockedAchievementIds || {}).length,
        totalXp: state.playerProfile.xp,
        level: state.playerProfile.level,
      };

      return {
        valid: true,
        preview,
        state,
      };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : "Failed to parse JSON backup file",
      };
    }
  }

  /**
   * Validates and imports backup JSON data.
   * Safe parser with no eval/Function execution.
   */
  public importAppState(jsonString: string, isJudgeMode = false): StorageImportResult {
    if (!jsonString || typeof jsonString !== "string") {
      return { success: false, error: "Empty or invalid backup file" };
    }

    try {
      const parsed = JSON.parse(jsonString);

      // Validate envelope
      if (!parsed || typeof parsed !== "object") {
        return { success: false, error: "Invalid backup format" };
      }

      const envelope = parsed as Record<string, unknown>;
      if (envelope.app !== "SIDEQUEST") {
        return {
          success: false,
          error: "This file is not a valid SIDEQUEST backup (missing app identifier)",
        };
      }

      const rawData = envelope.data;
      if (!rawData || typeof rawData !== "object") {
        return {
          success: false,
          error: "Backup file is missing required application data",
        };
      }

      // Migrate and sanitize imported state
      const migration = migratePersistedState(rawData);
      
      // Save imported state immediately to appropriate namespace
      this.saveAppState(migration.state, isJudgeMode);

      return {
        success: true,
        state: migration.state,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to parse backup JSON file",
      };
    }
  }

  /**
   * Helper to load demo workspace into active workspace.
   */
  public loadDemoWorkspace(): PersistedAppState {
    const demo = createDemoWorkspaceState();
    this.saveAppState(demo, false);
    return demo;
  }
}

export const storageService = new StorageService();
