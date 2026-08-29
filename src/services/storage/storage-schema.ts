import type { Project, Quest, QuestStep } from "@/types/quest";
import type { FocusSession } from "@/types/focus";
import type { SideQuest } from "@/types/side-quest";
import type { WorkContext } from "@/types/work-context";
import type { RecoveryQuest, RecoveryLog, RecoveryPreferences } from "@/types/recovery";
import type {
  PlayerProfile,
  XpEvent,
  GamificationSettings,
} from "@/types/gamification";
import type { DailyLoadout } from "@/types/daily";
import type { BossBattleConfig } from "@/types/boss";
import type { WorkChallenge } from "@/types/challenge";

export const CURRENT_STORAGE_VERSION = 2;

export interface PersistedAppSettings {
  theme: "dark" | "light" | "system";
  reducedMotion: "system" | "on" | "off";
  soundEffects: boolean;
  defaultFocusMinutes: number;
  autoPromptBreak: boolean;
  onboardingCompleted: boolean;
  isDemoData: boolean;
}

export interface PersistedAppState {
  version: number;

  // Work & Quests
  projects: Project[];
  quests: Quest[];
  questSteps: QuestStep[];
  activeMainQuestId: string | null;

  // Focus Sessions
  focusSessions: FocusSession[];
  activeFocusSession: FocusSession | null;
  focusPlannedMinutes: number;

  // Side Quests & Context
  sideQuests: SideQuest[];
  workContexts: WorkContext[];

  // Recovery
  recoveryQuests: RecoveryQuest[];
  recoveryLogs: RecoveryLog[];
  recoveryPreferences: RecoveryPreferences;

  // Step 12 Gamification Expansion:
  // Daily Mission Board ("Today's Loadout")
  dailyLoadouts: Record<string, DailyLoadout>; // keyed by local date "YYYY-MM-DD"

  // Boss Battles
  bossConfigs: Record<string, BossBattleConfig>; // keyed by projectId

  // Challenge Mode
  activeChallenge: WorkChallenge | null;
  challengeHistory: WorkChallenge[];

  // Skill Tree
  skillUnlocks: Record<string, string>; // skillId -> unlockedAt ISO

  // Gamification & Progression
  playerProfile: PlayerProfile;
  xpEvents: XpEvent[];
  unlockedAchievementIds: Record<string, string>; // id -> ISO timestamp
  gamificationSettings: GamificationSettings;

  // App Settings
  settings: PersistedAppSettings;

  savedAt: string;
}

export interface ExportPayload {
  app: "SIDEQUEST";
  version: number;
  exportedAt: string;
  data: PersistedAppState;
}

export const DEFAULT_APP_SETTINGS: PersistedAppSettings = {
  theme: "system",
  reducedMotion: "system",
  soundEffects: true,
  defaultFocusMinutes: 25,
  autoPromptBreak: true,
  onboardingCompleted: false,
  isDemoData: false,
};

export const DEFAULT_RECOVERY_PREFERENCES_SCHEMA: RecoveryPreferences = {
  enabled: true,
  waterEnabled: true,
  movementEnabled: true,
  stretchEnabled: true,
  eyesEnabled: true,
  bioEnabled: true,
  breakEnabled: true,
};

export const DEFAULT_GAMIFICATION_SETTINGS_SCHEMA: GamificationSettings = {
  enabled: true,
  xpFeedback: true,
  achievementPopups: true,
  comboDisplay: true,
};

export function createEmptyAppState(): PersistedAppState {
  return {
    version: CURRENT_STORAGE_VERSION,
    projects: [],
    quests: [],
    questSteps: [],
    activeMainQuestId: null,
    focusSessions: [],
    activeFocusSession: null,
    focusPlannedMinutes: 25,
    sideQuests: [],
    workContexts: [],
    recoveryQuests: [],
    recoveryLogs: [],
    recoveryPreferences: { ...DEFAULT_RECOVERY_PREFERENCES_SCHEMA },
    dailyLoadouts: {},
    bossConfigs: {},
    activeChallenge: null,
    challengeHistory: [],
    skillUnlocks: {},
    playerProfile: {
      xp: 0,
      level: 1,
      lifetimeXp: 0,
      currentCombo: 0,
      bestCombo: 0,
    },
    xpEvents: [],
    unlockedAchievementIds: {},
    gamificationSettings: { ...DEFAULT_GAMIFICATION_SETTINGS_SCHEMA },
    settings: { ...DEFAULT_APP_SETTINGS },
    savedAt: new Date().toISOString(),
  };
}

