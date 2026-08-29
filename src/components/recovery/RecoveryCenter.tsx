import * as React from "react";
import {
  HeartPulse,
  Droplets,
  Footprints,
  Activity,
  Eye,
  CirclePause,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useRecovery } from "@/hooks/useRecovery";
import { useFocus } from "@/hooks/useFocus";
import { RECOVERY_CONFIG, RECOVERY_PRIORITY_ORDER } from "@/config/recovery";
import type { RecoveryType } from "@/types/recovery";

export function RecoveryCenter() {
  const {
    isRecoveryCenterOpen,
    closeRecoveryCenter,
    statusInfoList,
    recoveryLogs,
    createRecoveryQuest,
    startRecoveryQuest,
    logWater,
    logMovement,
    logStretch,
    logEyeBreak,
    logBioBreak,
    logGeneralBreak,
  } = useRecovery();

  const { status: focusStatus } = useFocus();
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleQuickLog = (type: RecoveryType) => {
    switch (type) {
      case "water":
        logWater();
        showFeedback("Logged water");
        break;
      case "movement":
        logMovement();
        showFeedback("Logged movement (2m)");
        break;
      case "stretch":
        logStretch();
        showFeedback("Logged stretch");
        break;
      case "eyes":
        logEyeBreak();
        showFeedback("Logged eye break (30s)");
        break;
      case "bio":
        logBioBreak();
        showFeedback("Logged bio break");
        break;
      case "break":
        logGeneralBreak();
        showFeedback("Logged break");
        break;
    }
  };

  const handleStartTimed = (type: RecoveryType) => {
    const quest = createRecoveryQuest(type);
    startRecoveryQuest(quest.id);
    closeRecoveryCenter();
  };

  // Group today's logs by type
  const countsByType = RECOVERY_PRIORITY_ORDER.reduce<Record<RecoveryType, number>>(
    (acc, type) => {
      acc[type] = recoveryLogs.filter((log) => log.type === type).length;
      return acc;
    },
    { water: 0, movement: 0, stretch: 0, eyes: 0, bio: 0, break: 0 }
  );

  return (
    <Sheet open={isRecoveryCenterOpen} onOpenChange={(open) => !open && closeRecoveryCenter()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#18181b] border-l border-[#27272a] text-[#fafafa] p-0 flex flex-col z-50 overflow-y-auto"
      >
        <div className="p-6 border-b border-[#27272a]/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <SheetTitle className="text-lg font-bold tracking-tight text-white">
              Recovery Center
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-[#a1a1aa] leading-relaxed">
            Work matters. The person doing the work also needs maintenance. Log quick actions or review recovery intervals.
          </SheetDescription>

          {feedbackMessage && (
            <div className="mt-2 p-2 rounded bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Quick Log Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase">
                QUICK MANUAL LOG
              </span>
              <span className="text-[10px] font-mono text-[#71717a]">1-CLICK</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {RECOVERY_PRIORITY_ORDER.map((type) => {
                const config = RECOVERY_CONFIG[type];
                const Icon = config.icon;
                const count = countsByType[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleQuickLog(type)}
                    className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] hover:border-white/30 hover:bg-[#27272a]/60 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group shadow-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-6 h-6 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] font-mono font-bold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded border border-[#22c55e]/20">
                          {count}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-white">
                        {config.label}
                      </p>
                      <span className="text-[10px] text-[#71717a] font-mono">
                        + Log {config.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recovery Cadence & Status List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase">
                MAINTENANCE CADENCE
              </span>
              <span className="text-[10px] font-mono text-[#71717a]">INTERVALS</span>
            </div>

            <div className="space-y-2">
              {statusInfoList.map((info) => {
                const config = RECOVERY_CONFIG[info.type];
                const Icon = config.icon;

                return (
                  <div
                    key={info.type}
                    className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">
                            {config.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              info.statusLabel === "READY"
                                ? "bg-white text-black border-white"
                                : info.statusLabel === "DUE SOON"
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : "bg-[#27272a] text-[#a1a1aa] border-transparent"
                            }`}
                          >
                            {info.statusLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71717a] font-mono">
                          {info.timeDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {config.isTimed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartTimed(info.type)}
                          className="h-7 px-2.5 text-[11px] font-mono border-[#27272a] hover:bg-[#27272a] text-white"
                        >
                          <Play className="w-2.5 h-2.5 mr-1 fill-white" />
                          Start
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLog(info.type)}
                          className="h-7 px-2.5 text-[11px] font-mono border-[#27272a] hover:bg-[#27272a] text-white"
                        >
                          Log
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Total Maintenance */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#71717a]">TODAY'S MAINTENANCE LOGS</span>
              <span className="font-bold text-white text-base">
                {recoveryLogs.length}
              </span>
            </div>
            <p className="text-[11px] text-[#71717a] leading-relaxed">
              Every break and hydration log supports sustained attention without burning out.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b]">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={closeRecoveryCenter}
            className="w-full border-[#27272a] text-white hover:bg-[#27272a] font-mono text-xs"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
