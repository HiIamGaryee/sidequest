import * as React from "react";
import { CheckCircle2, Play, ArrowRight, ShieldCheck, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecovery } from "@/hooks/useRecovery";
import { useFocus } from "@/hooks/useFocus";
import { RECOVERY_CONFIG } from "@/config/recovery";

export function RecoveryCompletionCard() {
  const shouldReduceMotion = useReducedMotion();
  const { completedRecoveryNotification, dismissCompletedNotification } = useRecovery();
  const { status: focusStatus, resumeFocusSession } = useFocus();

  if (!completedRecoveryNotification) return null;

  const { quest, mainQuestTitle, nextAction } = completedRecoveryNotification;
  const config = RECOVERY_CONFIG[quest.type];
  const Icon = config.icon;

  const handleResume = () => {
    if (focusStatus === "paused") {
      resumeFocusSession();
    }
    dismissCompletedNotification();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card className="border-[#22c55e]/40 bg-[#18181b] shadow-2xl rounded-xl overflow-hidden ring-1 ring-[#22c55e]/20">
          <CardContent className="p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#22c55e] uppercase">
                    RECOVERY COMPLETE
                  </span>
                  <h4 className="text-sm font-semibold text-[#fafafa]">
                    Ready when you are.
                  </h4>
                </div>
              </div>

              <Button
                variant="ghost"
                size="iconSm"
                onClick={dismissCompletedNotification}
                className="h-7 w-7 text-[#71717a] hover:text-white hover:bg-[#27272a]"
                aria-label="Dismiss completion"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Context Reminder if Main Quest exists */}
            {mainQuestTitle ? (
              <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-[#71717a] uppercase">
                  YOU WERE WORKING ON:
                </span>
                <p className="font-medium text-white/95">{mainQuestTitle}</p>
                {nextAction && (
                  <div className="pt-1 border-t border-[#27272a]/60 flex items-center gap-1.5 text-[#a1a1aa] text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-[#22c55e] shrink-0" />
                    <span className="truncate">Next: {nextAction}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Great job taking a moment for maintenance. Your body thanks you.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={dismissCompletedNotification}
                className="text-xs font-mono text-[#a1a1aa] hover:text-white"
              >
                Dismiss
              </Button>

              {focusStatus === "paused" ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleResume}
                  className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs font-mono cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 mr-1.5 fill-black" />
                  Resume Focus
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={dismissCompletedNotification}
                  className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs font-mono cursor-pointer shadow-xs"
                >
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
