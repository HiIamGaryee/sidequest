import * as React from "react";
import { Play, Clock, ShieldCheck, Target, Sparkles, FolderKanban } from "lucide-react";
import type { Quest, Project } from "@/types/quest";
import { Button } from "@/components/ui/button";
import { FocusStatusBadge } from "./FocusStatusBadge";
import { cn } from "@/lib/utils";

export interface FocusSetupProps {
  quest: Quest;
  project?: Project | null;
  nextAction?: string;
  onStart: (durationMinutes: number) => void;
  className?: string;
}

const FOCUS_DURATIONS = [15, 25, 45, 60] as const;

export function FocusSetup({
  quest,
  project,
  nextAction,
  onStart,
  className,
}: FocusSetupProps) {
  const [selectedDuration, setSelectedDuration] = React.useState<number>(25);

  const handleStart = () => {
    onStart(selectedDuration);
  };

  return (
    <div
      className={cn(
        "bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto shadow-sm relative overflow-hidden",
        className
      )}
    >
      {/* Top subtle glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header status */}
      <div className="flex items-center gap-2">
        <FocusStatusBadge status="READY" size="sm" />
        <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
          SPRINT SETUP
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
          Ready to focus?
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
          One quest. One next action. Everything else can wait.
        </p>
      </div>

      {/* Main Quest & Next Action Info Panel */}
      <div className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-4 sm:p-5 text-left space-y-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] uppercase">
            <span>MAIN QUEST</span>
            {project && (
              <span className="flex items-center gap-1 text-[#a1a1aa] truncate max-w-[200px]">
                <FolderKanban className="w-3 h-3 text-[#71717a]" />
                {project.name}
              </span>
            )}
          </div>
          <p className="text-base font-semibold text-white tracking-tight">
            {quest.title}
          </p>
        </div>

        <div className="pt-2 border-t border-[#27272a] space-y-1">
          <span className="text-[10px] font-mono text-[#71717a] uppercase">
            STARTING WITH NEXT ACTION
          </span>
          <div className="flex items-start gap-2 pt-0.5">
            <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-white/90">
              {nextAction || "Execute first step or make progress"}
            </p>
          </div>
        </div>
      </div>

      {/* Duration selector */}
      <div className="w-full space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#a1a1aa] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#71717a]" />
            Session Length
          </span>
          <span className="text-white font-bold">{selectedDuration} minutes</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {FOCUS_DURATIONS.map((duration) => {
            const isSelected = selectedDuration === duration;
            return (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                className={cn(
                  "py-2.5 px-2 rounded-lg font-mono text-sm font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                  isSelected
                    ? "bg-white text-black border-white shadow-xs"
                    : "bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]"
                )}
              >
                <span>{duration}</span>
                <span
                  className={cn(
                    "text-[10px] font-normal",
                    isSelected ? "text-black/70" : "text-[#71717a]"
                  )}
                >
                  min
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="w-full pt-2">
        <Button
          type="button"
          size="lg"
          onClick={handleStart}
          className="w-full font-bold tracking-tight text-sm sm:text-base py-6 bg-white text-black hover:bg-[#e4e4e7] cursor-pointer shadow-md"
        >
          <Play className="mr-2 h-4 w-4 fill-black" />
          Start Focus ({selectedDuration}m)
        </Button>
      </div>
    </div>
  );
}
