import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface PlayerHudState {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  activeMainQuest?: string | null;
}
