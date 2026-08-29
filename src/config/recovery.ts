import {
  Droplets,
  Footprints,
  Activity,
  Eye,
  CirclePause,
  Coffee,
} from "lucide-react";
import type { RecoveryType, RecoveryPreferences } from "@/types/recovery";

export const RECOVERY_INTERVALS: Record<RecoveryType, number> = {
  water: 45,     // 45 minutes
  movement: 50,  // 50 minutes
  stretch: 75,   // 75 minutes
  eyes: 30,      // 30 minutes
  bio: 90,       // 90 minutes
  break: 60,     // 60 minutes
};

export const RECOVERY_DURATIONS: Record<RecoveryType, number> = {
  water: 0,
  movement: 120, // 2 minutes (120 seconds)
  stretch: 60,   // 1 minute (60 seconds)
  eyes: 30,      // 30 seconds
  bio: 300,      // 5 minutes (300 seconds)
  break: 300,    // 5 minutes (300 seconds)
};

export const RECOVERY_SNOOZE_OPTIONS = [5, 10, 15] as const;

export const GLOBAL_RECOVERY_COOLDOWN_MINUTES = 10;

export const RECOVERY_PRIORITY_ORDER: RecoveryType[] = [
  "break",
  "movement",
  "bio",
  "water",
  "eyes",
  "stretch",
];

export const DEFAULT_RECOVERY_PREFERENCES: RecoveryPreferences = {
  enabled: true,
  waterEnabled: true,
  movementEnabled: true,
  stretchEnabled: true,
  eyesEnabled: true,
  bioEnabled: true,
  breakEnabled: true,
};

export interface RecoveryTypeConfig {
  type: RecoveryType;
  label: string;
  badgeLabel: string;
  icon: typeof Droplets;
  title: string;
  description: string;
  defaultDurationSeconds: number;
  primaryActionLabel: string;
  quickDoneLabel: string;
  isTimed: boolean;
}

export const RECOVERY_CONFIG: Record<RecoveryType, RecoveryTypeConfig> = {
  water: {
    type: "water",
    label: "Water",
    badgeLabel: "HYDRATION",
    icon: Droplets,
    title: "WATER",
    description: "Been working a while? Grab some water if you need it.",
    defaultDurationSeconds: 0,
    primaryActionLabel: "Done",
    quickDoneLabel: "Log Water",
    isTimed: false,
  },
  movement: {
    type: "movement",
    label: "Movement",
    badgeLabel: "MOVEMENT",
    icon: Footprints,
    title: "MOVE",
    description: "You've been sitting for a while. Walk around for about 2 minutes.",
    defaultDurationSeconds: 120,
    primaryActionLabel: "Start 2m",
    quickDoneLabel: "Log Movement",
    isTimed: true,
  },
  stretch: {
    type: "stretch",
    label: "Stretch",
    badgeLabel: "POSTURE RESET",
    icon: Activity,
    title: "STRETCH",
    description: "Quick reset? Move your shoulders, arms, or whatever feels comfortable.",
    defaultDurationSeconds: 60,
    primaryActionLabel: "Done",
    quickDoneLabel: "Log Stretch",
    isTimed: false,
  },
  eyes: {
    type: "eyes",
    label: "Eyes",
    badgeLabel: "SCREEN REST",
    icon: Eye,
    title: "EYES",
    description: "Screen break. Look away from the screen for a short moment.",
    defaultDurationSeconds: 30,
    primaryActionLabel: "Start 30s",
    quickDoneLabel: "Log Eye Break",
    isTimed: true,
  },
  bio: {
    type: "bio",
    label: "Bio Break",
    badgeLabel: "BIO BREAK",
    icon: CirclePause,
    title: "BIO BREAK",
    description: "You've been focused for a while. Need the toilet, water, or just a minute away?",
    defaultDurationSeconds: 300,
    primaryActionLabel: "Take 5",
    quickDoneLabel: "Log Bio Break",
    isTimed: true,
  },
  break: {
    type: "break",
    label: "General Break",
    badgeLabel: "SPRINT BREAK",
    icon: Coffee,
    title: "RESET",
    description: "One hour in. Take a few minutes away if you need it.",
    defaultDurationSeconds: 300,
    primaryActionLabel: "Take Break",
    quickDoneLabel: "Log Break",
    isTimed: true,
  },
};
