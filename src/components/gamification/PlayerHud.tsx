import * as React from "react";
import { Sparkles, Zap, Trophy, ChevronDown } from "lucide-react";
import { XpBar } from "@/components/gamification/XpBar";
import { ComboBadge } from "@/components/gamification/ComboBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

export interface PlayerHudProps {
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
  className?: string;
  variant?: "compact" | "full";
}

export function PlayerHud({
  level: propLevel,
  currentXp: propCurrentXp,
  nextLevelXp: propNextLevelXp,
  className,
  variant = "compact",
}: PlayerHudProps) {
  const { playerProfile, levelInfo, achievements, todayXp } = useGamification();

  const level = propLevel ?? levelInfo.level;
  const currentXp = propCurrentXp ?? playerProfile.xp;
  const nextLevelXp = propNextLevelXp ?? levelInfo.nextLevelXp;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {/* Active Focus Combo Badge (if combo > 0) */}
      <ComboBadge variant="compact" />

      {/* Unified Player Status Pill & Dropdown */}
      <DropdownMenu>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-2 h-8 pl-2 pr-2.5 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary/80 hover:border-border text-foreground transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-xs"
                  aria-label="Player profile, level and XP details"
                >
                  {/* Level Tag */}
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold tracking-tight text-amber-500 dark:text-amber-400">
                    <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500/20" />
                    <span>LV.{level}</span>
                  </span>

                  {/* Micro Progress Bar */}
                  <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, levelInfo.percentage))}%` }}
                    />
                  </div>

                  {/* Avatar Circle */}
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[9px] font-mono font-bold">
                    SQ
                  </div>

                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-popover border-border text-popover-foreground text-xs p-2 shadow-lg font-mono"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-amber-500 dark:text-amber-400">
                  {levelInfo.title} (LV. {level})
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {levelInfo.progressXp} / {levelInfo.neededXp} XP ({levelInfo.percentage}%) • Click for details
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent
          align="end"
          className="w-64 bg-popover border-border text-popover-foreground p-3 shadow-xl font-mono rounded-xl space-y-2.5"
        >
          <DropdownMenuLabel className="px-0 py-0 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Player Profile & Status
          </DropdownMenuLabel>

          {/* Level & XP Overview */}
          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-foreground">{levelInfo.title}</p>
                <p className="text-[10px] text-muted-foreground">Level {level}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 rounded font-bold">
                {currentXp} XP
              </span>
            </div>

            <div className="space-y-1">
              <XpBar
                currentXp={currentXp}
                nextLevelXp={nextLevelXp}
                showLabels={false}
                size="sm"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{levelInfo.progressXp} / {levelInfo.neededXp} XP</span>
                <span>{levelInfo.remainingXp} XP to LV.{level + 1}</span>
              </div>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="space-y-1.5 text-xs text-muted-foreground px-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Earned Today:
              </span>
              <span className="font-bold text-foreground">+{todayXp} XP</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Best Focus Combo:
              </span>
              <span className="font-bold text-foreground">×{playerProfile.bestCombo}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Achievements:
              </span>
              <span className="font-bold text-foreground">{unlockedCount} / {achievements.length}</span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-border/60" />
          <div className="text-[10px] text-muted-foreground text-center">
            SIDEQUEST • Gamified Execution OS
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
