import type { Achievement, GamificationSettings } from "@/types/gamification";

export const XP_REWARDS = {
  stepCompleted: 5,
  questCompleted: 30,
  mainQuestCompleted: 100,
  focusSessionCompleted: 20,
  resumeAfterInterruption: 10,
  sideQuestParked: 5,
  recoveryCompleted: 5,
  unstuckAction: 5,
  dailyClear: 40,
  dailyRecoveryBonus: 10,
  bossDefeated: 150,
  challengeCompleted: 25,
  skillUnlockedBonus: 10,
} as const;

export interface LevelThreshold {
  level: number;
  minXp: number;
  title: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXp: 0, title: "Wanderer" },
  { level: 2, minXp: 100, title: "Starter" },
  { level: 3, minXp: 250, title: "Builder" },
  { level: 4, minXp: 450, title: "Focused" },
  { level: 5, minXp: 700, title: "Operator" },
  { level: 6, minXp: 1000, title: "Finisher" },
  { level: 7, minXp: 1400, title: "Consistent" },
  { level: 8, minXp: 1900, title: "Closer" },
  { level: 9, minXp: 2500, title: "Flow State" },
  { level: 10, minXp: 3200, title: "Main Character" },
];

export const LEVEL_TITLES = LEVEL_THRESHOLDS.map((t) => t.title);

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "progress" | "focus" | "recovery" | "discipline";
  xpReward: number;
  targetCount: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "back-from-the-void",
    title: "BACK FROM THE VOID",
    description: "Resume an interrupted Quest.",
    icon: "RotateCcw",
    category: "discipline",
    xpReward: 50,
    targetCount: 1,
  },
  {
    id: "not-today-side-quest",
    title: "NOT TODAY, SIDE QUEST",
    description: "Park 5 distracting ideas.",
    icon: "Signpost",
    category: "discipline",
    xpReward: 50,
    targetCount: 5,
  },
  {
    id: "touch-grass",
    title: "TOUCH GRASS",
    description: "Complete 3 Movement Recovery Quests.",
    icon: "Footprints",
    category: "recovery",
    xpReward: 50,
    targetCount: 3,
  },
  {
    id: "hydrated-developer",
    title: "HYDRATED DEVELOPER",
    description: "Log 5 Water Recovery actions.",
    icon: "Droplets",
    category: "recovery",
    xpReward: 50,
    targetCount: 5,
  },
  {
    id: "ship-it",
    title: "SHIP IT",
    description: "Complete a Main Quest.",
    icon: "Rocket",
    category: "progress",
    xpReward: 100,
    targetCount: 1,
  },
  {
    id: "locked-in",
    title: "LOCKED IN",
    description: "Complete a Focus Session of at least 25 minutes.",
    icon: "Target",
    category: "focus",
    xpReward: 50,
    targetCount: 1,
  },
  {
    id: "tiny-but-deadly",
    title: "TINY BUT DEADLY",
    description: "Complete 10 Tiny Steps.",
    icon: "Zap",
    category: "progress",
    xpReward: 50,
    targetCount: 10,
  },
  {
    id: "unstuck",
    title: "UNSTUCK",
    description: "Use Unstuck Mode successfully 5 times.",
    icon: "LifeBuoy",
    category: "progress",
    xpReward: 50,
    targetCount: 5,
  },
  {
    id: "the-finisher",
    title: "THE FINISHER",
    description: "Complete 10 Quests.",
    icon: "CheckCircle2",
    category: "progress",
    xpReward: 100,
    targetCount: 10,
  },
  {
    id: "main-character-energy",
    title: "MAIN CHARACTER ENERGY",
    description: "Complete 3 Main Quests.",
    icon: "Crown",
    category: "progress",
    xpReward: 150,
    targetCount: 3,
  },
  {
    id: "today-was-a-good-day",
    title: "TODAY WAS A GOOD DAY",
    description: "Clear your first Daily Loadout.",
    icon: "CalendarCheck",
    category: "discipline",
    xpReward: 50,
    targetCount: 1,
  },
  {
    id: "boss-slayer",
    title: "BOSS SLAYER",
    description: "Defeat your first Boss Project.",
    icon: "Swords",
    category: "progress",
    xpReward: 150,
    targetCount: 1,
  },
  {
    id: "absolutely-locked-in",
    title: "ABSOLUTELY LOCKED IN",
    description: "Clear 5 Challenges.",
    icon: "Crosshair",
    category: "focus",
    xpReward: 75,
    targetCount: 5,
  },
  {
    id: "skill-issue-resolved",
    title: "SKILL ISSUE RESOLVED",
    description: "Unlock your first Skill Node.",
    icon: "GraduationCap",
    category: "discipline",
    xpReward: 50,
    targetCount: 1,
  },
  {
    id: "full-loadout",
    title: "FULL LOADOUT",
    description: "Clear Main + Side Missions in one day.",
    icon: "Briefcase",
    category: "discipline",
    xpReward: 50,
    targetCount: 1,
  },
];

export const DEFAULT_GAMIFICATION_SETTINGS: GamificationSettings = {
  enabled: true,
  xpFeedback: true,
  achievementPopups: true,
  comboDisplay: true,
};
