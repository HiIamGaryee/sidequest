import * as React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, ArrowRight, Play, LayoutDashboard, Sparkles, FolderKanban, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusStatusBadge } from "./FocusStatusBadge";
import type { FocusSession } from "@/types/focus";
import { formatDurationHuman } from "@/lib/focus-utils";
import { useRecovery } from "@/hooks/useRecovery";
import { RECOVERY_CONFIG } from "@/config/recovery";
import { cn } from "@/lib/utils";

export interface FocusSessionSummaryProps {
  session: FocusSession;
  nextAction?: string;
  onStartAnother: () => void;
  className?: string;
}

export function FocusSessionSummary({
  session,
  nextAction,
  onStartAnother,
  className,
}: FocusSessionSummaryProps) {
  const { getLogsForSession } = useRecovery();
  const sessionRecoveryLogs = getLogsForSession(session.id);
  const durationText = formatDurationHuman(session.elapsedSeconds, false);
  const startProgress = session.startingProgress ?? 0;
  const endProgress = session.endingProgress ?? startProgress;
  const progressDelta = endProgress - startProgress;
  const completedTitles = session.completedStepTitles || [];

  return (
    <div
      className={cn(
        "bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-10 space-y-6 max-w-xl mx-auto shadow-md relative overflow-hidden text-center",
        className
      )}
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent" />

      {/* Header status */}
      <div className="flex items-center justify-center gap-2">
        <FocusStatusBadge status="COMPLETE" size="sm" />
        <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
          SUMMARY
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
          Session Complete
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-md mx-auto">
          Solid work protecting your attention. Here is what was accomplished:
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-3 text-left">
        {/* Focused Duration */}
        <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717a] uppercase">
            <Clock className="w-3.5 h-3.5 text-[#a1a1aa]" />
            <span>FOCUSED FOR</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">{durationText}</p>
        </div>

        {/* Progress Shift */}
        <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717a] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>PROGRESS</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              {startProgress}% → {endProgress}%
            </span>
            {progressDelta > 0 && (
              <span className="text-xs font-mono text-[#22c55e] font-semibold">
                (+{progressDelta}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quest Details Panel */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 sm:p-5 text-left space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#71717a] uppercase">
            MAIN QUEST
          </span>
          <p className="text-base font-semibold text-white">
            {session.questTitle}
          </p>
          {session.projectName && (
            <p className="text-xs text-[#a1a1aa] flex items-center gap-1 font-mono">
              <FolderKanban className="w-3 h-3 text-[#71717a]" />
              {session.projectName}
            </p>
          )}
        </div>

        {/* Completed Steps in this session */}
        {completedTitles.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-wider">
              COMPLETED IN THIS SESSION ({completedTitles.length})
            </span>
            <div className="space-y-1.5">
              {completedTitles.map((title, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-white/90 font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Completed in this session */}
        {sessionRecoveryLogs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
              MAINTENANCE LOGGED ({sessionRecoveryLogs.length})
            </span>
            <div className="space-y-1.5">
              {sessionRecoveryLogs.map((log) => {
                const cfg = RECOVERY_CONFIG[log.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-2 text-xs text-white/90 font-medium"
                  >
                    <Icon className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="truncate">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next up */}
        {nextAction && (
          <div className="space-y-1 pt-2 border-t border-[#27272a]">
            <span className="text-[10px] font-mono text-[#71717a] uppercase">
              STILL NEXT
            </span>
            <p className="text-xs text-[#a1a1aa] font-medium truncate">
              {nextAction}
            </p>
          </div>
        )}
      </div>

      {/* Navigation and Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="default"
          asChild
          className="w-full sm:flex-1 border-[#27272a] hover:bg-[#27272a] text-white font-medium cursor-pointer h-11"
        >
          <Link to="/">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Button
          type="button"
          variant="default"
          size="default"
          onClick={onStartAnother}
          className="w-full sm:flex-1 bg-white text-black hover:bg-[#e4e4e7] font-bold cursor-pointer h-11 shadow-sm"
        >
          <Play className="w-4 h-4 mr-2 fill-black" />
          Start Another Session
        </Button>
      </div>
    </div>
  );
}
