import * as React from "react";
import { Clock, CheckCircle2, Flame, FolderKanban, Sparkles } from "lucide-react";
import type { FocusSession } from "@/types/focus";
import { formatDurationHuman } from "@/lib/focus-utils";
import { cn } from "@/lib/utils";

export interface FocusSessionCardProps {
  session: FocusSession;
  className?: string;
}

export function FocusSessionCard({ session, className }: FocusSessionCardProps) {
  const durationText = formatDurationHuman(session.elapsedSeconds, false);
  const startProgress = session.startingProgress ?? 0;
  const endProgress = session.endingProgress ?? startProgress;
  const progressDelta = endProgress - startProgress;
  const completedCount = session.completedStepTitles?.length || 0;

  const dateObj = session.endedAt
    ? new Date(session.endedAt)
    : new Date(session.startedAt);

  const formattedTime = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-all space-y-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold">
              <Flame className="w-3 h-3 text-white" />
              {durationText}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">
              {formattedTime}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-[#fafafa] leading-snug truncate">
            {session.questTitle}
          </h4>

          {session.projectName && (
            <p className="text-xs text-[#a1a1aa] flex items-center gap-1 font-mono">
              <FolderKanban className="w-3 h-3 text-[#71717a]" />
              <span className="truncate">{session.projectName}</span>
            </p>
          )}
        </div>

        {/* Progress tag */}
        <div className="text-right shrink-0 font-mono space-y-0.5">
          <div className="text-xs font-bold text-white">
            {startProgress}% → {endProgress}%
          </div>
          {progressDelta > 0 && (
            <div className="text-[10px] text-[#22c55e] font-semibold">
              +{progressDelta}%
            </div>
          )}
        </div>
      </div>

      {/* Completed steps checklist if any */}
      {completedCount > 0 && (
        <div className="pt-2 border-t border-[#27272a] space-y-1">
          <span className="text-[10px] font-mono text-[#71717a] uppercase">
            {completedCount} {completedCount === 1 ? "STEP" : "STEPS"} COMPLETED
          </span>
          <div className="space-y-0.5">
            {session.completedStepTitles?.map((title, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-[#a1a1aa]"
              >
                <CheckCircle2 className="w-3 h-3 text-[#22c55e] shrink-0" />
                <span className="truncate">{title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
