export interface BossPhase {
  id: string;
  projectId: string;
  title: string;
  order: number;
  questIds: string[];
}

export interface BossBattleConfig {
  projectId: string;
  enabled: boolean;
  title?: string;
  phases: BossPhase[];
  defeatedAt?: string;
  claimedDefeatRewardAt?: string;
}

export interface BossDamageFeedback {
  id: string;
  damage: number;
  percentage: number;
  questTitle: string;
  timestamp: number;
}
