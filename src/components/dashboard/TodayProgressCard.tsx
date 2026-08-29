import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { achievementImages } from "@/config/achievementBadges";
import { useQuests } from "@/hooks/useQuests";
import { useFocus } from "@/hooks/useFocus";
import { useRecovery } from "@/hooks/useRecovery";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

export interface TodayProgressCardProps {
  className?: string;
}

export function TodayProgressCard({ className }: TodayProgressCardProps) {
  const { quests } = useQuests();
  const { focusSessions } = useFocus();
  const { recoveryLogs } = useRecovery();
  const { userProfile } = useGamification();
  const completedCount = quests.filter((q) => q.status === "completed").length;

  const todayStats = [
    {
      id: "xp",
      label: "XP earned",
      value: String(userProfile.currentXP),
      unit: "XP",
      image: achievementImages.xpReward,
      accent: "border-sky-500/20",
    },
    {
      id: "quests",
      label: "Quests completed",
      value: String(completedCount),
      unit: "done",
      image: achievementImages.milestonesHeader,
      accent: "border-amber-500/20",
    },
    {
      id: "focus",
      label: "Focus sessions",
      value: String(focusSessions.length),
      unit: "sprints",
      image: achievementImages.focusSprintsFlame,
      accent: "border-orange-500/20",
    },
    {
      id: "recovery",
      label: "Recovery quests",
      value: String(recoveryLogs.length),
      unit: "logged",
      image: achievementImages.recoveryHeartBadge,
      accent: "border-emerald-500/20",
    },
  ];

  return (
    <Card
      className={cn(
        "border-[#27272a] bg-[#18181b] rounded-xl select-none transition-all duration-200 hover:border-[#3f3f46]",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#09090b] border border-amber-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={achievementImages.todayProgressEmblem}
                alt="Today Progress"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
              TODAY'S PROGRESS
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#a1a1aa]">
            ACTIVE CADENCE
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {todayStats.map((stat) => (
            <div
              key={stat.id}
              className={cn(
                "p-3.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-2 transition-all duration-200 hover:border-[#3f3f46] relative overflow-hidden group"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#a1a1aa] font-medium leading-tight truncate">
                  {stat.label}
                </span>
                <div className="w-5 h-5 rounded bg-[#18181b] border border-[#27272a] p-0.5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <img
                    src={stat.image}
                    alt={stat.label}
                    className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#fafafa] tracking-tight">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-[10px] font-mono text-[#71717a]">
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
