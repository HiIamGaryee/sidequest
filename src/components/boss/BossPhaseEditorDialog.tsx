import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBossContext } from "@/stores/BossContext";
import { useQuestContext } from "@/stores/QuestContext";
import type { BossPhase } from "@/types/boss";
import { Swords, Plus, Trash2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BossPhaseEditorDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BossPhaseEditorDialog({
  projectId,
  open,
  onOpenChange,
}: BossPhaseEditorDialogProps) {
  const { getBossState, updateBossTitle, updateBossPhases, autoGeneratePhases } =
    useBossContext();
  const { getProjectQuests } = useQuestContext();

  const bossState = getBossState(projectId);
  const projectQuests = getProjectQuests(projectId);

  const [title, setTitle] = React.useState(bossState?.config.title || "");
  const [phases, setPhases] = React.useState<BossPhase[]>(
    bossState?.config.phases || []
  );

  React.useEffect(() => {
    if (bossState?.config) {
      setTitle(bossState.config.title || `BOSS: ${bossState.project.name}`);
      setPhases(bossState.config.phases || []);
    }
  }, [bossState]);

  const handleSave = () => {
    updateBossTitle(projectId, title.trim());
    updateBossPhases(projectId, phases);
    onOpenChange(false);
  };

  const handleAddPhase = () => {
    const newPhase: BossPhase = {
      id: `phase-${projectId}-${Date.now()}`,
      projectId,
      title: `Phase ${phases.length + 1}: Sprint Objectives`,
      order: phases.length + 1,
      questIds: [],
    };
    setPhases([...phases, newPhase]);
  };

  const handleRemovePhase = (index: number) => {
    const next = phases.filter((_, i) => i !== index).map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhases(next);
  };

  const handlePhaseTitleChange = (index: number, newTitle: string) => {
    const next = [...phases];
    next[index] = { ...next[index], title: newTitle };
    setPhases(next);
  };

  const toggleQuestInPhase = (phaseIndex: number, questId: string) => {
    const next = [...phases];
    const currentQuests = next[phaseIndex].questIds || [];
    if (currentQuests.includes(questId)) {
      next[phaseIndex] = {
        ...next[phaseIndex],
        questIds: currentQuests.filter((id) => id !== questId),
      };
    } else {
      next[phaseIndex] = {
        ...next[phaseIndex],
        questIds: [...currentQuests, questId],
      };
    }
    setPhases(next);
  };

  const handleAutoGenerate = () => {
    autoGeneratePhases(projectId);
    const updated = getBossState(projectId);
    if (updated) {
      setPhases(updated.config.phases || []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#09090b] text-[#fafafa] border-[#27272a] p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-wide uppercase flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-500" />
            Configure Boss Battle & Phases
          </DialogTitle>
          <DialogDescription className="text-xs text-[#a1a1aa]">
            Customize the Boss Battle title and divide your project quests into progressive battle phases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Boss Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#fafafa]">
              Boss Battle Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. THE APPARITION OF PROCRASTINATION"
              className="bg-[#18181b] border-[#27272a] text-xs"
            />
          </div>

          {/* Quick Auto-Generate Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-[#fafafa]">
              Battle Phases ({phases.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoGenerate}
              className="h-7 text-xs border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa]"
            >
              <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
              Auto-Distribute Quests
            </Button>
          </div>

          {/* Phases List */}
          <div className="space-y-3">
            {phases.map((phase, idx) => (
              <div
                key={phase.id}
                className="p-3.5 rounded-xl border border-[#27272a] bg-[#141418] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      P{idx + 1}
                    </span>
                    <Input
                      value={phase.title}
                      onChange={(e) => handlePhaseTitleChange(idx, e.target.value)}
                      className="h-7 bg-[#18181b] border-[#27272a] text-xs font-semibold"
                    />
                  </div>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhase(idx)}
                      className="text-[#71717a] hover:text-rose-400 p-1"
                      title="Delete phase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quests in phase checklist */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-mono uppercase text-[#71717a]">
                    Assigned Quests:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {projectQuests.map((q) => {
                      const isChecked = phase.questIds.includes(q.id);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => toggleQuestInPhase(idx, q.id)}
                          className={cn(
                            "text-left p-1.5 rounded text-[11px] border transition-all flex items-center justify-between",
                            isChecked
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-300 font-medium"
                              : "bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-[#fafafa]"
                          )}
                        >
                          <span className="truncate flex-1 pr-1">{q.title}</span>
                          {isChecked && <Check className="w-3 h-3 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPhase}
            className="w-full border-dashed border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa]"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Another Phase
          </Button>
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
            onClick={handleSave}
            className="bg-[#0047ba] hover:bg-[#003894] text-white text-xs font-semibold"
          >
            Save Boss Battle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
