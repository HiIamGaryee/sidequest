import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Trophy, Sparkles, X } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { getAchievementBadge, achievementImages } from "@/config/achievementBadges";

export function AchievementUnlock() {
  const { activeAchievementToast, dismissAchievementToast } = useGamification();
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (activeAchievementToast) {
      const timer = window.setTimeout(() => {
        dismissAchievementToast();
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [activeAchievementToast, dismissAchievementToast]);

  if (!activeAchievementToast) return null;

  const badgeImg = getAchievementBadge(
    activeAchievementToast.id,
    activeAchievementToast.category
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full select-none"
      >
        <div className="bg-[#18181b] border-2 border-amber-500/40 rounded-xl p-3.5 sm:p-4 shadow-2xl shadow-amber-500/10 flex items-start gap-3.5 relative overflow-hidden backdrop-blur-md">
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />

          {/* Badge Artwork */}
          <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-inner">
            <img
              src={badgeImg}
              alt={activeAchievementToast.title}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              <Trophy className="w-3 h-3" />
              <span>ACHIEVEMENT UNLOCKED</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold font-mono text-[#fafafa] tracking-wide truncate">
              {activeAchievementToast.title}
            </h4>
            <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-tight">
              {activeAchievementToast.description}
            </p>
            <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-amber-400">
              <span>+{activeAchievementToast.xpReward} XP</span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={dismissAchievementToast}
            className="text-[#71717a] hover:text-[#fafafa] p-1 -mr-1 -mt-1 rounded cursor-pointer transition-colors"
            aria-label="Dismiss achievement notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
