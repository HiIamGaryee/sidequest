import * as React from "react";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronDown,
  X,
  Play,
  RotateCcw,
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecovery } from "@/hooks/useRecovery";
import { useFocus } from "@/hooks/useFocus";
import { RECOVERY_CONFIG, RECOVERY_SNOOZE_OPTIONS } from "@/config/recovery";
import type { RecoveryQuest } from "@/types/recovery";
import { cn } from "@/lib/utils";

export interface RecoveryQuestCardProps {
  quest?: RecoveryQuest | null;
  className?: string;
}

export function RecoveryQuestCard({ quest: propQuest, className }: RecoveryQuestCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const {
    activeQuest,
    activeTimerQuest,
    timerSeconds,
    timerInitialSeconds,
    isTimerRunning,
    formattedRecoveryTimer,
    startRecoveryQuest,
    completeRecoveryQuest,
    snoozeRecoveryQuest,
    skipRecoveryQuest,
    dismissRecoveryQuest,
    finishRecoveryTimer,
    cancelRecoveryTimer,
    logWater,
  } = useRecovery();

  const { status: focusStatus } = useFocus();

  const currentQuest = propQuest || activeQuest;

  // If no current quest and not running timer, return null
  if (!currentQuest && !isTimerRunning) {
    return null;
  }

  const targetQuest = isTimerRunning && activeTimerQuest ? activeTimerQuest : currentQuest;
  if (!targetQuest) return null;

  const config = RECOVERY_CONFIG[targetQuest.type];
  const Icon = config.icon;
  const isFocusing = focusStatus === "running";

  // Calculate timer progress percentage
  const timerPercent =
    timerInitialSeconds > 0
      ? Math.min(100, Math.max(0, ((timerInitialSeconds - timerSeconds) / timerInitialSeconds) * 100))
      : 0;

  const handlePrimaryAction = () => {
    if (config.isTimed) {
      startRecoveryQuest(targetQuest.id);
    } else {
      if (targetQuest.type === "water") {
        logWater();
      }
      completeRecoveryQuest(targetQuest.id);
    }
  };

  const handleDirectDone = () => {
    if (targetQuest.type === "water") {
      logWater();
    }
    completeRecoveryQuest(targetQuest.id);
  };

  const handleSnooze = (minutes: number) => {
    snoozeRecoveryQuest(targetQuest.id, minutes);
  };

  const handleSkip = () => {
    skipRecoveryQuest(targetQuest.id);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card
          className={cn(
            "border-[#3f3f46] bg-[#18181b] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10 select-none",
            isTimerRunning && "border-white/40 ring-white/20",
            className
          )}
        >
          {/* Subtle top indicator bar */}
          <div className="h-1 w-full bg-[#27272a] overflow-hidden">
            {isTimerRunning ? (
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${timerPercent}%` }}
              />
            ) : (
              <div className="h-full bg-white/40 w-full" />
            )}
          </div>

          <CardContent className="p-5 sm:p-6 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-white shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#a1a1aa] uppercase">
                      RECOVERY QUEST
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      • {config.badgeLabel}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#fafafa] leading-snug">
                    {config.title}
                  </h4>
                </div>
              </div>

              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => dismissRecoveryQuest(targetQuest.id)}
                className="h-7 w-7 text-[#71717a] hover:text-white hover:bg-[#27272a]"
                aria-label="Dismiss prompt"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Content: Timer Mode vs Standard Prompt Mode */}
            {isTimerRunning ? (
              <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] text-center space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
                    RECOVERY IN PROGRESS
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                    {formattedRecoveryTimer}
                  </div>
                  <p className="text-xs text-[#a1a1aa] max-w-xs mx-auto">
                    {config.description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={finishRecoveryTimer}
                    className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs font-mono cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-black" />
                    Done Early
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelRecoveryTimer}
                    className="border-[#27272a] text-[#a1a1aa] hover:text-white text-xs font-mono"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {config.description}
                </p>

                {isFocusing && config.isTimed && (
                  <div className="p-2 rounded-md bg-[#09090b] border border-[#27272a] text-[11px] text-[#71717a] flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-[#a1a1aa]" />
                    <span>Focus timer will pause during recovery</span>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#27272a]/60">
                  {/* Skip Option */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs font-mono text-[#71717a] hover:text-[#a1a1aa] h-8 px-2"
                  >
                    {targetQuest.type === "bio"
                      ? "I'm Good"
                      : targetQuest.type === "break"
                      ? "Keep Going"
                      : "Skip"}
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Snooze Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-mono border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-white flex items-center gap-1"
                        >
                          <span>Later</span>
                          <ChevronDown className="w-3 h-3 text-[#71717a]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#18181b] border-[#27272a] text-[#fafafa] text-xs font-mono"
                      >
                        {RECOVERY_SNOOZE_OPTIONS.map((mins) => (
                          <DropdownMenuItem
                            key={mins}
                            onClick={() => handleSnooze(mins)}
                            className="cursor-pointer text-xs"
                          >
                            In {mins} minutes
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* If timed, also offer direct Done button for users who already did it */}
                    {config.isTimed && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDirectDone}
                        className="h-8 px-2.5 text-xs font-mono border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-white"
                        title="Already done"
                      >
                        Done
                      </Button>
                    )}

                    {/* Primary Trigger Button */}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handlePrimaryAction}
                      className="h-8 px-3 text-xs font-mono font-bold bg-white text-black hover:bg-[#e4e4e7] cursor-pointer shadow-xs"
                    >
                      {config.primaryActionLabel}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
