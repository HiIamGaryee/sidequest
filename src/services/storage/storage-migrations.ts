import {
  CURRENT_STORAGE_VERSION,
  createEmptyAppState,
  type PersistedAppState,
} from "./storage-schema";
import { getLevelFromXp } from "@/lib/gamification-utils";

export interface MigrationResult {
  state: PersistedAppState;
  migrated: boolean;
  error?: string;
}

/**
 * Validates and migrates persisted state across versions safely.
 * Never throws; always produces a valid, sanitized PersistedAppState.
 */
export function migratePersistedState(rawInput: unknown): MigrationResult {
  if (!rawInput || typeof rawInput !== "object") {
    return {
      state: createEmptyAppState(),
      migrated: false,
      error: "Stored state is not a valid object",
    };
  }

  try {
    const raw = rawInput as Record<string, unknown>;
    const version = typeof raw.version === "number" ? raw.version : 1;

    // Build a sanitized base object
    const base = createEmptyAppState();

    // 1. Projects validation
    const projects = Array.isArray(raw.projects) ? raw.projects : base.projects;

    // 2. Quests validation
    const quests = Array.isArray(raw.quests) ? raw.quests : base.quests;

    // 3. Quest Steps validation
    const questSteps = Array.isArray(raw.questSteps) ? raw.questSteps : base.questSteps;

    // 4. Main Quest ID validation (must exist in quests list)
    let activeMainQuestId: string | null =
      typeof raw.activeMainQuestId === "string" ? raw.activeMainQuestId : null;
    if (activeMainQuestId && !quests.some((q) => q.id === activeMainQuestId)) {
      activeMainQuestId = null;
    }

    // 5. Focus Sessions
    const focusSessions = Array.isArray(raw.focusSessions) ? raw.focusSessions : base.focusSessions;
    const activeFocusSession =
      raw.activeFocusSession && typeof raw.activeFocusSession === "object"
        ? (raw.activeFocusSession as PersistedAppState["activeFocusSession"])
        : null;
    const focusPlannedMinutes =
      typeof raw.focusPlannedMinutes === "number" && raw.focusPlannedMinutes > 0
        ? raw.focusPlannedMinutes
        : 25;

    // 6. Side Quests & Contexts
    const sideQuests = Array.isArray(raw.sideQuests) ? raw.sideQuests : base.sideQuests;
    const workContexts = Array.isArray(raw.workContexts) ? raw.workContexts : base.workContexts;

    // 7. Recovery
    const recoveryQuests = Array.isArray(raw.recoveryQuests) ? raw.recoveryQuests : base.recoveryQuests;
    const recoveryLogs = Array.isArray(raw.recoveryLogs) ? raw.recoveryLogs : base.recoveryLogs;
    const recoveryPreferences =
      raw.recoveryPreferences && typeof raw.recoveryPreferences === "object"
        ? { ...base.recoveryPreferences, ...(raw.recoveryPreferences as object) }
        : base.recoveryPreferences;

    // 8. Gamification & XP source of truth validation (Requirement 18)
    const xpEvents = Array.isArray(raw.xpEvents) ? raw.xpEvents : base.xpEvents;
    const totalXp = xpEvents.reduce((acc, ev) => acc + (typeof ev?.amount === "number" ? ev.amount : 0), 0);
    const derivedLevel = getLevelFromXp(totalXp).level;

    const rawProfile = (raw.playerProfile || {}) as Partial<PersistedAppState["playerProfile"]>;
    const playerProfile = {
      xp: totalXp,
      level: derivedLevel,
      lifetimeXp: totalXp,
      currentCombo: typeof rawProfile.currentCombo === "number" ? rawProfile.currentCombo : 0,
      bestCombo: typeof rawProfile.bestCombo === "number" ? rawProfile.bestCombo : 0,
    };

    const unlockedAchievementIds: Record<string, string> = {};
    if (raw.unlockedAchievementIds && typeof raw.unlockedAchievementIds === "object") {
      Object.entries(raw.unlockedAchievementIds).forEach(([key, val]) => {
        if (typeof val === "string") {
          unlockedAchievementIds[key] = val;
        }
      });
    }

    const gamificationSettings =
      raw.gamificationSettings && typeof raw.gamificationSettings === "object"
        ? { ...base.gamificationSettings, ...(raw.gamificationSettings as object) }
        : base.gamificationSettings;

    // Step 12 Gamification Expansion:
    // Daily Loadouts
    const dailyLoadouts: Record<string, PersistedAppState["dailyLoadouts"][string]> = {};
    if (raw.dailyLoadouts && typeof raw.dailyLoadouts === "object") {
      Object.entries(raw.dailyLoadouts).forEach(([dateKey, val]) => {
        if (val && typeof val === "object") {
          dailyLoadouts[dateKey] = val as PersistedAppState["dailyLoadouts"][string];
        }
      });
    }

    // Boss Configs
    const bossConfigs: Record<string, PersistedAppState["bossConfigs"][string]> = {};
    if (raw.bossConfigs && typeof raw.bossConfigs === "object") {
      Object.entries(raw.bossConfigs).forEach(([projId, val]) => {
        if (val && typeof val === "object") {
          bossConfigs[projId] = val as PersistedAppState["bossConfigs"][string];
        }
      });
    }

    // Challenges
    const activeChallenge =
      raw.activeChallenge && typeof raw.activeChallenge === "object"
        ? (raw.activeChallenge as PersistedAppState["activeChallenge"])
        : null;
    const challengeHistory = Array.isArray(raw.challengeHistory)
      ? (raw.challengeHistory as PersistedAppState["challengeHistory"])
      : [];

    // Skill Unlocks
    const skillUnlocks: Record<string, string> = {};
    if (raw.skillUnlocks && typeof raw.skillUnlocks === "object") {
      Object.entries(raw.skillUnlocks).forEach(([skillId, val]) => {
        if (typeof val === "string") {
          skillUnlocks[skillId] = val;
        }
      });
    }

    // 9. App Settings
    const settings =
      raw.settings && typeof raw.settings === "object"
        ? { ...base.settings, ...(raw.settings as object) }
        : base.settings;

    const migratedState: PersistedAppState = {
      version: CURRENT_STORAGE_VERSION,
      projects,
      quests,
      questSteps,
      activeMainQuestId,
      focusSessions,
      activeFocusSession,
      focusPlannedMinutes,
      sideQuests,
      workContexts,
      recoveryQuests,
      recoveryLogs,
      recoveryPreferences,
      dailyLoadouts,
      bossConfigs,
      activeChallenge,
      challengeHistory,
      skillUnlocks,
      playerProfile,
      xpEvents,
      unlockedAchievementIds,
      gamificationSettings,
      settings,
      savedAt: typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString(),
    };

    return {
      state: migratedState,
      migrated: version !== CURRENT_STORAGE_VERSION,
    };
  } catch (err) {
    return {
      state: createEmptyAppState(),
      migrated: false,
      error: err instanceof Error ? err.message : "Migration failed unexpectedly",
    };
  }
}
