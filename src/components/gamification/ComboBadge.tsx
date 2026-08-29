import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Zap, ShieldCheck } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

export interface ComboBadgeProps {
  className?: string;
  variant?: "compact" | "detailed" | "inline";
  showLabel?: boolean;
}

export function ComboBadge({
  className,
  variant = "compact",
  showLabel = true,
}: ComboBadgeProps) {
  const { playerProfile, comboFeedback, settings } = useGamification();
  const shouldReduceMotion = useReducedMotion();

  const combo = playerProfile.currentCombo;
  const isProtected = comboFeedback?.protected;

  if (!settings.enabled || !settings.comboDisplay || combo <= 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded",
          className
        )}
      >
        <Zap className="w-3 h-3 fill-amber-400/40" />
        <span>×{combo}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#09090b] border border-amber-500/30 text-amber-400 font-mono text-xs shadow-xs select-none",
        isProtected && "border-emerald-500/30 text-emerald-400",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${combo}-${isProtected}`}
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          {isProtected ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          )}

          {showLabel && (
            <span className="text-[10px] uppercase font-bold text-[#a1a1aa] tracking-wider">
              {isProtected ? "PROTECTED" : "COMBO"}
            </span>
          )}

          <span className="font-bold text-xs tracking-tight">
            ×{combo}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
