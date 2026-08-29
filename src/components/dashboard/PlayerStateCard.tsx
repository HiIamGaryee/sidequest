import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { achievementImages } from "@/config/achievementBadges";
import { useRecovery } from "@/hooks/useRecovery";
import { useFocus } from "@/hooks/useFocus";
import { cn } from "@/lib/utils";

export interface PlayerStateCardProps {
  className?: string;
}

export function PlayerStateCard({ className }: PlayerStateCardProps) {
  const { status: focusStatus, elapsedSeconds, plannedMinutes } = useFocus();
  const { isDueAny, minutesSinceMovement, preferences, openRecoveryCenter } =
    useRecovery();

  const totalPlannedSeconds = Math.max(1, plannedMinutes * 60);
  const focusEnergyPercent =
    focusStatus === "running" || focusStatus === "paused"
      ? Math.max(10, Math.round(100 - (elapsedSeconds / (totalPlannedSeconds * 1.5)) * 90))
      : 100;

  const recoveryStatusLabel = !preferences.enabled
    ? "PAUSED"
    : isDueAny
    ? "DUE SOON"
    : "CLEAR";

  const recoveryVariant: "active" | "complete" | "idle" = !preferences.enabled
    ? "idle"
    : isDueAny
    ? "active"
    : "complete";

  const movementText =
    minutesSinceMovement !== null
      ? `${minutesSinceMovement} min seated`
      : "Active";

  return (
    <Card
      className={cn(
        "border-[#27272a] bg-[#18181b] rounded-xl select-none transition-all duration-200 hover:border-[#3f3f46]",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#09090b] border border-amber-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={achievementImages.playerStateEmblem}
                alt="Player State"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
              PLAYER STATE
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#a1a1aa]">CALIBRATED</span>
        </div>

        {/* Metrics Rows */}
        <div className="space-y-3 pt-1">
          {/* Focus Energy */}
          <div className="p-2.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1.5 transition-colors hover:border-[#3f3f46]/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={achievementImages.focusEnergyOrb}
                  alt="Focus Energy"
                  className="w-4 h-4 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-[#fafafa]">Focus Energy</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#fafafa]">
                {focusStatus === "running" ? `${focusEnergyPercent}%` : "100%"}
              </span>
            </div>
            <div className="w-full h-1 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                style={{ width: `${focusStatus === "running" ? focusEnergyPercent : 100}%` }}
              />
            </div>
          </div>

          {/* Recovery Cadence */}
          <button
            type="button"
            onClick={openRecoveryCenter}
            className="w-full text-left p-2.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1.5 transition-colors hover:border-emerald-500/40 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={achievementImages.recoveryHeartBadge}
                  alt="Recovery"
                  className="w-4 h-4 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-[#fafafa]">Recovery Status</span>
              </div>
              <StatusBadge
                status={recoveryVariant}
                label={recoveryStatusLabel}
                size="sm"
              />
            </div>
          </button>

          {/* Movement Check */}
          <div className="p-2.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1.5 transition-colors hover:border-[#3f3f46]/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={achievementImages.movementSwiftnessBadge}
                  alt="Movement"
                  className="w-4 h-4 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-[#fafafa]">Movement</span>
              </div>
              <span className="font-mono text-[11px] text-[#a1a1aa]">
                {movementText}
              </span>
            </div>
          </div>

          {/* Momentum */}
          <div className="p-2.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1.5 transition-colors hover:border-[#3f3f46]/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={achievementImages.momentumFireBadge}
                  alt="Momentum"
                  className="w-4 h-4 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-[#fafafa]">Momentum</span>
              </div>
              <StatusBadge
                status={focusStatus === "running" ? "focus" : "complete"}
                label={focusStatus === "running" ? "BUILDING" : "STABLE"}
                size="sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
