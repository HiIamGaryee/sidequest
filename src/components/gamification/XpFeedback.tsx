import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sparkles, Zap, CheckCircle2, Trophy, Footprints, Droplets, RotateCcw } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import type { XpEventType } from "@/types/gamification";
import { cn } from "@/lib/utils";

function getEventIcon(type: XpEventType) {
  switch (type) {
    case "step_completed":
      return Zap;
    case "quest_completed":
    case "main_quest_completed":
      return Trophy;
    case "focus_session_completed":
      return Sparkles;
    case "resume_after_interruption":
      return RotateCcw;
    case "recovery_completed":
      return Droplets;
    default:
      return Sparkles;
  }
}

export function XpFeedback() {
  const { activeXpFeedback, dismissXpFeedback } = useGamification();
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (activeXpFeedback) {
      const timer = window.setTimeout(() => {
        dismissXpFeedback();
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [activeXpFeedback, dismissXpFeedback]);

  if (!activeXpFeedback) return null;

  const Icon = getEventIcon(activeXpFeedback.type);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none">
      <AnimatePresence>
        <motion.div
          key={activeXpFeedback.id}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 15, scale: 0.9 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -15, scale: 0.95 }
          }
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#18181b] border border-amber-500/30 text-[#fafafa] shadow-lg shadow-black/40 backdrop-blur-sm"
        >
          <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-3 h-3 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xs font-bold text-amber-400">
              +{activeXpFeedback.amount} XP
            </span>
            <span className="text-[11px] text-[#a1a1aa] font-medium max-w-[180px] truncate">
              {activeXpFeedback.label}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
