import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface XpBarProps {
  currentXp?: number;
  nextLevelXp?: number;
  showLabels?: boolean;
  className?: string;
  barClassName?: string;
  size?: "sm" | "default" | "lg";
}

export function XpBar({
  currentXp = 0,
  nextLevelXp = 100,
  showLabels = true,
  className,
  barClassName,
  size = "default",
}: XpBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((currentXp / nextLevelXp) * 100))
  );

  const heightClasses = {
    sm: "h-1",
    default: "h-1.5",
    lg: "h-2",
  };

  return (
    <div className={cn("flex flex-col gap-1 select-none", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-bold text-[#71717a] tracking-wider uppercase">
            XP
          </span>
          <span className="text-[#a1a1aa] font-mono tracking-tight">
            {currentXp} / {nextLevelXp}
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[#27272a] rounded-full overflow-hidden relative",
          heightClasses[size],
          barClassName
        )}
        role="progressbar"
        aria-valuenow={currentXp}
        aria-valuemin={0}
        aria-valuemax={nextLevelXp}
        aria-label={`XP Progress: ${currentXp} of ${nextLevelXp}`}
      >
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.8, ease: "easeOut" }
          }
        />
      </div>
    </div>
  );
}
