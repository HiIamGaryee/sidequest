import * as React from "react";
import { Lock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getAchievementBadge, achievementImages } from "@/config/achievementBadges";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types/gamification";

export interface AchievementCardProps {
  key?: React.Key;
  achievement: Achievement;
  className?: string;
}

export function AchievementCard({
  achievement,
  className,
}: AchievementCardProps) {
  const badgeImageUrl = getAchievementBadge(achievement.id, achievement.category);
  const progress = achievement.progress;
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : 0;

  return (
    <Card
      className={cn(
        "border-[#27272a] bg-[#18181b] rounded-xl transition-all duration-200 hover:border-[#3f3f46] group select-none relative overflow-hidden",
        achievement.isUnlocked
          ? "border-amber-500/30 bg-[#18181b] shadow-[0_0_20px_rgba(245,158,11,0.06)]"
          : "opacity-85 hover:opacity-100",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          {/* Left Area: Real Badge Artwork */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                "w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl flex items-center justify-center shrink-0 relative transition-all duration-300 p-1 bg-[#09090b]/80 border",
                achievement.isUnlocked
                  ? "border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.2)]"
                  : "border-[#27272a] group-hover:border-[#3f3f46]"
              )}
            >
              {/* Badge Image Artwork */}
              <img
                src={badgeImageUrl}
                alt={achievement.title}
                className={cn(
                  "w-full h-full object-contain transition-all duration-300",
                  achievement.isUnlocked
                    ? "contrast-105 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                    : "grayscale opacity-55 contrast-90 group-hover:opacity-85 group-hover:grayscale-0"
                )}
                referrerPolicy="no-referrer"
              />

              {/* Locked badge overlay */}
              {!achievement.isUnlocked && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#09090b] border border-[#3f3f46] flex items-center justify-center text-[#a1a1aa] shadow-md"
                  title="Achievement Locked"
                >
                  <Lock className="w-2.5 h-2.5 text-[#a1a1aa]" />
                </div>
              )}
            </div>

            {/* Achievement Metadata */}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold font-mono tracking-wider text-[#fafafa] uppercase truncate">
                {achievement.title}
              </h4>
              <span className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">
                {achievement.category}
              </span>
            </div>
          </div>

          {/* Right Status Badge & XP Reward */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge
              status={achievement.isUnlocked ? "complete" : "locked"}
              label={achievement.isUnlocked ? "UNLOCKED" : "LOCKED"}
              size="sm"
            />
            <span className="text-[10px] font-mono font-semibold text-amber-400 flex items-center gap-1 bg-[#09090b] border border-[#27272a] px-2 py-0.5 rounded">
              <img
                src={achievementImages.xpReward}
                alt="XP"
                className="w-3 h-3 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              +{achievement.xpReward} XP
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#a1a1aa] leading-relaxed pl-0.5">
          {achievement.description}
        </p>

        {/* Progress bar if locked with target > 1 */}
        {!achievement.isUnlocked && progress && progress.target > 1 && (
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#71717a]">Progress</span>
              <span className="text-[#a1a1aa]">
                {progress.current} / {progress.target}
              </span>
            </div>
            <div className="w-full h-1 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
