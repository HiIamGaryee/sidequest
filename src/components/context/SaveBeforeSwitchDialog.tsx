import * as React from "react";
import { BookmarkPlus, ArrowRight, Target, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuests } from "@/hooks/useQuests";
import { useContextKeeper } from "@/hooks/useContextKeeper";
import type { Quest } from "@/types/quest";

interface SaveBeforeSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetQuest: Quest | null;
  onConfirmSwitch: (targetQuestId: string) => void;
}

export function SaveBeforeSwitchDialog({
  open,
  onOpenChange,
  targetQuest,
  onConfirmSwitch,
}: SaveBeforeSwitchDialogProps) {
  const { getMainQuest, getQuestSteps, getQuestNextAction, getQuestProgress } = useQuests();
  const { saveWorkContext } = useContextKeeper();
  const [note, setNote] = React.useState("");

  const currentMainQuest = getMainQuest();

  React.useEffect(() => {
    if (open) {
      setNote("");
    }
  }, [open]);

  if (!targetQuest || !currentMainQuest || currentMainQuest.id === targetQuest.id) {
    return null;
  }

  const handleSaveAndSwitch = () => {
    const steps = getQuestSteps(currentMainQuest.id);
    const incomplete = steps.filter((s) => s.status !== "completed");
    const currentStep = incomplete.length > 0 ? incomplete[0] : undefined;
    const nextAction = getQuestNextAction(currentMainQuest);
    const progress = getQuestProgress(currentMainQuest);

    saveWorkContext({
      questId: currentMainQuest.id,
      reason: "task-switch",
      note: note.trim() || undefined,
      currentStepId: currentStep?.id,
      nextAction,
      blocker: currentMainQuest.blocker,
      progress,
    });

    onConfirmSwitch(targetQuest.id);
    onOpenChange(false);
  };

  const handleDirectSwitch = () => {
    onConfirmSwitch(targetQuest.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-md p-0 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <BookmarkPlus className="w-3.5 h-3.5" />
              </div>
              <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-[#a1a1aa] uppercase">
                SAFE TASK SWITCH
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              CONTEXT KEEPER
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#fafafa] tracking-tight">
              Save your place before switching?
            </h3>
            <DialogDescription className="text-xs text-[#a1a1aa] leading-relaxed">
              You are leaving your current Main Quest. You can bookmark where you stopped so you can resume anytime without losing your mental thread.
            </DialogDescription>
          </div>

          {/* Quests transition comparison */}
          <div className="space-y-2 p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs">
            <div className="flex items-center justify-between text-[#71717a] font-mono text-[10px]">
              <span>CURRENT (LEAVING)</span>
              <span>NEW MAIN QUEST</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white/80 truncate text-xs">
                  {currentMainQuest.title}
                </p>
                <span className="text-[10px] font-mono text-[#71717a]">
                  {getQuestProgress(currentMainQuest)}% progress
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#71717a] shrink-0" />
              <div className="min-w-0 flex-1 text-right">
                <p className="font-semibold text-[#fafafa] truncate text-xs">
                  {targetQuest.title}
                </p>
                <span className="text-[10px] font-mono text-[#22c55e]">
                  Active focus
                </span>
              </div>
            </div>
          </div>

          {/* Optional note */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#a1a1aa] block uppercase">
              Quick note for future you (Optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Paused to fix urgent bug, return to complete step 2..."
              rows={2}
              className="bg-[#09090b] border-[#27272a] text-xs placeholder:text-[#52525b] focus-visible:ring-1 focus-visible:ring-white resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-[#a1a1aa] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDirectSwitch}
              className="text-xs border-[#27272a] hover:bg-[#27272a] text-[#fafafa]"
            >
              Switch Without Saving
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAndSwitch}
              className="font-bold text-xs bg-white text-black hover:bg-[#e4e4e7] cursor-pointer shadow-xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
              Save & Switch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
