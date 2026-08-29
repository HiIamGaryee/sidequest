import type { SkillNodeDefinition, SkillBranch } from "@/types/skill";

export interface SkillBranchMeta {
  id: SkillBranch;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export const SKILL_BRANCHES: SkillBranchMeta[] = [
  {
    id: "focus",
    title: "Focus",
    subtitle: "Sustained Attention",
    description: "Build stamina and single-tasking flow through completed sprints.",
    iconName: "Target",
    accentColor: "sky",
  },
  {
    id: "finishing",
    title: "Finishing",
    subtitle: "Execution & Shipping",
    description: "Close out open loops, complete micro-steps, and finish Main Quests.",
    iconName: "CheckCircle2",
    accentColor: "emerald",
  },
  {
    id: "resilience",
    title: "Resilience",
    subtitle: "Distraction Defense",
    description: "Recover from interruptions quickly and park side quests safely.",
    iconName: "Shield",
    accentColor: "amber",
  },
  {
    id: "recovery",
    title: "Recovery",
    subtitle: "Pacing & Sustainability",
    description: "Maintain physical and mental energy without burning out.",
    iconName: "HeartPulse",
    accentColor: "rose",
  },
];

export const SKILL_DEFINITIONS: SkillNodeDefinition[] = [
  // Focus Branch (3 nodes)
  {
    id: "locked-in-1",
    branch: "focus",
    title: "Locked In I",
    description: "Complete 3 valid Focus Sessions.",
    level: 1,
    requiredCount: 3,
    metricLabel: "Focus Sessions",
    iconName: "Target",
    cosmeticTitle: "Focus Initiate",
  },
  {
    id: "locked-in-2",
    branch: "focus",
    title: "Locked In II",
    description: "Complete 10 valid Focus Sessions.",
    level: 2,
    requiredCount: 10,
    metricLabel: "Focus Sessions",
    prerequisiteId: "locked-in-1",
    iconName: "Flame",
    cosmeticTitle: "Deep Worker",
  },
  {
    id: "deep-run",
    branch: "focus",
    title: "Deep Run",
    description: "Complete at least one extended Focus Session of 45+ minutes.",
    level: 3,
    requiredCount: 1,
    metricLabel: "45m+ Sprint",
    prerequisiteId: "locked-in-2",
    iconName: "Zap",
    cosmeticTitle: "Flow Runner",
  },

  // Finishing Branch (3 nodes)
  {
    id: "closer-1",
    branch: "finishing",
    title: "Closer I",
    description: "Complete 5 Quests to 100%.",
    level: 1,
    requiredCount: 5,
    metricLabel: "Quests Completed",
    iconName: "CheckCircle2",
    cosmeticTitle: "Shipstarter",
  },
  {
    id: "closer-2",
    branch: "finishing",
    title: "Closer II",
    description: "Complete 15 Quests across any project.",
    level: 2,
    requiredCount: 15,
    metricLabel: "Quests Completed",
    prerequisiteId: "closer-1",
    iconName: "Trophy",
    cosmeticTitle: "Finisher",
  },
  {
    id: "main-quest-master",
    branch: "finishing",
    title: "Main Quest Master",
    description: "Complete 3 full Main Quests.",
    level: 3,
    requiredCount: 3,
    metricLabel: "Main Quests",
    prerequisiteId: "closer-2",
    iconName: "Crown",
    cosmeticTitle: "Campaign Closer",
  },

  // Resilience Branch (3 nodes)
  {
    id: "back-from-void-1",
    branch: "resilience",
    title: "Back from the Void I",
    description: "Resume interrupted work 3 times using Context Keeper.",
    level: 1,
    requiredCount: 3,
    metricLabel: "Resumed Contexts",
    iconName: "RotateCcw",
    cosmeticTitle: "Resilient",
  },
  {
    id: "back-from-void-2",
    branch: "resilience",
    title: "Back from the Void II",
    description: "Resume interrupted work 10 times without losing your place.",
    level: 2,
    requiredCount: 10,
    metricLabel: "Resumed Contexts",
    prerequisiteId: "back-from-void-1",
    iconName: "ShieldAlert",
    cosmeticTitle: "Unstoppable",
  },
  {
    id: "side-quest-tamer",
    branch: "resilience",
    title: "Side Quest Tamer",
    description: "Park 10 distracting ideas in the Side Quest Parking Lot.",
    level: 2,
    requiredCount: 10,
    metricLabel: "Side Quests Parked",
    prerequisiteId: "back-from-void-1",
    iconName: "Signpost",
    cosmeticTitle: "Disciplined",
  },

  // Recovery Branch (3 nodes)
  {
    id: "reset-1",
    branch: "recovery",
    title: "Reset I",
    description: "Complete 5 Recovery actions (Water, Movement, Breath).",
    level: 1,
    requiredCount: 5,
    metricLabel: "Recovery Logs",
    iconName: "Droplets",
    cosmeticTitle: "Hydrated",
  },
  {
    id: "reset-2",
    branch: "recovery",
    title: "Reset II",
    description: "Complete 20 Recovery actions.",
    level: 2,
    requiredCount: 20,
    metricLabel: "Recovery Logs",
    prerequisiteId: "reset-1",
    iconName: "HeartPulse",
    cosmeticTitle: "Balanced Operator",
  },
  {
    id: "balanced-run",
    branch: "recovery",
    title: "Balanced Run",
    description: "Log both a Focus Session and a Recovery action on the same day (5 days).",
    level: 3,
    requiredCount: 5,
    metricLabel: "Balanced Days",
    prerequisiteId: "reset-1",
    iconName: "Sparkles",
    cosmeticTitle: "Zen Architect",
  },
];
