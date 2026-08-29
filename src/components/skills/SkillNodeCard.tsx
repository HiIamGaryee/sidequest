import * as React from "react";
import type { SkillProgressInfo } from "@/types/skill";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Shield,
  Heart,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillNodeCardProps {
  skill: SkillProgressInfo;
}

export function SkillNodeCard({ skill }: SkillNodeCardProps) {
  const { definition, state, currentCount, targetCount, percentage, unlockedAt } = skill;

  const getBranchIcon = () => {
    switch (definition.branch) {
      case "focus":
        return <Zap className="w-4 h-4 text-blue-400" />;
      case "finishing":
        return <Target className="w-4 h-4 text-amber-400" />;
      case "resilience":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "recovery":
        return <Heart className="w-4 h-4 text-emerald-400" />;
    }
  };

  const isUnlocked = state === "unlocked";
  const isAvailable = state === "available";
  const isLocked = state === "locked";

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all space-y-3 relative group",
        isUnlocked
          ? "bg-[#0d1410] border-emerald-500/40 shadow-sm"
          : isAvailable
          ? "bg-[#141418] border-[#3f3f46] hover:border-[#0047ba]/60 shadow-xs"
          : "bg-[#0c0c0e] border-[#27272a]/50 opacity-60"
      )}
    >
      {/* Top Header: Icon, Title, Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "p-2 rounded-xl border shrink-0",
              isUnlocked
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : isAvailable
                ? "bg-[#18181b] border-[#27272a] text-[#fafafa]"
                : "bg-[#18181b] border-[#27272a] text-[#71717a]"
            )}
          >
            {isUnlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : isLocked ? (
              <Lock className="w-4 h-4 text-[#71717a]" />
            ) : (
              getBranchIcon()
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#fafafa] truncate">
              {definition.title}
            </h4>
            <div className="text-[10px] font-mono text-[#71717a] uppercase">
              Tier {definition.level} • {definition.branch}
            </div>
          </div>
        </div>

        <div>
          {isUnlocked ? (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              UNLOCKED
            </span>
          ) : isAvailable ? (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#0047ba]/20 text-blue-400 border border-[#0047ba]/30">
              IN PROGRESS
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#18181b] text-[#71717a] border border-[#27272a]">
              LOCKED
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#a1a1aa] leading-relaxed">
        {definition.description}
      </p>

      {/* Real Work Progress Meter */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#71717a]">Requirements:</span>
          <span className="text-[#fafafa] font-bold">
            {Math.min(currentCount, targetCount)} / {targetCount} ({percentage}%)
          </span>
        </div>
        <Progress
          value={percentage}
          className={cn(
            "h-1.5",
            isUnlocked
              ? "bg-emerald-950/40"
              : isAvailable
              ? "bg-[#27272a]"
              : "bg-[#18181b]"
          )}
        />
      </div>

      {/* Cosmetic Title Reward */}
      <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-[#a1a1aa]">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] uppercase font-mono text-[#71717a]">Title:</span>
          <span className="font-semibold text-amber-300">"{definition.cosmeticTitle}"</span>
        </div>

        {isUnlocked && unlockedAt && (
          <span className="text-[9px] font-mono text-[#71717a]">
            {unlockedAt.split("T")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
