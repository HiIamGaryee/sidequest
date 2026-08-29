import * as React from "react";
import {
  Bookmark,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContextKeeper } from "@/hooks/useContextKeeper";
import { formatContextTimeAgo } from "@/lib/context-utils";
import type { WorkContext, ContextReason } from "@/types/work-context";
import { cn } from "@/lib/utils";

interface ContextHistoryProps {
  questId: string;
  className?: string;
  onRestoreContext?: (context: WorkContext) => void;
}

const REASON_BADGES: Record<ContextReason, { label: string; bg: string; text: string }> = {
  manual: {
    label: "Manual",
    bg: "bg-blue-500/10",
    text: "text-blue-400 border-blue-500/20",
  },
  interruption: {
    label: "Interrupted",
    bg: "bg-amber-500/10",
    text: "text-amber-400 border-amber-500/20",
  },
  "task-switch": {
    label: "Task Switch",
    bg: "bg-purple-500/10",
    text: "text-purple-400 border-purple-500/20",
  },
  "session-end": {
    label: "Session Wrap",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400 border-emerald-500/20",
  },
};

export function ContextHistory({
  questId,
  className,
  onRestoreContext,
}: ContextHistoryProps) {
  const { getQuestContexts, deleteWorkContext } = useContextKeeper();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const contexts = getQuestContexts(questId);

  if (contexts.length === 0) {
    return null;
  }

  const preview = contexts.slice(0, isExpanded ? contexts.length : 2);

  return (
    <div className={cn("space-y-2 rounded-lg bg-[#09090b] border border-[#27272a] p-3.5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-[#a1a1aa]" />
          <h5 className="text-[10px] font-mono font-bold tracking-wider text-[#a1a1aa] uppercase">
            SAVED THREADS ({contexts.length})
          </h5>
        </div>
        {contexts.length > 2 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-mono text-[#71717a] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? "Collapse" : `View all (${contexts.length})`}</span>
            {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>

      <div className="space-y-2 pt-1">
        {preview.map((ctx) => {
          const badge = REASON_BADGES[ctx.reason] || REASON_BADGES.manual;
          return (
            <div
              key={ctx.id}
              className="p-2.5 rounded-md bg-[#18181b] border border-[#27272a] space-y-1.5 text-xs hover:border-[#3f3f46] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border uppercase",
                      badge.bg,
                      badge.text
                    )}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatContextTimeAgo(ctx.savedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-[#a1a1aa]">
                    {ctx.progress}% done
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteWorkContext(ctx.id)}
                    className="text-[#71717a] hover:text-red-400 p-0.5 ml-1"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {ctx.note && (
                <p className="text-xs text-[#fafafa] italic pl-2 border-l border-white/20">
                  “{ctx.note}”
                </p>
              )}

              {ctx.nextAction && (
                <p className="text-[11px] text-[#71717a] truncate font-mono">
                  Next action: <span className="text-white/80">{ctx.nextAction}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
