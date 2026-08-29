import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChallengeContext } from "@/stores/ChallengeContext";
import { useQuestContext } from "@/stores/QuestContext";
import { CHALLENGE_PRESETS } from "@/config/challenges";
import type { ChallengeType } from "@/types/challenge";
import { Timer, Zap, Target, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeLauncherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultQuestId?: string;
}

export function ChallengeLauncherDialog({
  open,
  onOpenChange,
  defaultQuestId,
}: ChallengeLauncherDialogProps) {
  const { startChallenge, activeChallenge } = useChallengeContext();
  const { quests, activeMainQuestId, getMainQuest } = useQuestContext();
  const mainQuest = getMainQuest();

  const [selectedType, setSelectedType] = React.useState<ChallengeType>("timed_action");
  const [selectedQuestId, setSelectedQuestId] = React.useState<string>(
    defaultQuestId || activeMainQuestId || (quests[0]?.id ?? "")
  );

  React.useEffect(() => {
    if (defaultQuestId) {
      setSelectedQuestId(defaultQuestId);
    } else if (activeMainQuestId) {
      setSelectedQuestId(activeMainQuestId);
    } else if (quests.length > 0 && !selectedQuestId) {
      setSelectedQuestId(quests[0].id);
    }
  }, [defaultQuestId, activeMainQuestId, quests, selectedQuestId]);

  const handleLaunch = () => {
    const res = startChallenge(selectedType, selectedQuestId);
    if (res.success) {
      onOpenChange(false);
    }
  };

  const getPresetIcon = (type: ChallengeType) => {
    switch (type) {
      case "timed_action":
        return <Timer className="w-5 h-5 text-amber-400" />;
      case "step_count":
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case "main_quest_progress":
        return <Target className="w-5 h-5 text-rose-400" />;
      case "no_switch":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#09090b] text-[#fafafa] border-[#27272a] p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-wide uppercase flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Launch Work Challenge
          </DialogTitle>
          <DialogDescription className="text-xs text-[#a1a1aa]">
            Voluntary short-burst sprints. No guilt or penalties if you fall short — just real focus momentum.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Quest Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#fafafa]">
              Target Quest
            </label>
            <select
              value={selectedQuestId}
              onChange={(e) => setSelectedQuestId(e.target.value)}
              className="w-full h-9 rounded-lg bg-[#18181b] border border-[#27272a] px-3 text-xs text-[#fafafa] focus:outline-none focus:ring-1 focus:ring-[#0047ba]"
            >
              {quests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} {q.id === activeMainQuestId ? "(Main Quest)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Cards Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#fafafa]">
              Select Challenge Sprint
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHALLENGE_PRESETS.map((preset) => {
                const isSelected = selectedType === preset.type;

                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => setSelectedType(preset.type)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2",
                      isSelected
                        ? "bg-[#18181b] border-[#0047ba] ring-1 ring-[#0047ba]/40 shadow-sm"
                        : "bg-[#141418] border-[#27272a] hover:border-[#3f3f46]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                        {getPresetIcon(preset.type)}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#09090b] text-amber-400 border border-amber-500/20">
                        +{preset.xpReward} XP
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#fafafa]">
                        {preset.title}
                      </div>
                      <p className="text-[11px] text-[#71717a] mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-[#27272a] text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleLaunch}
            disabled={!selectedQuestId}
            className="bg-[#0047ba] hover:bg-[#003894] text-white text-xs font-semibold"
          >
            Engage Challenge
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
