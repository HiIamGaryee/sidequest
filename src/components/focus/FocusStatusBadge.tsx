import * as React from "react";
import { Play, Pause, Clock, CheckCircle2, Flame, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FocusBadgeStatus = "READY" | "FOCUSING" | "PAUSED" | "OVERTIME" | "COMPLETE";

export interface FocusStatusBadgeProps {
  status: FocusBadgeStatus;
  className?: string;
  size?: "sm" | "default";
}

export function FocusStatusBadge({
  status,
  className,
  size = "default",
}: FocusStatusBadgeProps) {
  const config = React.useMemo(() => {
    switch (status) {
      case "READY":
        return {
          icon: Clock,
          label: "READY",
          bg: "bg-[#09090b] border-[#27272a] text-[#a1a1aa]",
          dot: "bg-[#a1a1aa]",
        };
      case "FOCUSING":
        return {
          icon: Flame,
          label: "FOCUSING",
          bg: "bg-white/10 border-white/30 text-white",
          dot: "bg-white animate-pulse",
        };
      case "PAUSED":
        return {
          icon: Pause,
          label: "PAUSED",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          dot: "bg-amber-400",
        };
      case "OVERTIME":
        return {
          icon: AlertCircle,
          label: "OVERTIME",
          bg: "bg-orange-500/15 border-orange-500/30 text-orange-300",
          dot: "bg-orange-400 animate-ping",
        };
      case "COMPLETE":
        return {
          icon: CheckCircle2,
          label: "COMPLETED",
          bg: "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]",
          dot: "bg-[#22c55e]",
        };
    }
  }, [status]);

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono font-semibold tracking-wider select-none",
        config.bg,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      <Icon className={cn("shrink-0", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>{config.label}</span>
    </span>
  );
}
