import * as React from "react";
import { RECOVERY_CONFIG } from "@/config/recovery";
import type { RecoveryLog } from "@/types/recovery";
import { formatRecoveryTimeAgo } from "@/lib/recovery-utils";

export interface RecoveryHistoryItemProps {
  log: RecoveryLog;
}

export function RecoveryHistoryItem({ log }: RecoveryHistoryItemProps) {
  const config = RECOVERY_CONFIG[log.type];
  const Icon = config.icon;

  const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-3.5 bg-[#09090b] border border-[#27272a] rounded-lg flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-white shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{config.label}</span>
            <span className="text-[10px] font-mono text-[#71717a]">
              • {config.badgeLabel}
            </span>
          </div>
          <p className="text-[11px] text-[#71717a] font-mono">
            {log.durationSeconds && log.durationSeconds > 0
              ? `Completed (${Math.round(log.durationSeconds / 60)} min)`
              : "Completed"}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-[11px] font-mono font-medium text-[#fafafa]">
          {timeFormatted}
        </span>
        <p className="text-[10px] font-mono text-[#71717a]">
          {formatRecoveryTimeAgo(log.timestamp)}
        </p>
      </div>
    </div>
  );
}
