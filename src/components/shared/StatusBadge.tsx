import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/types/gamification";

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
  size?: "sm" | "default";
}

export function StatusBadge({
  status,
  label,
  className,
  size = "default",
}: StatusBadgeProps) {
  const configs: Record<
    StatusVariant,
    {
      defaultLabel: string;
      badgeClass: string;
      dotClass: string;
    }
  > = {
    idle: {
      defaultLabel: "IDLE",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#71717a]",
      dotClass: "bg-[#71717a]",
    },
    active: {
      defaultLabel: "ACTIVE",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#fafafa]",
      dotClass: "bg-[#22c55e] animate-pulse",
    },
    focus: {
      defaultLabel: "FOCUSING",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#22c55e]",
      dotClass: "bg-[#22c55e] animate-pulse",
    },
    complete: {
      defaultLabel: "COMPLETED",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#22c55e]",
      dotClass: "bg-[#22c55e]",
    },
    warning: {
      defaultLabel: "WARNING",
      badgeClass: "bg-[#18181b] border-[#27272a] text-amber-400",
      dotClass: "bg-amber-400 animate-pulse",
    },
    recovery: {
      defaultLabel: "RECOVERY",
      badgeClass: "bg-[#18181b] border-[#27272a] text-sky-400",
      dotClass: "bg-sky-400",
    },
    parked: {
      defaultLabel: "PARKED",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#a1a1aa]",
      dotClass: "bg-[#71717a]",
    },
    locked: {
      defaultLabel: "LOCKED",
      badgeClass: "bg-[#18181b] border-[#27272a] text-[#71717a]",
      dotClass: "bg-[#3f3f46]",
    },
  };

  const config = configs[status] || configs.idle;
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-mono uppercase tracking-wider transition-colors inline-flex items-center select-none",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        config.badgeClass,
        className
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5",
          config.dotClass
        )}
      />
      <span>{displayLabel}</span>
    </Badge>
  );
}

