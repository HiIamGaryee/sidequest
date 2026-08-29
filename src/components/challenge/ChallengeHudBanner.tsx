import * as React from "react";
import { Link } from "react-router-dom";
import {
  Timer,
  Zap,
  Target,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChallengeContext } from "@/stores/ChallengeContext";
import { cn } from "@/lib/utils";

export function ChallengeHudBanner() {
  const {
    activeChallenge,
    remainingSeconds,
    progressPercentage,
    completeChallenge,
    cancelChallenge,
    retryChallenge,
    clearActiveChallenge,
  } = useChallengeContext();

  if (!activeChallenge) {
    return null;
  }

  // Format seconds mm:ss
  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return "--:--";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = activeChallenge.status === "expired";

  return (
    <div
      id="challenge-hud-banner"
      className={cn(
        "w-full px-4 py-2.5 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b z-30",
        isExpired
          ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
          : "bg-[#141208] border-amber-500/40 text-[#fafafa] shadow-md"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div
          className={cn(
            "p-1.5 rounded-lg shrink-0",
            isExpired ? "bg-amber-500/20 text-amber-300" : "bg-amber-500/20 text-amber-400 animate-pulse"
          )}
        >
          {activeChallenge.type === "timed_action" ? (
            <Timer className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-amber-400 uppercase font-mono tracking-wider">
              {activeChallenge.title}
            </span>
            <span className="text-[11px] text-[#a1a1aa] truncate">
              on <span className="text-[#fafafa] font-semibold">{activeChallenge.questTitle}</span>
            </span>
          </div>

          {!isExpired ? (
            <div className="flex items-center gap-3 text-[11px] text-[#a1a1aa] mt-0.5">
              {activeChallenge.type === "timed_action" && (
                <span className="font-mono font-bold text-amber-300">
                  {formatTime(remainingSeconds)} remaining
                </span>
              )}
              {activeChallenge.type === "step_count" && (
                <span className="font-mono text-cyan-300">
                  Target: Complete {activeChallenge.targetValue} micro-steps
                </span>
              )}
              {activeChallenge.type === "main_quest_progress" && (
                <span className="font-mono text-rose-300">
                  Target: +{activeChallenge.targetValue}% Quest Progress
                </span>
              )}
              {activeChallenge.type === "no_switch" && (
                <span className="font-mono text-emerald-300">
                  Target: Complete 1 step without context switching
                </span>
              )}
              <span className="font-mono text-[#71717a]">
                +{activeChallenge.xpReward} XP Reward
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-amber-300/90 mt-0.5">
              CHALLENGE ENDED. Almost. No penalties. Reset or break it down.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {!isExpired ? (
          <>
            <Button
              size="sm"
              onClick={() => completeChallenge()}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete Sprint
            </Button>
            <button
              type="button"
              onClick={cancelChallenge}
              className="text-[#71717a] hover:text-[#fafafa] p-1 text-xs"
              title="Stand down challenge"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              onClick={retryChallenge}
              className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 text-xs border-amber-500/30 bg-[#18181b] text-[#fafafa]"
            >
              <Link to="/focus">
                <Scissors className="w-3 h-3 mr-1" />
                Make It Smaller
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActiveChallenge}
              className="h-7 text-xs text-[#a1a1aa] hover:text-[#fafafa]"
            >
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
