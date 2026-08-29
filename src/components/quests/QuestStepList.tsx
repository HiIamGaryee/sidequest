import * as React from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Split,
  LifeBuoy,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestStepItem } from "./QuestStepItem";
import { AddQuestStep } from "./AddQuestStep";
import { BreakItDownDialog } from "./BreakItDownDialog";
import { UnstuckDialog } from "./UnstuckDialog";
import { BlockerAlert } from "./BlockerAlert";
import { useQuests } from "@/hooks/useQuests";
import type { Quest, QuestStep } from "@/types/quest";
import { cn } from "@/lib/utils";

export interface QuestStepListProps {
  quest: Quest;
  className?: string;
  onCompleteQuest?: (questId: string) => void;
}

export function QuestStepList({
  quest,
  className,
  onCompleteQuest,
}: QuestStepListProps) {
  const {
    getQuestSteps,
    createQuestStep,
    updateQuestStep,
    deleteQuestStep,
    completeQuestStep,
    reopenQuestStep,
    moveQuestStep,
    makeStepSmaller,
    skipQuestStep,
    setQuestBlocker,
    getQuestNextAction,
  } = useQuests();

  const [showBreakdownDialog, setShowBreakdownDialog] = React.useState(false);
  const [showUnstuckDialog, setShowUnstuckDialog] = React.useState(false);
  const [showCompletedSteps, setShowCompletedSteps] = React.useState(false);

  const steps = getQuestSteps(quest.id);
  const incompleteSteps = steps.filter((s) => s.status !== "completed");
  const completedSteps = steps.filter((s) => s.status === "completed");
  const isQuestCompleted = quest.status === "completed";
  const allStepsCompleted = steps.length > 0 && incompleteSteps.length === 0;

  const currentNextAction = getQuestNextAction(quest);
  const firstIncompleteStep = incompleteSteps.length > 0 ? incompleteSteps[0] : null;

  const handleAddStep = (title: string, isTiny: boolean) => {
    createQuestStep({
      questId: quest.id,
      title,
      isTiny,
    });
  };

  const handleAddMultipleSteps = (newSteps: { title: string; isTiny: boolean }[]) => {
    newSteps.forEach((s) => {
      createQuestStep({
        questId: quest.id,
        title: s.title,
        isTiny: s.isTiny,
      });
    });
  };

  const handleMakeSmaller = (tinyTitle: string) => {
    if (firstIncompleteStep) {
      makeStepSmaller(quest.id, firstIncompleteStep.id, tinyTitle);
    } else {
      createQuestStep({
        questId: quest.id,
        title: tinyTitle,
        isTiny: true,
      });
    }
  };

  const handleSkipStep = () => {
    if (firstIncompleteStep) {
      skipQuestStep(quest.id, firstIncompleteStep.id);
    }
  };

  const handleParkBlocker = (blockerText: string) => {
    setQuestBlocker(quest.id, blockerText);
  };

  return (
    <div className={cn("space-y-3.5", className)}>
      {/* Blocker note alert banner if present */}
      {quest.blocker && (
        <BlockerAlert
          questId={quest.id}
          blocker={quest.blocker}
          onUpdateBlocker={setQuestBlocker}
        />
      )}

      {/* Header bar with count and actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#fafafa] uppercase tracking-wider">
            TASK BREAKDOWN
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa]">
            {completedSteps.length} / {steps.length} done
          </span>
        </div>

        {!isQuestCompleted && (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUnstuckDialog(true)}
              className="h-6 text-[11px] px-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 cursor-pointer"
            >
              <LifeBuoy className="w-3 h-3 mr-1 text-amber-400" />
              I'm Stuck
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowBreakdownDialog(true)}
              className="h-6 text-[11px] px-2 border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] cursor-pointer"
            >
              <Split className="w-3 h-3 mr-1 text-white/80" />
              Break It Down
            </Button>
          </div>
        )}
      </div>

      {/* Empty State: No steps yet */}
      {steps.length === 0 && !isQuestCompleted && (
        <div className="p-4 rounded-lg bg-[#09090b] border border-dashed border-[#27272a] text-center space-y-2.5">
          <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-sm mx-auto">
            This quest doesn't have broken-down steps yet. Breaking it down removes cognitive friction.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowBreakdownDialog(true)}
              className="h-7 text-xs border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-white font-medium cursor-pointer"
            >
              <Split className="w-3.5 h-3.5 mr-1.5" />
              Break It Down
            </Button>
          </div>
        </div>
      )}

      {/* All steps completed banner */}
      {allStepsCompleted && !isQuestCompleted && (
        <div className="p-3.5 rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 shrink-0 text-[#22c55e]" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">
                All steps completed!
              </p>
              <p className="text-[11px] text-[#22c55e]/80 truncate">
                Objective looks suspiciously finished. Ready to close this quest out?
              </p>
            </div>
          </div>

          {onCompleteQuest && (
            <Button
              type="button"
              size="sm"
              onClick={() => onCompleteQuest(quest.id)}
              className="h-7 text-xs bg-white text-black hover:bg-[#e4e4e7] font-bold shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-black" />
              Complete Quest
            </Button>
          )}
        </div>
      )}

      {/* Active (Incomplete) Steps */}
      {incompleteSteps.length > 0 && (
        <div className="space-y-1.5">
          {incompleteSteps.map((step, index) => (
            <QuestStepItem
              key={step.id}
              step={step}
              index={index}
              totalSteps={incompleteSteps.length}
              isFirstIncomplete={index === 0}
              onComplete={completeQuestStep}
              onReopen={reopenQuestStep}
              onUpdateTitle={(id, title) => updateQuestStep(id, { title })}
              onDelete={deleteQuestStep}
              onMoveUp={
                index > 0
                  ? () => moveQuestStep(step.id, "up")
                  : undefined
              }
              onMoveDown={
                index < incompleteSteps.length - 1
                  ? () => moveQuestStep(step.id, "down")
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Add New Step Input (only if quest not completed) */}
      {!isQuestCompleted && (
        <AddQuestStep questId={quest.id} onAddStep={handleAddStep} />
      )}

      {/* Completed Steps Collapsible Section */}
      {completedSteps.length > 0 && (
        <div className="pt-2 border-t border-[#27272a]/60 space-y-2">
          <button
            type="button"
            onClick={() => setShowCompletedSteps(!showCompletedSteps)}
            className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors cursor-pointer select-none font-mono"
          >
            {showCompletedSteps ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>
              {completedSteps.length} Completed step{completedSteps.length > 1 ? "s" : ""}
            </span>
          </button>

          {showCompletedSteps && (
            <div className="space-y-1.5 pl-2">
              {completedSteps.map((step, index) => (
                <QuestStepItem
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={completedSteps.length}
                  onComplete={completeQuestStep}
                  onReopen={reopenQuestStep}
                  onUpdateTitle={(id, title) => updateQuestStep(id, { title })}
                  onDelete={deleteQuestStep}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <BreakItDownDialog
        open={showBreakdownDialog}
        onOpenChange={setShowBreakdownDialog}
        quest={quest}
        onAddSteps={handleAddMultipleSteps}
      />

      <UnstuckDialog
        open={showUnstuckDialog}
        onOpenChange={setShowUnstuckDialog}
        quest={quest}
        currentActionTitle={currentNextAction}
        firstIncompleteStep={firstIncompleteStep}
        onMakeSmaller={handleMakeSmaller}
        onAddTinyStep={(title) => handleAddStep(title, true)}
        onSkipStep={handleSkipStep}
        onParkBlocker={handleParkBlocker}
      />
    </div>
  );
}
