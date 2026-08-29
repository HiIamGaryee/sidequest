import * as React from "react";
import { AlertCircle, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface BlockerAlertProps {
  questId: string;
  blocker?: string;
  onUpdateBlocker: (questId: string, blocker?: string) => void;
  className?: string;
}

export function BlockerAlert({
  questId,
  blocker,
  onUpdateBlocker,
  className,
}: BlockerAlertProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(blocker || "");

  if (!blocker && !isEditing) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editValue.trim();
    onUpdateBlocker(questId, trimmed || undefined);
    setIsEditing(false);
  };

  const handleClear = () => {
    onUpdateBlocker(questId, undefined);
    setIsEditing(false);
    setEditValue("");
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5",
        className
      )}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        {isEditing ? (
          <form onSubmit={handleSave} className="flex items-center gap-1.5 flex-1 min-w-0">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="What is blocking this quest?"
              className="h-7 text-xs bg-[#09090b] border-amber-500/40 text-amber-100 placeholder:text-amber-300/40"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="h-7 px-2 text-xs bg-amber-400 text-black hover:bg-amber-300 font-semibold cursor-pointer"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-7 px-2 text-xs text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 cursor-pointer"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              PARKED BLOCKER
            </span>
            <p className="text-xs text-amber-100/90 font-medium leading-tight break-words">
              {blocker}
            </p>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => {
              setEditValue(blocker || "");
              setIsEditing(true);
            }}
            className="p-1 rounded text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Edit blocker note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Resolve / Clear blocker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
