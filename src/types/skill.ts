export type SkillBranch = "focus" | "finishing" | "resilience" | "recovery";

export type SkillNodeState = "locked" | "available" | "unlocked";

export interface SkillNodeDefinition {
  id: string;
  branch: SkillBranch;
  title: string;
  description: string;
  level: number;
  requiredCount: number;
  metricLabel: string;
  prerequisiteId?: string;
  iconName: string;
  cosmeticTitle?: string;
}

export interface SkillProgressInfo {
  definition: SkillNodeDefinition;
  state: SkillNodeState;
  currentCount: number;
  targetCount: number;
  percentage: number;
  unlockedAt?: string;
}
