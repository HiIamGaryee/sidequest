import { useGamificationContext } from "@/stores/GamificationContext";

export function useGamification() {
  const context = useGamificationContext();

  const currentRank = {
    level: context.levelInfo.level,
    title: context.levelInfo.title,
    minXP: context.levelInfo.minXp,
    maxXP: context.levelInfo.nextLevelXp,
  };

  const nextRank = {
    level: context.levelInfo.level + 1,
    title: context.levelInfo.title,
    minXP: context.levelInfo.nextLevelXp,
    maxXP: context.levelInfo.nextLevelXp + 500,
  };

  const userProfile = {
    level: context.playerProfile.level,
    currentXP: context.playerProfile.xp,
    nextLevelXP: context.levelInfo.nextLevelXp,
    levelProgress: context.levelInfo.percentage,
    title: context.levelInfo.title,
    currentCombo: context.playerProfile.currentCombo,
    bestCombo: context.playerProfile.bestCombo,
  };

  return {
    ...context,
    userProfile,
    currentRank,
    nextRank,
  };
}
