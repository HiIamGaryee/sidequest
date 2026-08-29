import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Split, Sparkles, Zap, ArrowRight } from "lucide-react";
import type { Quest } from "@/types/quest";
import { cn } from "@/lib/utils";

export interface BreakItDownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: Quest;
  onAddSteps: (steps: { title: string; isTiny: boolean }[]) => void;
}

const TEMPLATES = [
  {
    name: "Standard Coding",
    steps: [
      { title: "Read requirements and open relevant files", isTiny: true },
      { title: "Define interfaces and data types", isTiny: false },
      { title: "Implement core function / component logic", isTiny: false },
      { title: "Test happy path and error cases", isTiny: false },
      { title: "Review diff and clean up formatting", isTiny: true },
    ],
  },
  {
    name: "Micro 2-Min Steps",
    steps: [
      { title: "Open the file and find the function", isTiny: true },
      { title: "Write down 1 test input", isTiny: true },
      { title: "Write 1 line of implementation", isTiny: true },
      { title: "Run 1 quick test in terminal", isTiny: true },
    ],
  },
  {
    name: "Debugging / Investigation",
    steps: [
      { title: "Reproduce the error locally", isTiny: true },
      { title: "Locate exact error stack line", isTiny: true },
      { title: "Apply minimal fix", isTiny: false },
      { title: "Verify error is gone", isTiny: true },
    ],
  },
];

export function BreakItDownDialog({
  open,
  onOpenChange,
  quest,
  onAddSteps,
}: BreakItDownDialogProps) {
  const [draftSteps, setDraftSteps] = React.useState<{ title: string; isTiny: boolean }[]>([]);
  const [newStepInput, setNewStepInput] = React.useState("");
  const [isTiny, setIsTiny] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDraftSteps([]);
      setNewStepInput("");
      setIsTiny(false);
    }
  }, [open]);

  const handleAddDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newStepInput.trim();
    if (!trimmed) return;
    setDraftSteps((prev) => [...prev, { title: trimmed, isTiny }]);
    setNewStepInput("");
    setIsTiny(false);
  };

  const handleApplyTemplate = (templateSteps: { title: string; isTiny: boolean }[]) => {
    setDraftSteps(templateSteps);
  };

  const handleRemoveDraft = (index: number) => {
    setDraftSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (draftSteps.length > 0) {
      onAddSteps(draftSteps);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#18181b] border-[#27272a] text-[#fafafa] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold">
              <Split className="w-3.5 h-3.5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Break It Down
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#a1a1aa] pt-1">
            Turn <span className="font-semibold text-white">"{quest.title}"</span> into small, finishable micro-actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
          {/* Quick template recipes */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
              Quick Breakdown Templates
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.steps)}
                  className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-left hover:border-white/40 hover:bg-[#1f1f23] transition-all cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#fafafa] group-hover:text-white flex items-center justify-between">
                    <span>{tmpl.name}</span>
                    <Sparkles className="w-3 h-3 text-[#71717a] group-hover:text-white" />
                  </p>
                  <p className="text-[10px] text-[#71717a] font-mono mt-0.5">
                    {tmpl.steps.length} sequential steps
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Add custom step input */}
          <div className="space-y-1.5 pt-1 border-t border-[#27272a]">
            <Label htmlFor="step-builder-input" className="text-xs text-[#a1a1aa]">
              Add custom step
            </Label>
            <form onSubmit={handleAddDraft} className="flex items-center gap-1.5">
              <Input
                id="step-builder-input"
                value={newStepInput}
                onChange={(e) => setNewStepInput(e.target.value)}
                placeholder="Type a step and press Enter..."
                className="h-8 text-xs bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b]"
              />
              <button
                type="button"
                onClick={() => setIsTiny(!isTiny)}
                title={isTiny ? "Tiny step active" : "Mark as Tiny step"}
                className={cn(
                  "h-8 px-2 rounded-md border text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0",
                  isTiny
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
                )}
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Tiny</span>
              </button>
              <Button
                type="submit"
                disabled={!newStepInput.trim()}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-white shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </form>
          </div>

          {/* Preview of steps to be generated */}
          <div className="space-y-2 pt-1 border-t border-[#27272a]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Generated Step List ({draftSteps.length})
              </span>
              {draftSteps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDraftSteps([])}
                  className="text-[10px] font-mono text-[#71717a] hover:text-red-400 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {draftSteps.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#09090b] border border-dashed border-[#27272a] text-center space-y-1">
                <p className="text-xs text-[#a1a1aa]">
                  No steps added yet.
                </p>
                <p className="text-[11px] text-[#71717a]">
                  Pick a template above or type your own micro-steps.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {draftSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-[#09090b] border border-[#27272a] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-[#71717a] w-4 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="truncate text-white/90">{step.title}</span>
                      {step.isTiny && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] shrink-0">
                          TINY
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraft(idx)}
                      className="p-1 text-[#71717a] hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#27272a]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={draftSteps.length === 0}
            onClick={handleSaveAll}
            className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs cursor-pointer"
          >
            Add {draftSteps.length} Steps to Quest
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
