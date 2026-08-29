import * as React from "react";
import { Play, Pause, Square, Sparkles, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FocusStatusBadge, type FocusBadgeStatus } from "./FocusStatusBadge";
import { cn } from "@/lib/utils";

export interface FocusTimerProps {
  status: "running" | "paused" | "completed" | "idle";
  formattedTimer: string;
  formattedOvertime: string;
  isOvertime: boolean;
  isTimesUpPromptVisible: boolean;
  plannedMinutes: number;
  elapsedSeconds: number;
  onPause: () => void;
  onResume: () => void;
  onEndSession: () => void;
  onContinueOvertime: () => void;
  className?: string;
}

export function FocusTimer({
  status,
  formattedTimer,
  formattedOvertime,
  isOvertime,
  isTimesUpPromptVisible,
  plannedMinutes,
  elapsedSeconds,
  onPause,
  onResume,
  onEndSession,
  onContinueOvertime,
  className,
}: FocusTimerProps) {
  const [showEndConfirm, setShowEndConfirm] = React.useState(false);

  const badgeStatus: FocusBadgeStatus = isOvertime
    ? "OVERTIME"
    : status === "paused"
    ? "PAUSED"
    : "FOCUSING";

  const totalPlannedSeconds = plannedMinutes * 60;
  const progressPercent =
    totalPlannedSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / totalPlannedSeconds) * 100))
      : 0;

  const handleConfirmEnd = () => {
    setShowEndConfirm(false);
    onEndSession();
  };

  return (
    <>
      <div
        className={cn(
          "bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden transition-all",
          isOvertime && "border-orange-500/40 shadow-sm shadow-orange-500/10",
          status === "paused" && "border-amber-500/30",
          className
        )}
      >
        {/* Subtle background ambient pulse */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Top badge and session meta */}
        <div className="w-full flex items-center justify-between gap-2">
          <FocusStatusBadge status={badgeStatus} size="sm" />
          <span className="text-[11px] font-mono text-[#71717a]">
            {isOvertime ? "OVERTIME SPRINT" : `${plannedMinutes}m SPRINT`}
          </span>
        </div>

        {/* Main Center Timer Display */}
        <div className="space-y-3 py-2">
          <div
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "text-5xl sm:text-6xl font-mono font-bold tracking-tight tabular-nums select-none transition-colors",
              isOvertime
                ? "text-orange-400"
                : status === "paused"
                ? "text-amber-300"
                : "text-[#fafafa]"
            )}
          >
            {isOvertime ? formattedOvertime : formattedTimer}
          </div>

          <div className="space-y-1">
            {isOvertime ? (
              <p className="text-xs font-mono text-orange-400 font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Extra time counting up. Stop whenever ready.
              </p>
            ) : status === "paused" ? (
              <p className="text-xs text-amber-300/90 font-medium">
                Paused. Your progress is completely safe.
              </p>
            ) : (
              <p className="text-xs text-[#71717a] font-mono">
                {progressPercent}% of planned sprint elapsed
              </p>
            )}
          </div>
        </div>

        {/* Time's up banner if active prompt */}
        {isTimesUpPromptVisible && (
          <div className="w-full p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold font-mono text-orange-300 uppercase tracking-wider">
                  TIME'S UP
                </h4>
                <p className="text-xs text-white/90">
                  Want to finish this thought? Keep going without interruption or stop now.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={onContinueOvertime}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs cursor-pointer flex-1"
              >
                Continue In Overtime
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowEndConfirm(true)}
                className="border-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] text-xs cursor-pointer"
              >
                End Session
              </Button>
            </div>
          </div>
        )}

        {/* Primary Controls Row */}
        <div className="w-full flex items-center justify-center gap-3 pt-2">
          {status === "running" ? (
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onPause}
              className="border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-white font-medium cursor-pointer flex-1 max-w-[160px] h-10"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={onResume}
              className="bg-white text-black hover:bg-[#e4e4e7] font-bold cursor-pointer flex-1 max-w-[160px] h-10 shadow-xs"
            >
              <Play className="w-4 h-4 mr-2 fill-black" />
              Resume
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => setShowEndConfirm(true)}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium cursor-pointer h-10 px-4"
          >
            <Square className="w-3.5 h-3.5 mr-1.5 fill-red-400" />
            End Session
          </Button>
        </div>
      </div>

      {/* End Session Confirmation Dialog */}
      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent className="sm:max-w-md bg-[#18181b] border-[#27272a] text-[#fafafa]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              End focus session?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#a1a1aa] pt-1 leading-relaxed">
              You can stop here. Your quest progress and completed steps will stay exactly where they are.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg text-xs space-y-1 font-mono text-[#a1a1aa]">
            <div className="flex justify-between">
              <span>Time focused:</span>
              <span className="text-white font-bold">{Math.floor(elapsedSeconds / 60)} min</span>
            </div>
            <div className="flex justify-between">
              <span>Sprint status:</span>
              <span className="text-white capitalize">{status}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEndConfirm(false)}
              className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] text-xs cursor-pointer"
            >
              Continue Focus
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmEnd}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
