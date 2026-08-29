import * as React from "react";
import {
  ArrowUpRight,
  FolderKanban,
  Target,
  Flame,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSideQuests } from "@/hooks/useSideQuests";
import { useQuests } from "@/hooks/useQuests";
import type { SideQuest } from "@/types/side-quest";
import type { QuestPriority } from "@/types/quest";
import { cn } from "@/lib/utils";

interface PromoteSideQuestDialogProps {
  sideQuest: SideQuest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdQuestTitle: string) => void;
}

export function PromoteSideQuestDialog({
  sideQuest,
  open,
  onOpenChange,
  onSuccess,
}: PromoteSideQuestDialogProps) {
  const { promote } = useSideQuests();
  const { projects } = useQuests();

  const activeProjects = projects.filter((p) => p.status === "active");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [selectedPriority, setSelectedPriority] = React.useState<QuestPriority>("medium");

  React.useEffect(() => {
    if (open && activeProjects.length > 0) {
      setSelectedProjectId(activeProjects[0].id);
      setSelectedPriority("medium");
    }
  }, [open, activeProjects]);

  if (!sideQuest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    promote(sideQuest.id, selectedProjectId, selectedPriority);
    onSuccess?.(sideQuest.title);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-md p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-[#a1a1aa] uppercase">
                PROMOTE TO REAL QUEST
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              STEP 6
            </span>
          </div>

          {/* Side Quest preview */}
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-1">
            <span className="text-[10px] font-mono text-[#71717a] uppercase block">
              Parked Idea:
            </span>
            <p className="text-sm font-semibold text-[#fafafa] leading-snug">
              {sideQuest.title}
            </p>
          </div>

          <DialogDescription className="text-xs text-[#a1a1aa] leading-relaxed">
            Assign this idea to an active project. It will become a structured quest with micro-steps, but will{" "}
            <strong className="text-white">not replace</strong> your current Main Quest.
          </DialogDescription>

          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#a1a1aa] block uppercase">
              Target Project
            </label>
            {activeProjects.length === 0 ? (
              <p className="text-xs text-amber-400">No active projects available.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between cursor-pointer",
                      selectedProjectId === p.id
                        ? "bg-white text-black border-white font-bold"
                        : "bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {selectedProjectId === p.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#a1a1aa] block uppercase">
              Initial Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "low", label: "Low", icon: Sparkles, color: "text-blue-400" },
                  { id: "medium", label: "Medium", icon: Zap, color: "text-amber-400" },
                  { id: "high", label: "High", icon: Flame, color: "text-red-400" },
                ] as const
              ).map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPriority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriority(p.id)}
                    className={cn(
                      "py-2 px-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      isSelected
                        ? "bg-white text-black border-white font-bold"
                        : "bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]"
                    )}
                  >
                    <Icon
                      className={cn("w-3.5 h-3.5", isSelected ? "text-black" : p.color)}
                    />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
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
              disabled={!selectedProjectId}
              className="font-bold text-xs bg-white text-black hover:bg-[#e4e4e7] h-8 cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Create Quest
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
