import * as React from "react";
import {
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestStep } from "@/types/quest";
import { cn } from "@/lib/utils";

export interface QuestStepItemProps {
  step: QuestStep;
  index: number;
  totalSteps: number;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isFirstIncomplete?: boolean;
}

export function QuestStepItem({
  step,
  index,
  totalSteps,
  onComplete,
  onReopen,
  onUpdateTitle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirstIncomplete = false,
}: QuestStepItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(step.title);
  const isCompleted = step.status === "completed";

  const handleToggle = () => {
    if (isCompleted) {
      onReopen(step.id);
    } else {
      onComplete(step.id);
    }
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== step.title) {
      onUpdateTitle(step.id, trimmed);
    } else {
      setEditTitle(step.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditTitle(step.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg border transition-all duration-150 select-none",
        isCompleted
          ? "bg-[#09090b]/60 border-[#27272a]/60 text-[#71717a]"
          : isFirstIncomplete
          ? "bg-[#1f1f23] border-white/30 text-[#fafafa] shadow-xs"
          : "bg-[#09090b] border-[#27272a] text-[#fafafa] hover:border-[#3f3f46]"
      )}
    >
      {/* Left Column: Checkbox & Step Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Custom Accessible Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCompleted ? `Mark "${step.title}" as incomplete` : `Mark "${step.title}" as complete`}
          className={cn(
            "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 cursor-pointer border",
            isCompleted
              ? "bg-[#22c55e] border-[#22c55e] text-black"
              : isFirstIncomplete
              ? "border-white bg-[#09090b] hover:bg-white/10"
              : "border-[#52525b] bg-[#09090b] hover:border-white"
          )}
        >
          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Step Index or Next Action Icon */}
        <span
          className={cn(
            "text-[10px] font-mono shrink-0 w-4 text-center",
            isCompleted ? "text-[#52525b]" : isFirstIncomplete ? "text-white font-bold" : "text-[#71717a]"
          )}
        >
          {index + 1}.
        </span>

        {/* Step Content / Inline Edit */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-1.5 min-w-0">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSaveEdit()}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-6 text-xs bg-[#18181b] border-white/40 text-white px-2 py-0"
            />
          </form>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              onDoubleClick={() => {
                if (!isCompleted) setIsEditing(true);
              }}
              className={cn(
                "text-xs font-medium truncate leading-tight cursor-default",
                isCompleted && "line-through text-[#71717a]",
                isFirstIncomplete && !isCompleted && "font-semibold text-white"
              )}
              title={step.title}
            >
              {step.title}
            </span>

            {/* Tiny Step Indicator */}
            {step.isTiny && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-semibold shrink-0">
                <Zap className="w-2.5 h-2.5" />
                TINY
              </span>
            )}

            {/* First Incomplete Badge (Next Action) */}
            {isFirstIncomplete && !isCompleted && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded bg-white text-black font-mono text-[9px] font-bold shrink-0">
                NEXT
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Actions (Reorder, Edit, Delete) */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
        {!isCompleted && !isEditing && (
          <>
            {onMoveUp && index > 0 && (
              <button
                type="button"
                onClick={() => onMoveUp(step.id)}
                className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
                title="Move step up"
                aria-label="Move step up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}

            {onMoveDown && index < totalSteps - 1 && (
              <button
                type="button"
                onClick={() => onMoveDown(step.id)}
                className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
                title="Move step down"
                aria-label="Move step down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
              title="Edit step"
              aria-label="Edit step"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onDelete(step.id)}
          className="p-1 rounded text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          title="Delete step"
          aria-label="Delete step"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
