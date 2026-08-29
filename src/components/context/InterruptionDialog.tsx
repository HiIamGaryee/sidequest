import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Play,
  Square,
  Home,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuests } from "@/hooks/useQuests";
import { useFocus } from "@/hooks/useFocus";
import { useContextKeeper } from "@/hooks/useContextKeeper";

interface InterruptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEndSession?: () => void;
}

export function InterruptionDialog({
  open,
  onOpenChange,
  onEndSession,
}: InterruptionDialogProps) {
  const navigate = useNavigate();
  const { getMainQuest, getQuestSteps, getQuestNextAction, getQuestProgress } = useQuests();
  const { resumeFocusSession, currentSession } = useFocus();
  const { saveWorkContext } = useContextKeeper();
  const [interruptionNote, setInterruptionNote] = React.useState("");

  const mainQuest = getMainQuest();
  const steps = mainQuest ? getQuestSteps(mainQuest.id) : [];
  const incomplete = steps.filter((s) => s.status !== "completed");
  const currentStep = incomplete.length > 0 ? incomplete[0] : undefined;
  const nextAction = mainQuest ? getQuestNextAction(mainQuest) : undefined;
  const progress = mainQuest ? getQuestProgress(mainQuest) : 0;

  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainQuest || !interruptionNote.trim()) return;

    saveWorkContext({
      questId: mainQuest.id,
      reason: "interruption",
      note: interruptionNote.trim(),
      currentStepId: currentStep?.id,
      nextAction,
      blocker: mainQuest.blocker,
      progress,
    });
  };

  const handleResume = () => {
    if (interruptionNote.trim() && mainQuest) {
      saveWorkContext({
        questId: mainQuest.id,
        reason: "interruption",
        note: interruptionNote.trim(),
        currentStepId: currentStep?.id,
        nextAction,
        blocker: mainQuest.blocker,
        progress,
      });
    }
    resumeFocusSession();
    onOpenChange(false);
  };

  const handleLeaveToDashboard = () => {
    if (interruptionNote.trim() && mainQuest) {
      saveWorkContext({
        questId: mainQuest.id,
        reason: "interruption",
        note: interruptionNote.trim(),
        currentStepId: currentStep?.id,
        nextAction,
        blocker: mainQuest.blocker,
        progress,
      });
    }
    onOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-md p-0 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-amber-400 uppercase">
                THREAD SAVED • INTERRUPTED
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              SESSION PAUSED
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#fafafa] tracking-tight">
              Your place is completely safe.
            </h3>
            <DialogDescription className="text-xs text-[#a1a1aa] leading-relaxed">
              We paused your focus timer and bookmarked your current quest state. Go take care of what came up.
            </DialogDescription>
          </div>

          {/* Snapshot Summary */}
          {mainQuest && (
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#71717a]">
                <span>SAVED FOCUS QUEST</span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <p className="font-semibold text-white truncate">{mainQuest.title}</p>
              {nextAction && (
                <div className="pt-1.5 border-t border-[#27272a] flex items-center gap-1.5 text-xs text-[#22c55e]">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-white/90">Next: {nextAction}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Note Input */}
          <form onSubmit={handleUpdateNote} className="space-y-1.5">
            <label className="text-xs font-mono text-[#a1a1aa] block uppercase">
              What interrupted you? (Optional reminder)
            </label>
            <Input
              value={interruptionNote}
              onChange={(e) => setInterruptionNote(e.target.value)}
              placeholder="e.g., Doorbell rang / Emergency Slack message..."
              className="bg-[#09090b] border-[#27272a] text-xs placeholder:text-[#52525b] focus-visible:ring-1 focus-visible:ring-white h-9"
            />
          </form>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLeaveToDashboard}
              className="text-xs border-[#27272a] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white h-8"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Leave Focus
            </Button>
            {onEndSession && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEndSession();
                }}
                className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 h-8"
              >
                <Square className="w-3 h-3 mr-1.5" />
                End Session
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleResume}
              className="font-bold text-xs bg-white text-black hover:bg-[#e4e4e7] cursor-pointer shadow-xs h-8"
            >
              <Play className="w-3 h-3 mr-1.5 fill-black" />
              Resume Focus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
