import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sparkles, ArrowRight, Trophy, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/hooks/useGamification";
import { XpBar } from "./XpBar";
import { achievementImages } from "@/config/achievementBadges";

export function LevelUpDialog() {
  const { activeLevelUp, dismissLevelUp, playerProfile, levelInfo } = useGamification();
  const shouldReduceMotion = useReducedMotion();

  if (!activeLevelUp) return null;

  const levelDelta = activeLevelUp.newLevel - activeLevelUp.oldLevel;

  return (
    <Dialog open={!!activeLevelUp} onOpenChange={(open) => !open && dismissLevelUp()}>
      <DialogContent className="bg-[#18181b] border-amber-500/30 text-[#fafafa] max-w-sm sm:max-w-md p-6 sm:p-8 text-center rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Badge Crest */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.5, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-[#09090b] border-2 border-amber-500/40 p-2 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] relative"
          >
            <img
              src={achievementImages.rankNovice}
              alt="Level Up Crest"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-xs font-mono font-black px-2 py-0.5 rounded-md shadow-md border border-black/30">
              LV. {activeLevelUp.newLevel}
            </div>
          </motion.div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{levelDelta > 1 ? `LEVEL UP ×${levelDelta}` : "LEVEL UP"}</span>
            </div>

            <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
              {activeLevelUp.newTitle.toUpperCase()}
            </DialogTitle>

            <DialogDescription className="text-xs text-[#a1a1aa] max-w-xs mx-auto">
              Nice. You are statistically less haunted by unfinished tasks.
            </DialogDescription>
          </div>

          {/* Transition Pill */}
          <div className="p-3.5 bg-[#09090b] border border-[#27272a] rounded-xl flex items-center justify-center gap-4 text-xs font-mono">
            <span className="text-[#71717a]">
              LV. {activeLevelUp.oldLevel}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-400">
              LV. {activeLevelUp.newLevel}
            </span>
          </div>

          {/* XP Bar preview */}
          <div className="space-y-1.5 pt-1">
            <XpBar
              currentXp={playerProfile.xp}
              nextLevelXp={levelInfo.nextLevelXp}
              showLabels={true}
              size="default"
            />
            <p className="text-[10px] font-mono text-[#71717a]">
              {levelInfo.remainingXp} XP until Level {activeLevelUp.newLevel + 1}
            </p>
          </div>

          {/* Dismiss Action */}
          <Button
            type="button"
            variant="default"
            onClick={dismissLevelUp}
            className="w-full bg-white text-black hover:bg-[#e4e4e7] font-bold cursor-pointer h-10 shadow-sm"
          >
            Continue Focus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
