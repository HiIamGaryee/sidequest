import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  badgeText?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  badgeText,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[#27272a] bg-[#09090b] p-8 sm:p-12 text-center space-y-3",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#27272a] flex items-center justify-center mb-1">
        {Icon ? (
          <Icon className="w-4 h-4 text-[#71717a]" />
        ) : (
          <div className="w-2 h-2 bg-[#27272a] rounded-full" />
        )}
      </div>
      {badgeText && (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#71717a] bg-[#18181b] border border-[#27272a]">
          {badgeText}
        </span>
      )}
      <h3 className="text-base font-medium text-[#fafafa] tracking-tight">{title}</h3>
      <p className="max-w-sm text-sm text-[#71717a] leading-relaxed">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
