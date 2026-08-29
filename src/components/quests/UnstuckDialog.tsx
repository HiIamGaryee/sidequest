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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LifeBuoy,
  Minimize2,
  FastForward,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Quest, QuestStep } from "@/types/quest";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";

export interface UnstuckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: Quest;
  currentActionTitle?: string;
  firstIncompleteStep?: QuestStep | null;
  onMakeSmaller: (tinyTitle: string) => void;
  onAddTinyStep: (tinyTitle: string) => void;
  onSkipStep: () => void;
  onParkBlocker: (blockerText: string) => void;
}

type UnstuckTab = "make-smaller" | "tiny-step" | "skip" | "blocker";

export function UnstuckDialog({
  open,
  onOpenChange,
  quest,
  currentActionTitle,
  firstIncompleteStep,
  onMakeSmaller,
  onAddTinyStep,
  onSkipStep,
  onParkBlocker,
}: UnstuckDialogProps) {
  const { awardXp, incrementCombo, evaluateAchievements } = useGamification();
  const [activeTab, setActiveTab] = React.useState<UnstuckTab>("make-smaller");
  const [smallerInput, setSmallerInput] = React.useState("");
  const [tinyInput, setTinyInput] = React.useState("");
  const [blockerInput, setBlockerInput] = React.useState(quest.blocker || "");

  React.useEffect(() => {
    if (open) {
      setActiveTab("make-smaller");
      setSmallerInput("");
      setTinyInput("");
      setBlockerInput(quest.blocker || "");
    }
  }, [open, quest.blocker]);

  const activeAction =
    currentActionTitle ||
    firstIncompleteStep?.title ||
    quest.nextAction ||
    quest.title;

  const triggerUnstuckReward = (label: string) => {
    const actionId = `unstuck-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    awardXp({
      type: "unstuck_action",
      referenceId: actionId,
      label,
    });
    incrementCombo("unstuck_action");
    evaluateAchievements({ unstuckCount: 1 });
  };

  const handleMakeSmallerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smallerInput.trim()) return;
    onMakeSmaller(smallerInput.trim());
    triggerUnstuckReward("Made Step Smaller");
    onOpenChange(false);
  };

  const handleTinyStepSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tinyInput.trim()) return;
    onAddTinyStep(tinyInput.trim());
    triggerUnstuckReward("Added Micro Step");
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkipStep();
    triggerUnstuckReward("Skipped Blocked Step");
    onOpenChange(false);
  };

  const handleBlockerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!blockerInput.trim()) return;
    onParkBlocker(blockerInput.trim());
    triggerUnstuckReward("Parked Blocker");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#18181b] border-[#27272a] text-[#fafafa] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-400 text-black flex items-center justify-center font-bold">
              <LifeBuoy className="w-3.5 h-3.5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Unstuck Mode
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#a1a1aa] pt-1">
            Task resistance is normal. Pick one low-friction rescue tactic below.
          </DialogDescription>
        </DialogHeader>

        {/* Current Objective Context Box */}
        <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a]">
            <span>CURRENT RESISTANCE POINT</span>
            <span>{quest.title}</span>
          </div>
          <p className="text-xs text-white font-medium flex items-center gap-1.5 break-words">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
            "{activeAction}"
          </p>
        </div>

        {/* Tactical Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#09090b] border border-[#27272a] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("make-smaller")}
            className={cn(
              "px-2 py-1.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center gap-1 cursor-pointer",
              activeTab === "make-smaller"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
            )}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Make Smaller</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tiny-step")}
            className={cn(
              "px-2 py-1.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center gap-1 cursor-pointer",
              activeTab === "tiny-step"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Add Tiny Step</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("skip")}
            className={cn(
              "px-2 py-1.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center gap-1 cursor-pointer",
              activeTab === "skip"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
            )}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip for Now</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("blocker")}
            className={cn(
              "px-2 py-1.5 rounded-md text-[11px] font-medium transition-all flex flex-col items-center gap-1 cursor-pointer",
              activeTab === "blocker"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Park Blocker</span>
          </button>
        </div>

        {/* Tab 1: Make Smaller */}
        {activeTab === "make-smaller" && (
          <form onSubmit={handleMakeSmallerSubmit} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs text-white font-medium">
                What is the laughable 2-minute starting slice?
              </Label>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                Insert a micro-step right in front of the current action so you can start without cognitive load.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={smallerInput}
                onChange={(e) => setSmallerInput(e.target.value)}
                placeholder="e.g. Open index.html and read line 20"
                className="bg-[#09090b] border-[#27272a] text-xs text-white placeholder:text-[#52525b]"
                autoFocus
              />

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  "Open file & look at imports",
                  "Write 1-line comment for what to do",
                  "Create empty stub function",
                  "Read only the first paragraph",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setSmallerInput(sug)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#27272a]">
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
                type="submit"
                disabled={!smallerInput.trim()}
                className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs cursor-pointer"
              >
                Insert Micro-Step
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Add Tiny Step */}
        {activeTab === "tiny-step" && (
          <form onSubmit={handleTinyStepSubmit} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs text-white font-medium">
                Add an immediate standalone 2-minute step
              </Label>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                Add a quick win to build momentum.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={tinyInput}
                onChange={(e) => setTinyInput(e.target.value)}
                placeholder="e.g. Drink water and write 1 test case"
                className="bg-[#09090b] border-[#27272a] text-xs text-white placeholder:text-[#52525b]"
                autoFocus
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  "Write down 3 keywords",
                  "Verify dev server is running",
                  "Check schema types",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTinyInput(sug)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#27272a]">
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
                type="submit"
                disabled={!tinyInput.trim()}
                className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs cursor-pointer"
              >
                Add Tiny Step
                <Zap className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Skip for Now */}
        {activeTab === "skip" && (
          <div className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs text-white font-medium">
                Skip Current Step
              </Label>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                Staring at a step doesn't solve it. Move this step below the next one to keep moving forward without guilt or deletion.
              </p>
            </div>

            <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg text-xs space-y-1 text-[#a1a1aa]">
              <p>Will shift: <span className="text-white font-medium">"{activeAction}"</span></p>
              <p className="text-[11px] text-[#71717a]">The next item in your sequence will become your active Next Action.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#27272a]">
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
                onClick={handleSkip}
                className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-xs cursor-pointer"
              >
                Skip This Step
                <FastForward className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Tab 4: Park a Blocker */}
        {activeTab === "blocker" && (
          <form onSubmit={handleBlockerSubmit} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs text-white font-medium">
                Park what you're waiting on
              </Label>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                External dependency? Waiting on an email, PR review, or API token? Write it down to clear your working memory.
              </p>
            </div>

            <Textarea
              value={blockerInput}
              onChange={(e) => setBlockerInput(e.target.value)}
              placeholder="e.g. Waiting for client to email API credentials"
              rows={3}
              className="bg-[#09090b] border-[#27272a] text-xs text-white placeholder:text-[#52525b] resize-none"
              autoFocus
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-[#27272a]">
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
                type="submit"
                disabled={!blockerInput.trim()}
                className="bg-amber-400 text-black hover:bg-amber-300 font-bold text-xs cursor-pointer"
              >
                Save Blocker Note
                <AlertCircle className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
