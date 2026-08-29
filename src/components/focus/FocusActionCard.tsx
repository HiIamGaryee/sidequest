import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  LifeBuoy,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  FolderKanban,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnstuckDialog } from "@/components/quests/UnstuckDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Quest, QuestStep, Project } from "@/types/quest";
import { cn } from "@/lib/utils";

export interface FocusActionCardProps {
  quest: Quest;
  project?: Project | null;
  steps: QuestStep[];
  progress: number;
  nextAction?: string;
  onCompleteStep: (stepId: string) => void;
  onCreateStep: (input: { questId: string; title: string; isTiny?: boolean }) => void;
  onMakeStepSmaller: (questId: string, stepId: string, title: string) => void;
  onSkipStep: (questId: string, stepId: string) => void;
  onSetBlocker: (questId: string, blocker?: string) => void;
  onUpdateProgress: (questId: string, progress: number) => void;
  className?: string;
}

export function FocusActionCard({
  quest,
  project,
  steps,
  progress,
  nextAction,
  onCompleteStep,
  onCreateStep,
  onMakeStepSmaller,
  onSkipStep,
  onSetBlocker,
  onUpdateProgress,
  className,
}: FocusActionCardProps) {
  const [showUnstuckDialog, setShowUnstuckDialog] = React.useState(false);
  const [showProgressSelector, setShowProgressSelector] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const incompleteSteps = steps.filter((s) => s.status !== "completed");
  const completedSteps = steps.filter((s) => s.status === "completed");
  const firstIncompleteStep = incompleteSteps.length > 0 ? incompleteSteps[0] : null;

  const currentStepNumber = firstIncompleteStep
    ? steps.findIndex((s) => s.id === firstIncompleteStep.id) + 1
    : null;

  // Up to 2 upcoming steps after the current one
  const upcomingSteps = incompleteSteps.slice(1, 3);

  const handleStepComplete = () => {
    if (!firstIncompleteStep) return;
    setIsCompleting(true);
    setTimeout(() => {
      onCompleteStep(firstIncompleteStep.id);
      setIsCompleting(false);
    }, 200);
  };

  const handleMakeSmaller = (tinyTitle: string) => {
    if (firstIncompleteStep) {
      onMakeStepSmaller(quest.id, firstIncompleteStep.id, tinyTitle);
    } else {
      onCreateStep({
        questId: quest.id,
        title: tinyTitle,
        isTiny: true,
      });
    }
  };

  const handleSkip = () => {
    if (firstIncompleteStep) {
      onSkipStep(quest.id, firstIncompleteStep.id);
    }
  };

  const handleParkBlocker = (blockerText: string) => {
    onSetBlocker(quest.id, blockerText);
  };

  return (
    <>
      <div
        className={cn(
          "bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all shadow-sm",
          className
        )}
      >
        {/* Quest header metadata */}
        <div className="space-y-2 border-b border-[#27272a] pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#71717a] uppercase">
                ACTIVE OBJECTIVE
              </span>
              {project && (
                <span className="text-xs text-[#a1a1aa] flex items-center gap-1 font-mono">
                  <span>/</span>
                  <span className="text-white/80 truncate max-w-[160px]">{project.name}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa]">
                {quest.priority} PRIORITY
              </span>
              <StatusBadge status="focus" label="FOCUSED" size="sm" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa] leading-snug">
            {quest.title}
          </h2>
        </div>

        {/* Blocker alert preview if exists */}
        {quest.blocker && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  ACTIVE BLOCKER:
                </span>
                <p className="text-xs text-amber-100 truncate">{quest.blocker}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUnstuckDialog(true)}
              className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white cursor-pointer shrink-0 h-7 px-2.5"
            >
              Work Around It
            </Button>
          </div>
        )}

        {/* Centerpiece: Next Action Box */}
        <div className="bg-[#09090b] border-2 border-white/30 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                NEXT ACTION
              </span>
            </div>

            {currentStepNumber && steps.length > 0 && (
              <span className="text-[10px] font-mono font-semibold text-[#a1a1aa] px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                STEP {currentStepNumber} OF {steps.length}
              </span>
            )}
          </div>

          {/* Action text */}
          <div className="space-y-1">
            <p className="text-lg sm:text-xl font-semibold text-white tracking-tight leading-snug">
              {firstIncompleteStep ? firstIncompleteStep.title : nextAction || "Continue Quest progress"}
            </p>
            {firstIncompleteStep?.isTiny && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-semibold">
                <Zap className="w-3 h-3" />
                MICRO-STEP
              </span>
            )}
          </div>

          {/* Action triggers */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {firstIncompleteStep ? (
              <Button
                type="button"
                size="default"
                onClick={handleStepComplete}
                disabled={isCompleting}
                className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-sm cursor-pointer shadow-sm py-5 px-6 transition-all"
              >
                <Check className="w-4 h-4 mr-2" />
                {isCompleting ? "Completing..." : "Complete Step"}
              </Button>
            ) : (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#a1a1aa] font-mono">
                    Manual progress adjuster:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowProgressSelector((prev) => !prev)}
                    className="text-xs font-mono text-white underline cursor-pointer hover:text-[#a1a1aa]"
                  >
                    {showProgressSelector ? "Hide" : "Update Progress"}
                  </button>
                </div>

                {showProgressSelector && (
                  <div className="flex items-center gap-2 pt-1">
                    {[25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          onUpdateProgress(quest.id, val);
                          setShowProgressSelector(false);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex-1",
                          progress === val
                            ? "bg-white text-black border-white"
                            : "bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-white"
                        )}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setShowUnstuckDialog(true)}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 cursor-pointer text-xs h-10 px-3 shrink-0 font-medium"
            >
              <LifeBuoy className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              I'm Stuck
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#71717a]">
              {steps.length > 0
                ? `Overall Progress (${completedSteps.length}/${steps.length} steps)`
                : "Quest Progress"}
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mini Step Queue (Up to 2 upcoming) */}
        {upcomingSteps.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
              UP NEXT
            </span>
            <div className="space-y-1.5">
              {upcomingSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa]"
                >
                  <span className="w-2 h-2 rounded-full border border-[#71717a] shrink-0" />
                  <span className="truncate">{step.title}</span>
                  {step.isTiny && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono ml-auto shrink-0">
                      TINY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unstuck Mode Dialog */}
      <UnstuckDialog
        open={showUnstuckDialog}
        onOpenChange={setShowUnstuckDialog}
        quest={quest}
        currentActionTitle={firstIncompleteStep ? firstIncompleteStep.title : nextAction}
        firstIncompleteStep={firstIncompleteStep}
        onMakeSmaller={handleMakeSmaller}
        onAddTinyStep={(title) =>
          onCreateStep({
            questId: quest.id,
            title,
            isTiny: true,
          })
        }
        onSkipStep={handleSkip}
        onParkBlocker={handleParkBlocker}
      />
    </>
  );
}
