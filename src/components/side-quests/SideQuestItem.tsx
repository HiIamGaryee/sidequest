import * as React from "react";
import {
  Inbox,
  ArrowUpRight,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuests } from "@/hooks/useQuests";
import { formatCapturedDate } from "@/lib/side-quest-utils";
import type { SideQuest } from "@/types/side-quest";
import { cn } from "@/lib/utils";

interface SideQuestItemProps {
  sideQuest: SideQuest;
  onPromote: (sideQuest: SideQuest) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function SideQuestItem({
  sideQuest,
  onPromote,
  onDismiss,
  onDelete,
  onRestore,
  className,
  compact = false,
}: SideQuestItemProps) {
  const { quests } = useQuests();
  const sourceQuest = sideQuest.sourceQuestId
    ? quests.find((q) => q.id === sideQuest.sourceQuestId)
    : undefined;

  const isParked = sideQuest.status === "parked";
  const isPromoted = sideQuest.status === "promoted";
  const isDismissed = sideQuest.status === "dismissed";

  return (
    <div
      className={cn(
        "group p-3 rounded-lg bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        isDismissed && "opacity-50 hover:opacity-75 bg-[#0e0e11]",
        isPromoted && "border-[#22c55e]/20 bg-[#22c55e]/5",
        className
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {isPromoted && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e]">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Promoted to Quest
            </span>
          )}
          {isDismissed && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#27272a] text-[#71717a]">
              Dismissed
            </span>
          )}
          <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatCapturedDate(sideQuest.createdAt)}
          </span>
        </div>

        <p
          className={cn(
            "text-xs font-medium text-[#fafafa] leading-snug break-words",
            isDismissed && "line-through text-[#71717a]"
          )}
        >
          {sideQuest.title}
        </p>

        {sourceQuest && (
          <p className="text-[10px] text-[#71717a] font-mono truncate">
            From: <span className="text-[#a1a1aa]">{sourceQuest.title}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        {isParked && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPromote(sideQuest)}
              className="h-7 px-2.5 text-[11px] font-mono border-[#27272a] hover:bg-white hover:text-black text-[#fafafa] font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Promote
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => onDismiss(sideQuest.id)}
              className="h-7 w-7 text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a]"
              title="Dismiss idea"
            >
              <Archive className="w-3 h-3" />
            </Button>
          </>
        )}

        {isDismissed && onRestore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRestore(sideQuest.id)}
            className="h-7 px-2 text-[11px] font-mono text-[#a1a1aa] hover:text-white"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restore
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={() => onDelete(sideQuest.id)}
          className="h-7 w-7 text-[#71717a] hover:text-red-400 hover:bg-red-500/10"
          title="Delete permanently"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
