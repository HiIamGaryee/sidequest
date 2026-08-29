import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuestContext } from "@/stores/QuestContext";
import { useDailyContext } from "@/stores/DailyContext";
import type { Quest } from "@/types/quest";
import { Target, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectDailyMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "main" | "side";
}

export function SelectDailyMissionDialog({
  open,
  onOpenChange,
  mode,
}: SelectDailyMissionDialogProps) {
  const { projects, quests, activeMainQuestId } = useQuestContext();
  const { loadout, setMainMission, addSideMission } = useDailyContext();
  const [alsoSetGlobalMain, setAlsoSetGlobalMain] = React.useState(true);

  // Group active quests by project
  const availableQuests = React.useMemo(() => {
    return quests.filter((q) => {
      if (mode === "main") {
        return q.id !== loadout.mainQuestId;
      } else {
        return !(loadout.sideQuestIds || []).includes(q.id) && q.id !== loadout.mainQuestId;
      }
    });
  }, [quests, mode, loadout.mainQuestId, loadout.sideQuestIds]);

  const handleSelect = (quest: Quest) => {
    if (mode === "main") {
      setMainMission(quest.id, alsoSetGlobalMain);
    } else {
      addSideMission(quest.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#09090b] text-[#fafafa] border-[#27272a] p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-wide uppercase flex items-center gap-2">
            <Target className="w-4 h-4 text-[#0047ba] dark:text-blue-400" />
            {mode === "main" ? "Assign Daily Main Mission" : "Add Daily Side Mission"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#a1a1aa]">
            {mode === "main"
              ? "Choose the single highest-priority quest you commit to advancing today."
              : "Pick up to 2 secondary quests to support your daily focus."}
          </DialogDescription>
        </DialogHeader>

        {mode === "main" && (
          <div className="py-2 border-b border-[#27272a]/80">
            <label className="flex items-center gap-2 text-xs text-[#a1a1aa] cursor-pointer">
              <input
                type="checkbox"
                checked={alsoSetGlobalMain}
                onChange={(e) => setAlsoSetGlobalMain(e.target.checked)}
                className="rounded border-[#27272a] bg-[#18181b] text-[#0047ba] focus:ring-0"
              />
              <span>Also switch app-wide Main Quest to this quest</span>
            </label>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-3 py-2">
          {projects.map((proj) => {
            const projectQuests = availableQuests.filter((q) => q.projectId === proj.id);
            if (projectQuests.length === 0) return null;

            return (
              <div key={proj.id} className="space-y-1.5">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71717a] px-1">
                  {proj.name}
                </div>
                <div className="space-y-1">
                  {projectQuests.map((quest) => {
                    const isGlobalMain = quest.id === activeMainQuestId;
                    const isComplete = quest.status === "completed" || quest.progress >= 100;

                    return (
                      <button
                        key={quest.id}
                        type="button"
                        onClick={() => handleSelect(quest)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-[#27272a]/60 transition-all flex items-center justify-between group",
                          isGlobalMain && "border-[#0047ba]/60"
                        )}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#fafafa] truncate">
                              {quest.title}
                            </span>
                            {isGlobalMain && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#0047ba]/20 text-blue-400 border border-[#0047ba]/30">
                                ACTIVE MAIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#71717a] flex items-center gap-2 mt-0.5">
                            <span>{quest.progress}% progress</span>
                            {quest.priority === "high" && (
                              <span className="text-amber-400 font-medium">High priority</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#71717a] group-hover:text-[#fafafa] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {availableQuests.length === 0 && (
            <div className="text-center py-6 text-xs text-[#71717a]">
              No available quests found. Create a new quest first.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-[#27272a] text-xs"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
