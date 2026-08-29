import * as React from "react";
import {
  BookmarkPlus,
  ShieldCheck,
  Clock,
  Sparkles,
  Check,
  CornerDownLeft,
} from "lucide-react";
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
import type { ContextReason } from "@/types/work-context";
import { cn } from "@/lib/utils";

interface SaveContextDialogProps {
  questId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: ContextReason;
  onSuccess?: (note?: string) => void;
}

export function SaveContextDialog({
  questId,
  open,
  onOpenChange,
  reason = "manual",
  onSuccess,
}: SaveContextDialogProps) {
  const { quests, getMainQuest, getMainQuestProject, getProject, getQuestSteps, getQuestNextAction, getQuestProgress } = useQuests();
  const { saveWorkContext } = useContextKeeper();

  const [note, setNote] = React.useState("");

  const targetQuest = questId
    ? quests.find((q) => q.id === questId)
    : getMainQuest();

  const targetProject = targetQuest
    ? getProject(targetQuest.projectId)
    : getMainQuestProject();

  const steps = targetQuest ? getQuestSteps(targetQuest.id) : [];
  const incompleteSteps = steps.filter((s) => s.status !== "completed");
  const currentStep = incompleteSteps.length > 0 ? incompleteSteps[0] : undefined;
  const nextAction = targetQuest ? getQuestNextAction(targetQuest) : undefined;
  const progress = targetQuest ? getQuestProgress(targetQuest) : 0;

  React.useEffect(() => {
    if (open) {
      setNote("");
    }
  }, [open]);

  if (!targetQuest) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWorkContext({
      questId: targetQuest.id,
      reason,
      note: note.trim() || undefined,
      currentStepId: currentStep?.id,
      nextAction,
      blocker: targetQuest.blocker,
      progress,
    });

    onSuccess?.(note.trim() || undefined);
    onOpenChange(false);
  };

  const sampleSnippets = [
    "Stopped right before writing tests",
    "Waiting on feedback from team",
    "Next: finish implementing the button handler",
    "Got stuck on API response format",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-md p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center">
                <BookmarkPlus className="w-3.5 h-3.5" />
              </div>
              <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-[#a1a1aa] uppercase">
                SAVE WORK CONTEXT
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              CONTEXT KEEPER
            </span>
          </div>

          {/* Auto-filled snapshot snapshot info */}
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#71717a] uppercase">
                Active Thread:
              </span>
              <span className="text-[10px] font-mono font-bold text-white">
                {progress}% complete
              </span>
            </div>
            <p className="text-sm font-semibold text-[#fafafa] leading-snug">
              {targetQuest.title}
            </p>
            {targetProject && (
              <p className="text-xs text-[#71717a]">
                Project: <span className="text-[#a1a1aa]">{targetProject.name}</span>
              </p>
            )}

            {nextAction && (
              <div className="pt-2 border-t border-[#27272a] flex items-center gap-2 text-xs text-[#22c55e]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="text-white/90 text-xs truncate">
                  Next Action: {nextAction}
                </span>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#a1a1aa] block uppercase">
              Anything future-you should know? (Optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Left off at step 3, need to check CORS headers tomorrow..."
              rows={3}
              className="bg-[#09090b] border-[#27272a] text-xs placeholder:text-[#52525b] focus-visible:ring-1 focus-visible:ring-white resize-none"
            />

            {/* Quick snippet chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sampleSnippets.map((snippet) => (
                <button
                  key={snippet}
                  type="button"
                  onClick={() => setNote(snippet)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#71717a] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors cursor-pointer text-left"
                >
                  + {snippet}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
            <span className="text-[11px] text-[#71717a]">
              Snapshot stays in memory
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs text-[#a1a1aa] hover:text-white hover:bg-[#27272a] h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold text-xs bg-white text-black hover:bg-[#e4e4e7] h-8 cursor-pointer shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                Save Context
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
