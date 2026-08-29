import * as React from "react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { XpBar } from "@/components/gamification/XpBar";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { ComboBadge } from "@/components/gamification/ComboBadge";
import { achievementImages } from "@/config/achievementBadges";
import { useGamification } from "@/hooks/useGamification";

export function AchievementsPage() {
  const {
    userProfile,
    currentRank,
    nextRank,
    levelInfo,
    achievements,
  } = useGamification();

  const [filterCategory, setFilterCategory] = React.useState<string>("all");

  const unlockedCount = React.useMemo(() => {
    return achievements.filter((a) => a.isUnlocked).length;
  }, [achievements]);

  const filteredAchievements = React.useMemo(() => {
    if (filterCategory === "all") return achievements;
    return achievements.filter((a) => a.category === filterCategory);
  }, [achievements, filterCategory]);

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="Achievements"
          description="Track XP, levels, focus momentum, and milestone badges."
          badge={
            <StatusBadge
              status={unlockedCount > 0 ? "complete" : "active"}
              label={`${unlockedCount} / ${achievements.length} UNLOCKED`}
            />
          }
        />

        {/* Player Level & XP HUD Card */}
        <div className="p-5 sm:p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Level Crest Artwork Asset */}
              <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-xs relative">
                <img
                  src={achievementImages.rankNovice}
                  alt="Rank Crest"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold bg-amber-400 text-black px-1 rounded-xs">
                  {userProfile.level}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                  {currentRank.title}
                  <span className="text-[10px] font-mono text-amber-400 font-normal">
                    (Level {userProfile.level})
                  </span>
                </h3>
                <p className="text-xs text-[#71717a]">
                  Total Experience Points: <span className="text-[#fafafa] font-mono font-bold">{userProfile.currentXP} XP</span>
                  {nextRank && (
                    <span className="ml-1.5 text-[11px] text-[#71717a]">
                      • {levelInfo.remainingXp} XP to Level {userProfile.level + 1}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <ComboBadge showLabel={true} />
              <span className="text-[10px] font-mono text-amber-400 px-2.5 py-1 rounded bg-[#09090b] border border-amber-500/30 font-bold shrink-0">
                RANK {userProfile.level}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <XpBar
              currentXp={levelInfo.progressXp}
              nextLevelXp={levelInfo.neededXp}
              showLabels={true}
              size="default"
            />
          </div>
        </div>

        {/* Milestones / Achievements Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img
                src={achievementImages.milestonesHeader}
                alt="Milestones"
                className="w-4 h-4 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#71717a] uppercase">
                MILESTONES & BADGES
              </h3>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#09090b] p-1 border border-[#27272a] rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All" },
                { id: "progress", label: "Progress" },
                { id: "focus", label: "Focus" },
                { id: "recovery", label: "Recovery" },
                { id: "discipline", label: "Discipline" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer shrink-0 ${
                    filterCategory === cat.id
                      ? "bg-white text-black font-bold shadow-xs"
                      : "text-[#71717a] hover:text-[#fafafa]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </div>
      </PageContainer>
    </AnimatedPage>
  );
}
