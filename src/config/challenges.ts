import type { ChallengePreset } from "@/types/challenge";

export const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    type: "timed_action",
    title: "10 Minute Attack",
    description: "Finish the current Next Action within 10 minutes.",
    targetValue: 600, // 10 minutes (600 seconds)
    durationSeconds: 600,
    xpReward: 20,
    iconName: "Timer",
  },
  {
    type: "step_count",
    title: "Triple Tap",
    description: "Complete 3 Quest Steps.",
    targetValue: 3,
    xpReward: 25,
    iconName: "Zap",
  },
  {
    type: "main_quest_progress",
    title: "Push the Boss",
    description: "Increase Main Quest progress by 10% or complete it.",
    targetValue: 10,
    xpReward: 30,
    iconName: "TrendingUp",
  },
  {
    type: "no_switch",
    title: "Stay On Target",
    description: "Complete at least one Step on your active Quest without switching.",
    targetValue: 1,
    xpReward: 20,
    iconName: "Crosshair",
  },
];
